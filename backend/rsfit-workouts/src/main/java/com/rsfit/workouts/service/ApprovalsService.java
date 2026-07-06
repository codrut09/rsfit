package com.rsfit.workouts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rsfit.coaching.service.CoachingService;
import com.rsfit.workouts.entity.PlanModificationRecommendation;
import com.rsfit.workouts.entity.WorkoutLog;
import com.rsfit.workouts.entity.WorkoutLogSet;
import com.rsfit.workouts.repository.PlanModificationRecommendationRepository;
import com.rsfit.workouts.repository.WorkoutLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class ApprovalsService {

    @Autowired
    private PlanModificationRecommendationRepository recommendationRepository;

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private CoachingService coachingService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PlanModificationRecommendation createRecommendation(
            UUID coachId, UUID clientId, UUID planId, UUID logId, String proposedChangesJson) {

        if (!coachingService.isLinked(coachId, clientId)) {
            throw new SecurityException("Coach does not have an active association with this client");
        }

        PlanModificationRecommendation rec = PlanModificationRecommendation.builder()
                .coachId(coachId)
                .clientId(clientId)
                .planId(planId)
                .logId(logId)
                .proposedChanges(proposedChangesJson)
                .status("PENDING_APPROVAL")
                .build();

        return recommendationRepository.save(rec);
    }

    public List<PlanModificationRecommendation> getPendingRecommendationsForClient(UUID clientId) {
        return recommendationRepository.findByClientIdAndStatus(clientId, "PENDING_APPROVAL");
    }

    public PlanModificationRecommendation respondToRecommendation(UUID recommendationId, String action) {
        PlanModificationRecommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));

        if (!"PENDING_APPROVAL".equals(rec.getStatus())) {
            throw new IllegalArgumentException("Recommendation has already been processed");
        }

        if ("APPROVE".equalsIgnoreCase(action)) {
            rec.setStatus("APPROVED");

            if (rec.getLogId() != null) {
                applyLogModification(rec.getLogId(), rec.getProposedChanges());
            }
        } else if ("REJECT".equalsIgnoreCase(action)) {
            rec.setStatus("REJECTED");
        } else {
            throw new IllegalArgumentException("Invalid action: must be APPROVE or REJECT");
        }

        return recommendationRepository.save(rec);
    }

    private void applyLogModification(UUID logId, String proposedChangesJson) {
        try {
            WorkoutLog log = workoutLogRepository.findById(logId)
                    .orElseThrow(() -> new IllegalArgumentException("Target log not found"));

            Map<String, Object> changes = objectMapper.readValue(proposedChangesJson, Map.class);
            String action = (String) changes.get("action");
            String targetExercise = (String) changes.get("targetExercise");

            if ("ADJUST_SETS_REPS".equalsIgnoreCase(action)) {
                Integer setsVal = (Integer) changes.get("targetSets");
                Integer repsVal = (Integer) changes.get("targetReps");
                BigDecimal weightVal = new BigDecimal(changes.get("targetWeight").toString());

                log.getSets().removeIf(set -> set.getExerciseName().equalsIgnoreCase(targetExercise));
                for (int i = 0; i < setsVal; i++) {
                    WorkoutLogSet set = WorkoutLogSet.builder()
                            .workoutLog(log)
                            .exerciseName(targetExercise)
                            .setIndex(i)
                            .reps(repsVal)
                            .weight(weightVal)
                            .completed(true)
                            .build();
                    log.getSets().add(set);
                }
                workoutLogRepository.save(log);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to apply workout log modifications", e);
        }
    }
}

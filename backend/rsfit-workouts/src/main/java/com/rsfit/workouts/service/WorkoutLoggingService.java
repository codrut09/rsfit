package com.rsfit.workouts.service;

import com.rsfit.workouts.entity.WorkoutLog;
import com.rsfit.workouts.entity.WorkoutLogSet;
import com.rsfit.workouts.repository.WorkoutLogRepository;
import com.rsfit.workouts.repository.WorkoutLogSetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WorkoutLoggingService {

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private WorkoutLogSetRepository workoutLogSetRepository;

    public WorkoutLog startWorkoutLog(UUID clientId, UUID planId, String name) {
        WorkoutLog log = WorkoutLog.builder()
                .clientId(clientId)
                .planId(planId)
                .name(name)
                .status("IN_PROGRESS")
                .startTime(LocalDateTime.now())
                .build();
        return workoutLogRepository.save(log);
    }

    public void upsertSets(UUID logId, String exerciseName, List<WorkoutLogSet> setsInput) {
        WorkoutLog log = workoutLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("Workout log not found"));

        if (!"IN_PROGRESS".equals(log.getStatus())) {
            throw new IllegalArgumentException("Cannot update sets on a completed workout");
        }

        // Remove existing sets for the same exercise first
        log.getSets().removeIf(set -> set.getExerciseName().equalsIgnoreCase(exerciseName));

        for (WorkoutLogSet setInput : setsInput) {
            setInput.setWorkoutLog(log);
            setInput.setExerciseName(exerciseName);
            log.getSets().add(setInput);
        }

        workoutLogRepository.save(log);
    }

    public WorkoutLog finishWorkoutLog(UUID logId) {
        WorkoutLog log = workoutLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("Workout log not found"));

        if ("COMPLETED".equals(log.getStatus())) {
            throw new IllegalArgumentException("Workout log already completed");
        }

        log.setStatus("COMPLETED");
        log.setEndTime(LocalDateTime.now());
        return workoutLogRepository.save(log);
    }

    public List<WorkoutLog> getWorkoutLogsByClient(UUID clientId) {
        return workoutLogRepository.findByClientId(clientId);
    }
}

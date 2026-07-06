package com.rsfit.coaching.service;

import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.coaching.entity.CoachClientRelationship;
import com.rsfit.coaching.repository.CoachClientRelationshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CoachingService {

    @Autowired
    private CoachClientRelationshipRepository relationshipRepository;

    @Autowired
    private UserRepository userRepository;

    public CoachClientRelationship inviteClient(UUID coachId, String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new IllegalArgumentException("No user found with the email: " + clientEmail));

        if (client.getRole().name().equals("COACH")) {
            throw new IllegalArgumentException("Cannot invite another coach as a client");
        }

        if (relationshipRepository.findByCoachIdAndClientId(coachId, client.getId()).isPresent()) {
            throw new IllegalArgumentException("Relationship already exists or invitation pending");
        }

        CoachClientRelationship rel = CoachClientRelationship.builder()
                .coachId(coachId)
                .clientId(client.getId())
                .status("PENDING")
                .build();

        return relationshipRepository.save(rel);
    }

    public CoachClientRelationship acceptInvitation(UUID clientId, UUID coachId) {
        CoachClientRelationship rel = relationshipRepository.findByCoachIdAndClientId(coachId, clientId)
                .orElseThrow(() -> new IllegalArgumentException("No invitation found from this coach"));

        if (!"PENDING".equals(rel.getStatus())) {
            throw new IllegalArgumentException("Invitation is not in PENDING status");
        }

        rel.setStatus("ACTIVE");
        return relationshipRepository.save(rel);
    }

    public List<CoachClientRelationship> getClientsForCoach(UUID coachId) {
        return relationshipRepository.findByCoachId(coachId);
    }

    public List<CoachClientRelationship> getCoachesForClient(UUID clientId) {
        return relationshipRepository.findByClientId(clientId);
    }

    public boolean isLinked(UUID coachId, UUID clientId) {
        return relationshipRepository.existsByCoachIdAndClientIdAndStatus(coachId, clientId, "ACTIVE");
    }
}

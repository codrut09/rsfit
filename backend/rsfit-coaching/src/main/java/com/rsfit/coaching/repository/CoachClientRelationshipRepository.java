package com.rsfit.coaching.repository;

import com.rsfit.coaching.entity.CoachClientRelationship;
import com.rsfit.coaching.entity.CoachClientRelationshipId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CoachClientRelationshipRepository extends JpaRepository<CoachClientRelationship, CoachClientRelationshipId> {
    List<CoachClientRelationship> findByCoachId(UUID coachId);
    List<CoachClientRelationship> findByClientId(UUID clientId);
    Optional<CoachClientRelationship> findByCoachIdAndClientId(UUID coachId, UUID clientId);
    boolean existsByCoachIdAndClientIdAndStatus(UUID coachId, UUID clientId, String status);
}

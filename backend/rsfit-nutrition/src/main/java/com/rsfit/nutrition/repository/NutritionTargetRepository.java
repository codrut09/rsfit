package com.rsfit.nutrition.repository;

import com.rsfit.nutrition.entity.NutritionTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NutritionTargetRepository extends JpaRepository<NutritionTarget, UUID> {
    Optional<NutritionTarget> findByClientIdAndIsActive(UUID clientId, Boolean isActive);
    List<NutritionTarget> findByClientId(UUID clientId);
}

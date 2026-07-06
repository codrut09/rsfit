package com.rsfit.nutrition.repository;

import com.rsfit.nutrition.entity.NutritionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface NutritionLogRepository extends JpaRepository<NutritionLog, UUID> {
    List<NutritionLog> findByClientId(UUID clientId);

    @Query(value = "SELECT COALESCE(SUM(calories), 0) as calories, " +
            "COALESCE(SUM(protein), 0.0) as protein, " +
            "COALESCE(SUM(carbohydrates), 0.0) as carbohydrates, " +
            "COALESCE(SUM(fat), 0.0) as fat " +
            "FROM nutrition_logs " +
            "WHERE client_id = :clientId " +
            "AND CAST(logged_at AT TIME ZONE 'UTC' AT TIME ZONE :timezone AS DATE) = CAST(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE :timezone AS DATE)",
            nativeQuery = true)
    Map<String, Object> getDailyAggregates(@Param("clientId") UUID clientId, @Param("timezone") String timezone);
}

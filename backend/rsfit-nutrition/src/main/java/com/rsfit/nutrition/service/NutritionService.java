package com.rsfit.nutrition.service;

import com.rsfit.nutrition.entity.NutritionTarget;
import com.rsfit.nutrition.repository.NutritionLogRepository;
import com.rsfit.nutrition.repository.NutritionTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class NutritionService {

    @Autowired
    private NutritionLogRepository nutritionLogRepository;

    @Autowired
    private NutritionTargetRepository nutritionTargetRepository;

    public NutritionLog logMeal(UUID clientId, String foodName, int calories, BigDecimal protein, BigDecimal carbs, BigDecimal fat) {
        if (calories < 0 || protein.compareTo(BigDecimal.ZERO) < 0 || carbs.compareTo(BigDecimal.ZERO) < 0 || fat.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Calorie and macronutrient values must be positive numbers");
        }

        NutritionLog log = NutritionLog.builder()
                .clientId(clientId)
                .foodName(foodName)
                .calories(calories)
                .protein(protein)
                .carbohydrates(carbs)
                .fat(fat)
                .build();

        return nutritionLogRepository.save(log);
    }

    public Map<String, Object> getDailySummary(UUID clientId, String timezone) {
        Map<String, Object> response = new HashMap<>();

        Map<String, Object> aggregates = nutritionLogRepository.getDailyAggregates(clientId, timezone);
        response.put("aggregates", aggregates);

        Optional<NutritionTarget> targetOpt = nutritionTargetRepository.findByClientIdAndIsActive(clientId, true);
        if (targetOpt.isPresent()) {
            NutritionTarget target = targetOpt.get();
            Map<String, Object> targetsMap = new HashMap<>();
            targetsMap.put("calories", target.getTargetCalories());
            targetsMap.put("protein", target.getTargetProtein());
            targetsMap.put("carbohydrates", target.getTargetCarbs());
            targetsMap.put("fat", target.getTargetFat());
            response.put("targets", targetsMap);
        } else {
            response.put("targets", null);
        }

        return response;
    }

    public void updateActiveTarget(UUID clientId, int targetCalories, int targetProtein, int targetCarbs, int targetFat) {
        Optional<NutritionTarget> activeOpt = nutritionTargetRepository.findByClientIdAndIsActive(clientId, true);
        if (activeOpt.isPresent()) {
            NutritionTarget active = activeOpt.get();
            active.setIsActive(false);
            nutritionTargetRepository.save(active);
        }

        NutritionTarget newTarget = NutritionTarget.builder()
                .clientId(clientId)
                .targetCalories(targetCalories)
                .targetProtein(targetProtein)
                .targetCarbs(targetCarbs)
                .targetFat(targetFat)
                .isActive(true)
                .build();

        nutritionTargetRepository.save(newTarget);
    }
}

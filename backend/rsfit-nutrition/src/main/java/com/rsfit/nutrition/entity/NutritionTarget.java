package com.rsfit.nutrition.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nutrition_targets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "target_calories", nullable = false)
    private Integer targetCalories;

    @Column(name = "target_protein", nullable = false)
    private Integer targetProtein;

    @Column(name = "target_carbs", nullable = false)
    private Integer targetCarbs;

    @Column(name = "target_fat", nullable = false)
    private Integer targetFat;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
}

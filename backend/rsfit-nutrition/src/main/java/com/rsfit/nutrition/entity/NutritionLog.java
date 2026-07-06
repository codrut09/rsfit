package com.rsfit.nutrition.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nutrition_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(nullable = false)
    private Integer calories;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal protein;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal carbohydrates;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal fat;

    @Column(name = "logged_at", nullable = false, updatable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    protected void onCreate() {
        loggedAt = LocalDateTime.now();
    }
}

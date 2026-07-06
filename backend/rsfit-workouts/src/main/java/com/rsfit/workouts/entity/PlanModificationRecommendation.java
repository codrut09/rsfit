package com.rsfit.workouts.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "plan_modification_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanModificationRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "coach_id")
    private UUID coachId;

    @Column(name = "plan_id")
    private UUID planId;

    @Column(name = "log_id")
    private UUID logId;

    @Column(name = "proposed_changes", nullable = false, columnDefinition = "jsonb")
    private String proposedChanges; // JSON string payload representing changes

    @Column(nullable = false)
    private String status; // 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

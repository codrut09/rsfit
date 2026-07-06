package com.rsfit.coaching.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coach_client_relationship")
@IdClass(CoachClientRelationshipId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachClientRelationship {

    @Id
    @Column(name = "coach_id", nullable = false)
    private UUID coachId;

    @Id
    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(nullable = false)
    private String status; // 'PENDING', 'ACTIVE', 'TERMINATED'

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

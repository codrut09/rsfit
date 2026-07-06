package com.rsfit.workouts.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "workout_log_sets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "workoutLog")
public class WorkoutLogSet {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id", nullable = false)
    @JsonIgnore
    private WorkoutLog workoutLog;

    @Column(name = "exercise_name", nullable = false)
    private String exerciseName;

    @Column(name = "set_index", nullable = false)
    private Integer setIndex;

    @Column(nullable = false)
    private Integer reps;

    @Column(nullable = false)
    private BigDecimal weight;

    @Column(nullable = false)
    private Boolean completed;
}

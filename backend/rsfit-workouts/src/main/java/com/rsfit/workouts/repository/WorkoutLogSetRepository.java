package com.rsfit.workouts.repository;

import com.rsfit.workouts.entity.WorkoutLogSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WorkoutLogSetRepository extends JpaRepository<WorkoutLogSet, UUID> {
}

-- Enable UUID generation support in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'COACH', 'CLIENT'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: coach_client_relationship
CREATE TABLE IF NOT EXISTS coach_client_relationship (
    coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL, -- 'PENDING', 'ACTIVE', 'TERMINATED'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (coach_id, client_id)
);
CREATE INDEX IF NOT EXISTS idx_rel_client ON coach_client_relationship(client_id);

-- Table: workout_plans
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workout_plans_client ON workout_plans(client_id);

-- Table: workout_plan_exercises
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    exercise_name VARCHAR(128) NOT NULL,
    target_sets INTEGER NOT NULL,
    target_reps INTEGER NOT NULL,
    target_weight NUMERIC(5,2),
    display_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plan_ex_plan ON workout_plan_exercises(plan_id);

-- Table: workout_logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'IN_PROGRESS', 'COMPLETED'
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_workout_logs_client ON workout_logs(client_id);

-- Table: workout_log_sets
CREATE TABLE IF NOT EXISTS workout_log_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_name VARCHAR(128) NOT NULL,
    set_index INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    completed BOOLEAN DEFAULT TRUE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_log_sets_log ON workout_log_sets(log_id);

-- Table: plan_modification_recommendations
CREATE TABLE IF NOT EXISTS plan_modification_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES users(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
    proposed_changes JSONB NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mod_rec_client ON plan_modification_recommendations(client_id, status);

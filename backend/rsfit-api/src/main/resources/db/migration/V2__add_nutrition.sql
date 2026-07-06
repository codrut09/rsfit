-- Table: nutrition_logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (protein >= 0),
    carbohydrates NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (carbohydrates >= 0),
    fat NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (fat >= 0),
    logged_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nut_logs_client_date ON nutrition_logs(client_id, logged_at);

-- Table: nutrition_targets
CREATE TABLE IF NOT EXISTS nutrition_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_calories INTEGER NOT NULL CHECK (target_calories > 0),
    target_protein INTEGER NOT NULL CHECK (target_protein > 0),
    target_carbs INTEGER NOT NULL CHECK (target_carbs > 0),
    target_fat INTEGER NOT NULL CHECK (target_fat > 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nut_targets_client ON nutrition_targets(client_id) WHERE is_active = TRUE;

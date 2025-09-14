-- Добавляем колонку factor_scores в таблицу test_attempts
ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS factor_scores JSONB DEFAULT '{}'::jsonb;

-- Добавляем также другие полезные колонки для психологических тестов
ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS factor_percentiles JSONB DEFAULT '{}'::jsonb;

ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS personality_profile JSONB DEFAULT '{}'::jsonb;

-- Добавляем колонку is_correct в user_answers если её нет
ALTER TABLE user_answers 
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;

-- Добавляем колонку max_points в user_answers если её нет  
ALTER TABLE user_answers 
ADD COLUMN IF NOT EXISTS max_points DECIMAL(5,2) DEFAULT 0;

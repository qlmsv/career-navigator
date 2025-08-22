-- Обновление схемы test_results для соответствия коду
-- Добавляем новые поля и переименовываем существующие

-- Добавляем новые поля если их нет
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS big_five_scores JSONB,
ADD COLUMN IF NOT EXISTS dominant_archetype TEXT,
ADD COLUMN IF NOT EXISTS all_answers JSONB,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS analysis_time INTEGER,
ADD COLUMN IF NOT EXISTS test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Удаляем старые поля которые больше не используются
ALTER TABLE test_results 
DROP COLUMN IF EXISTS test_type,
DROP COLUMN IF EXISTS test_version,
DROP COLUMN IF EXISTS answers,
DROP COLUMN IF EXISTS raw_scores,
DROP COLUMN IF EXISTS normalized_scores,
DROP COLUMN IF EXISTS percentiles,
DROP COLUMN IF EXISTS archetype,
DROP COLUMN IF EXISTS personality_traits,
DROP COLUMN IF EXISTS professional_matches,
DROP COLUMN IF EXISTS recommendations,
DROP COLUMN IF EXISTS completion_time,
DROP COLUMN IF EXISTS confidence_level;

-- Обновляем индекс
DROP INDEX IF EXISTS idx_test_results_type;
CREATE INDEX IF NOT EXISTS idx_test_results_user_date ON test_results(user_id, test_date);

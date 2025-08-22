-- ОТКЛЮЧЕНИЕ RLS для устранения проблем с доступом
-- Выполните этот код в Supabase SQL Editor

-- Отключаем RLS на всех таблицах
ALTER TABLE digital_skill_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE digital_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE professions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Public read access for skill categories" ON digital_skill_categories;
DROP POLICY IF EXISTS "Public read access for skills" ON digital_skills;
DROP POLICY IF EXISTS "Public read access for regions" ON regions;
DROP POLICY IF EXISTS "Public read access for professions" ON professions;
DROP POLICY IF EXISTS "Public read access for learning resources" ON learning_resources;
DROP POLICY IF EXISTS "Users can manage their own assessments" ON user_skill_assessments;
DROP POLICY IF EXISTS "Users can manage their own skill scores" ON user_skill_scores;

DROP POLICY IF EXISTS "allow_read_categories" ON digital_skill_categories;
DROP POLICY IF EXISTS "allow_read_skills" ON digital_skills;
DROP POLICY IF EXISTS "allow_read_regions" ON regions;
DROP POLICY IF EXISTS "allow_read_professions" ON professions;
DROP POLICY IF EXISTS "allow_read_resources" ON learning_resources;
DROP POLICY IF EXISTS "users_own_assessments" ON user_skill_assessments;
DROP POLICY IF EXISTS "users_own_scores" ON user_skill_scores;

-- Проверяем результат
SELECT 
  'RLS отключен для всех таблиц!' as status,
  (SELECT COUNT(*) FROM digital_skill_categories) as categories_count,
  (SELECT COUNT(*) FROM digital_skills) as skills_count,
  (SELECT COUNT(*) FROM regions) as regions_count,
  (SELECT COUNT(*) FROM professions) as professions_count;

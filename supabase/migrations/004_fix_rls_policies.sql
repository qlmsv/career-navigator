-- 🔧 ИСПРАВЛЕНИЕ ROW LEVEL SECURITY ПОЛИТИК
-- Ошибка: new row violates row-level security policy for table "resume_analysis"

-- 1. Проверяем и исправляем RLS политики для resume_analysis
DROP POLICY IF EXISTS "Users can insert their own resume analysis" ON resume_analysis;
DROP POLICY IF EXISTS "Users can view their own resume analysis" ON resume_analysis;
DROP POLICY IF EXISTS "Users can update their own resume analysis" ON resume_analysis;

-- Создаем правильные RLS политики для resume_analysis
CREATE POLICY "Users can insert their own resume analysis"
  ON resume_analysis FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own resume analysis"
  ON resume_analysis FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own resume analysis"
  ON resume_analysis FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Исправляем RLS политики для work_experience
DROP POLICY IF EXISTS "Users can manage their own work experience" ON work_experience;

CREATE POLICY "Users can insert their own work experience"
  ON work_experience FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own work experience"
  ON work_experience FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own work experience"
  ON work_experience FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own work experience"
  ON work_experience FOR DELETE
  USING (user_id = auth.uid());

-- 3. Исправляем RLS политики для education_history
DROP POLICY IF EXISTS "Users can manage their own education history" ON education_history;

CREATE POLICY "Users can insert their own education history"
  ON education_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own education history"
  ON education_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own education history"
  ON education_history FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own education history"
  ON education_history FOR DELETE
  USING (user_id = auth.uid());

-- 4. Проверяем что RLS включен для всех таблиц
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 5. Добавляем политику для service role (для API operations)
-- Это позволит серверному коду работать с таблицами
CREATE POLICY "Service role can manage all data"
  ON resume_analysis FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all work experience"
  ON work_experience FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all education history"
  ON education_history FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Проверяем результат
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'resume_analysis', 'work_experience', 'education_history', 'test_results');

-- Проверяем политики
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'resume_analysis', 'work_experience', 'education_history', 'test_results')
ORDER BY tablename, policyname;

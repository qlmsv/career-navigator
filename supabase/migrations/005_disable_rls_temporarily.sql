-- 🔧 ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ RLS ДЛЯ ТЕСТИРОВАНИЯ
-- После того как всё заработает, включим обратно с правильными политиками

-- Отключаем RLS для проблемных таблиц
ALTER TABLE resume_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience DISABLE ROW LEVEL SECURITY;
ALTER TABLE education_history DISABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'resume_analysis', 'work_experience', 'education_history', 'test_results');

-- 🔧 ИСПРАВЛЕНИЕ FOREIGN KEY CONSTRAINTS
-- Проблема: Key (user_id) is not present in table "users"
-- Решение: Убедиться что все ссылки идут на auth.users, а не на кастомную таблицу users

-- 1. Проверяем текущие constraint'ы
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_profiles', 'resume_analysis', 'work_experience', 'education_history', 'test_results');

-- 2. Удаляем проблемные constraint'ы если они ссылаются на неправильную таблицу
DO $$ 
BEGIN
  -- Проверяем и исправляем resume_analysis
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'resume_analysis_user_id_fkey' 
    AND table_name = 'resume_analysis'
  ) THEN
    ALTER TABLE resume_analysis DROP CONSTRAINT resume_analysis_user_id_fkey;
  END IF;
  
  -- Проверяем и исправляем work_experience  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'work_experience_user_id_fkey' 
    AND table_name = 'work_experience'
  ) THEN
    ALTER TABLE work_experience DROP CONSTRAINT work_experience_user_id_fkey;
  END IF;
  
  -- Проверяем и исправляем education_history
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'education_history_user_id_fkey' 
    AND table_name = 'education_history'
  ) THEN
    ALTER TABLE education_history DROP CONSTRAINT education_history_user_id_fkey;
  END IF;
  
  -- Проверяем и исправляем test_results
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'test_results_user_id_fkey' 
    AND table_name = 'test_results'
  ) THEN
    ALTER TABLE test_results DROP CONSTRAINT test_results_user_id_fkey;
  END IF;
  
  -- Проверяем и исправляем user_profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_user_id_fkey' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_user_id_fkey;
  END IF;
END $$;

-- 3. Создаем правильные constraint'ы, ссылающиеся на auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE resume_analysis 
ADD CONSTRAINT resume_analysis_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE work_experience 
ADD CONSTRAINT work_experience_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE education_history 
ADD CONSTRAINT education_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE test_results 
ADD CONSTRAINT test_results_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Проверяем результат
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_profiles', 'resume_analysis', 'work_experience', 'education_history', 'test_results')
ORDER BY tc.table_name;

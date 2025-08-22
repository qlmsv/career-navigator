-- 🔧 ВРЕМЕННОЕ УДАЛЕНИЕ FOREIGN KEY CONSTRAINTS
-- Для быстрого исправления ошибки пока разбираемся с правильной схемой

-- Удаляем все foreign key constraints временно
DO $$ 
BEGIN
  -- resume_analysis
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%resume_analysis%user_id%'
    AND table_name = 'resume_analysis'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    EXECUTE 'ALTER TABLE resume_analysis DROP CONSTRAINT ' || (
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%resume_analysis%user_id%'
      AND table_name = 'resume_analysis'
      AND constraint_type = 'FOREIGN KEY'
      LIMIT 1
    );
  END IF;
  
  -- work_experience
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%work_experience%user_id%'
    AND table_name = 'work_experience'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    EXECUTE 'ALTER TABLE work_experience DROP CONSTRAINT ' || (
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%work_experience%user_id%'
      AND table_name = 'work_experience'
      AND constraint_type = 'FOREIGN KEY'
      LIMIT 1
    );
  END IF;
  
  -- education_history
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%education_history%user_id%'
    AND table_name = 'education_history'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    EXECUTE 'ALTER TABLE education_history DROP CONSTRAINT ' || (
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%education_history%user_id%'
      AND table_name = 'education_history'
      AND constraint_type = 'FOREIGN KEY'
      LIMIT 1
    );
  END IF;
  
  -- test_results
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%test_results%user_id%'
    AND table_name = 'test_results'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    EXECUTE 'ALTER TABLE test_results DROP CONSTRAINT ' || (
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%test_results%user_id%'
      AND table_name = 'test_results'
      AND constraint_type = 'FOREIGN KEY'
      LIMIT 1
    );
  END IF;
  
  -- user_profiles (оставляем, он должен работать правильно)
  
END $$;

-- Проверяем что удалилось
SELECT 
  tc.table_name, 
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('resume_analysis', 'work_experience', 'education_history', 'test_results')
  AND tc.constraint_name LIKE '%user_id%';

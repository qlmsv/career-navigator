-- 🔧 ИСПРАВЛЕНИЕ USER_PROFILES FOREIGN KEY CONSTRAINT
-- Проблема: user_profiles таблица тоже имеет неправильный foreign key constraint

-- Удаляем проблемный constraint для user_profiles
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%user_profiles%user_id%'
    AND table_name = 'user_profiles'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    EXECUTE 'ALTER TABLE user_profiles DROP CONSTRAINT ' || (
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%user_profiles%user_id%'
      AND table_name = 'user_profiles'
      AND constraint_type = 'FOREIGN KEY'
      LIMIT 1
    );
  END IF;
END $$;

-- Проверяем результат
SELECT 
  tc.table_name, 
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'user_profiles'
  AND tc.constraint_name LIKE '%user_id%';

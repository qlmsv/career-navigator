-- 🔧 ИСПРАВЛЕНИЕ ТРИГГЕРОВ - если нужно пересоздать
-- Применять только если 002_safe_migration.sql не сработала

-- Удаляем существующие триггеры (если есть)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS calculate_completeness_on_update ON user_profiles;

-- Пересоздаем функции
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := calculate_profile_completeness(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_row user_profiles)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 20;
  filled_fields INTEGER := 0;
BEGIN
  -- Подсчет заполненных важных полей
  IF profile_row.full_name IS NOT NULL AND profile_row.full_name != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.phone IS NOT NULL AND profile_row.phone != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.location IS NOT NULL AND profile_row.location != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.current_position IS NOT NULL AND profile_row.current_position != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.current_company IS NOT NULL AND profile_row.current_company != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.industry IS NOT NULL AND profile_row.industry != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.experience_level IS NOT NULL AND profile_row.experience_level != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.total_experience IS NOT NULL AND profile_row.total_experience != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.salary_expectations IS NOT NULL AND profile_row.salary_expectations != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.university IS NOT NULL AND profile_row.university != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.specialization IS NOT NULL AND profile_row.specialization != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.graduation_year IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.key_skills IS NOT NULL AND jsonb_array_length(profile_row.key_skills) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.languages IS NOT NULL AND jsonb_array_length(profile_row.languages) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.work_format IS NOT NULL AND profile_row.work_format != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.career_goals IS NOT NULL AND profile_row.career_goals != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.age IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.employment_type IS NOT NULL AND profile_row.employment_type != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.degree IS NOT NULL AND profile_row.degree != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_row.technical_skills IS NOT NULL AND jsonb_array_length(profile_row.technical_skills) > 0 THEN filled_fields := filled_fields + 1; END IF;
  
  RETURN ROUND((filled_fields::DECIMAL / total_fields) * 100);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры заново
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER calculate_completeness_on_update
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_completeness();

-- Проверка что триггеры созданы
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid::regclass::text = 'user_profiles'
ORDER BY tgname;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Обновленная таблица пользователей (если нужно расширить базовую)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 👤 ЛИЧНАЯ ИНФОРМАЦИЯ
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  phone TEXT,
  location TEXT,
  age INTEGER,
  birth_date DATE,
  
  -- 💼 ПРОФЕССИОНАЛЬНАЯ ИНФОРМАЦИЯ
  current_position TEXT,
  current_company TEXT,
  industry TEXT,
  experience_level TEXT CHECK (experience_level IN ('Junior', 'Middle', 'Senior', 'Lead', 'Executive')),
  total_experience TEXT,
  total_experience_months INTEGER,
  salary_expectations TEXT,
  employment_type TEXT,
  work_status TEXT,
  
  -- 🎓 ОБРАЗОВАНИЕ
  university TEXT,
  degree TEXT,
  specialization TEXT,
  graduation_year INTEGER,
  grade TEXT,
  education_level TEXT,
  
  -- 🛠️ НАВЫКИ (JSON поля)
  key_skills JSONB DEFAULT '[]'::jsonb,
  technical_skills JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  soft_skills JSONB DEFAULT '[]'::jsonb,
  tools_and_platforms JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- ⚙️ ПРЕДПОЧТЕНИЯ
  work_format TEXT CHECK (work_format IN ('remote', 'office', 'hybrid')),
  relocation_readiness TEXT,
  career_goals TEXT,
  development_areas JSONB DEFAULT '[]'::jsonb,
  avoided_tasks JSONB DEFAULT '[]'::jsonb,
  preferred_industries JSONB DEFAULT '[]'::jsonb,
  
  -- 📊 МЕТАДАННЫЕ
  resume_uploaded BOOLEAN DEFAULT FALSE,
  resume_analyzed BOOLEAN DEFAULT FALSE,
  profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'resume', 'social', 'import')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ограничения
  UNIQUE(user_id)
);

-- Анализ резюме
CREATE TABLE IF NOT EXISTS resume_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Метаданные файла
  original_filename TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  
  -- Извлеченные данные
  extracted_text TEXT,
  analysis_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Обработка
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_duration INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Опыт работы
CREATE TABLE IF NOT EXISTS work_experience (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  duration_months INTEGER,
  location TEXT,
  industry TEXT,
  
  description TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  technologies JSONB DEFAULT '[]'::jsonb,
  team_size INTEGER,
  
  is_current BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- История образования
CREATE TABLE IF NOT EXISTS education_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  institution_name TEXT NOT NULL,
  degree_type TEXT,
  specialization TEXT,
  start_year INTEGER,
  graduation_year INTEGER,
  grade TEXT,
  
  education_type TEXT CHECK (education_type IN ('higher', 'secondary', 'course', 'certification')),
  location TEXT,
  thesis_topic TEXT,
  
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Результаты тестирования
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Big Five результаты
  big_five_scores JSONB,
  
  -- Архетип
  dominant_archetype TEXT,
  
  -- Все ответы на вопросы
  all_answers JSONB,
  
  -- AI анализ
  ai_analysis JSONB,
  
  -- Время анализа
  analysis_time INTEGER,
  
  -- Дата теста
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id ON resume_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_status ON resume_analysis(processing_status);
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_current ON work_experience(user_id, is_current);
CREATE INDEX IF NOT EXISTS idx_education_history_user_id ON education_history(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_date ON test_results(user_id, test_date);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Политики доступа: пользователи видят только свои данные
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analysis" ON resume_analysis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own work experience" ON work_experience
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own education history" ON education_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own test results" ON test_results
  FOR ALL USING (auth.uid() = user_id);

-- Функция для расчета процента заполненности профиля
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

-- Триггер для автоматического пересчета процента заполненности
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := calculate_profile_completeness(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_completeness_on_update
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_completeness();

-- ПОЛНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ С НУЛЯ
-- Выполните этот скрипт в Supabase SQL Editor для нового проекта

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. БАЗОВЫЕ ТАБЛИЦЫ ПОЛЬЗОВАТЕЛЕЙ
-- ========================================

-- Профили пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Личная информация
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  phone TEXT,
  location TEXT,
  age INTEGER,
  birth_date DATE,
  
  -- Профессиональная информация
  current_position TEXT,
  current_company TEXT,
  industry TEXT,
  experience_level TEXT CHECK (experience_level IN ('Junior', 'Middle', 'Senior', 'Lead', 'Executive')),
  total_experience TEXT,
  total_experience_months INTEGER,
  salary_expectations TEXT,
  employment_type TEXT,
  work_status TEXT,
  
  -- Образование
  university TEXT,
  degree TEXT,
  specialization TEXT,
  graduation_year INTEGER,
  grade TEXT,
  education_level TEXT,
  
  -- Навыки (JSON поля)
  key_skills JSONB DEFAULT '[]'::jsonb,
  technical_skills JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  soft_skills JSONB DEFAULT '[]'::jsonb,
  tools_and_platforms JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Предпочтения
  work_format TEXT CHECK (work_format IN ('remote', 'office', 'hybrid')),
  relocation_readiness TEXT,
  career_goals TEXT,
  development_areas JSONB DEFAULT '[]'::jsonb,
  avoided_tasks JSONB DEFAULT '[]'::jsonb,
  preferred_industries JSONB DEFAULT '[]'::jsonb,
  
  -- Метаданные
  resume_uploaded BOOLEAN DEFAULT FALSE,
  resume_analyzed BOOLEAN DEFAULT FALSE,
  profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN ('manual', 'resume', 'social', 'import')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
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

-- Результаты тестирования (старая система)
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
  test_version TEXT DEFAULT '1.0',
  
  -- Ответы и результаты
  answers JSONB NOT NULL,
  raw_scores JSONB,
  normalized_scores JSONB,
  percentiles JSONB,
  
  -- Итоговые результаты
  archetype TEXT,
  personality_traits JSONB,
  professional_matches JSONB,
  recommendations JSONB,
  
  -- Метаданные
  completion_time INTEGER,
  confidence_level DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. СИСТЕМА ТЕСТИРОВАНИЯ
-- ========================================

-- Роли пользователей
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, role)
);

-- Категории тестов
CREATE TABLE IF NOT EXISTS test_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Тесты
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description TEXT,
  description_ru TEXT,
  
  -- Метаданные
  category_id UUID REFERENCES test_categories(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Настройки теста
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_answers BOOLEAN DEFAULT false,
  
  -- Статус и видимость
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_public BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT true,
  
  -- Статистика
  total_questions INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  
  -- Метаданные
  tags JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  instructions_ru TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вопросы
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  
  -- Содержание вопроса
  question_text TEXT NOT NULL,
  question_text_ru TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', 'multiple_select', 'true_false', 'rating_scale', 
    'text_input', 'number_input', 'file_upload'
  )),
  
  -- Настройки вопроса
  points INTEGER DEFAULT 1,
  required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Дополнительные настройки
  explanation TEXT,
  explanation_ru TEXT,
  media_url TEXT,
  time_limit_seconds INTEGER,
  
  -- Логика переходов
  skip_logic JSONB DEFAULT '{}'::jsonb,
  
  -- Настройки для специальных типов вопросов
  matrix_rows JSONB DEFAULT '[]'::jsonb,
  matrix_columns JSONB DEFAULT '[]'::jsonb,
  slider_min INTEGER DEFAULT 0,
  slider_max INTEGER DEFAULT 100,
  slider_step INTEGER DEFAULT 1,
  
  -- Метаданные
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  tags JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Варианты ответов
CREATE TABLE IF NOT EXISTS answer_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Содержание варианта
  option_text TEXT NOT NULL,
  option_text_ru TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  
  -- Настройки
  points DECIMAL(5,2) DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  
  -- Дополнительные данные
  explanation TEXT,
  explanation_ru TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Попытки прохождения тестов
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Статус попытки
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timeout')),
  
  -- Результаты
  score DECIMAL(5,2) DEFAULT 0,
  max_possible_score DECIMAL(5,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  
  -- Время
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Дополнительные данные
  user_agent TEXT,
  ip_address INET,
  session_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ответы пользователей
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Ответ пользователя
  answer_data JSONB NOT NULL,
  
  -- Оценка ответа
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 0,
  
  -- Время ответа
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Дополнительные данные
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(attempt_id, question_id)
);

-- Результаты и аналитика
CREATE TABLE IF NOT EXISTS test_results_new (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  
  -- Детальные результаты
  detailed_scores JSONB,
  strengths JSONB,
  weaknesses JSONB,
  recommendations JSONB,
  
  -- AI анализ
  ai_analysis JSONB,
  ai_recommendations JSONB,
  
  -- Сравнение с другими
  percentile_rank DECIMAL(5,2),
  average_comparison JSONB,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Шаблоны тестов
CREATE TABLE IF NOT EXISTS test_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  description_ru TEXT,
  
  -- Настройки шаблона
  category_id UUID REFERENCES test_categories(id),
  template_data JSONB NOT NULL,
  
  -- Метаданные
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Отзывы и комментарии
CREATE TABLE IF NOT EXISTS test_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Отзыв
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Метаданные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ИНДЕКСЫ
-- ========================================

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_education_history_user_id ON education_history(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);

-- Индексы для системы тестирования
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tests_category ON tests(category_id);
CREATE INDEX IF NOT EXISTS idx_tests_author ON tests(author_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_public ON tests(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_questions_test ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_answer_options_question ON answer_options(question_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt ON user_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_test_results_attempt ON test_results_new(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_feedback_test ON test_feedback(test_id);

-- ========================================
-- 4. ТРИГГЕРЫ
-- ========================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_categories_updated_at
  BEFORE UPDATE ON test_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_templates_updated_at
  BEFORE UPDATE ON test_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для обновления статистики теста
CREATE OR REPLACE FUNCTION update_test_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE tests SET
      total_attempts = total_attempts + 1,
      average_score = (
        SELECT COALESCE(AVG(percentage), 0)
        FROM test_attempts 
        WHERE test_id = NEW.test_id AND status = 'completed'
      ),
      completion_rate = (
        SELECT COALESCE(
          (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / 
           NULLIF(COUNT(*), 0)) * 100, 0
        )
        FROM test_attempts 
        WHERE test_id = NEW.test_id
      )
    WHERE id = NEW.test_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления статистики
CREATE TRIGGER update_test_statistics_trigger
  AFTER UPDATE ON test_attempts
  FOR EACH ROW EXECUTE FUNCTION update_test_statistics();

-- ========================================
-- 5. RLS ПОЛИТИКИ
-- ========================================

-- Включаем RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_feedback ENABLE ROW LEVEL SECURITY;

-- Политики для пользовательских данных
CREATE POLICY "Users can manage their own profiles" ON user_profiles 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own work experience" ON work_experience 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education" ON education_history 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own test results" ON test_results 
  FOR ALL USING (auth.uid() = user_id);

-- Политики для публичного доступа к тестам
CREATE POLICY "Public read access for test categories" ON test_categories 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for published tests" ON tests 
  FOR SELECT USING (status = 'published' AND is_public = true);

CREATE POLICY "Public read access for questions" ON questions 
  FOR SELECT USING (
    test_id IN (SELECT id FROM tests WHERE status = 'published' AND is_public = true)
  );

CREATE POLICY "Public read access for answer options" ON answer_options 
  FOR SELECT USING (
    question_id IN (
      SELECT q.id FROM questions q
      JOIN tests t ON q.test_id = t.id
      WHERE t.status = 'published' AND t.is_public = true
    )
  );

-- Политики для попыток и ответов
CREATE POLICY "Users can create test attempts" ON test_attempts 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own attempts" ON test_attempts 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own attempts" ON test_attempts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own answers" ON user_answers 
  FOR INSERT WITH CHECK (
    attempt_id IN (
      SELECT id FROM test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own answers" ON user_answers 
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own results" ON test_results_new 
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback" ON test_feedback 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Политики для админов (любой авторизованный пользователь)
CREATE POLICY "Authenticated users can manage tests" ON tests 
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage questions" ON questions 
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage answer options" ON answer_options 
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view all attempts" ON test_attempts 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view all results" ON test_results_new 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ========================================
-- 6. НАЧАЛЬНЫЕ ДАННЫЕ
-- ========================================

-- Добавляем базовую категорию тестов
INSERT INTO test_categories (name, name_ru, description, icon, color, order_index) VALUES
('General Knowledge', 'Общие знания', 'Общие вопросы и знания', 'book', '#3B82F6', 1),
('Digital Skills', 'Цифровые навыки', 'Навыки работы с цифровыми технологиями', 'laptop', '#10B981', 2),
('Programming', 'Программирование', 'Тесты по программированию и разработке', 'code', '#F59E0B', 3),
('Business', 'Бизнес', 'Бизнес-навыки и управление', 'briefcase', '#8B5CF6', 4)
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. КОММЕНТАРИИ
-- ========================================

COMMENT ON TABLE user_profiles IS 'Профили пользователей с личной и профессиональной информацией';
COMMENT ON TABLE work_experience IS 'Опыт работы пользователей';
COMMENT ON TABLE education_history IS 'История образования пользователей';
COMMENT ON TABLE test_results IS 'Результаты психологических тестов';
COMMENT ON TABLE user_roles IS 'Роли пользователей в системе';
COMMENT ON TABLE test_categories IS 'Категории тестов для организации';
COMMENT ON TABLE tests IS 'Основная таблица тестов с настройками';
COMMENT ON TABLE questions IS 'Вопросы тестов с различными типами';
COMMENT ON TABLE answer_options IS 'Варианты ответов для вопросов';
COMMENT ON TABLE test_attempts IS 'Попытки прохождения тестов пользователями';
COMMENT ON TABLE user_answers IS 'Ответы пользователей на вопросы';
COMMENT ON TABLE test_results_new IS 'Детальные результаты и аналитика тестов';
COMMENT ON TABLE test_templates IS 'Шаблоны для быстрого создания тестов';
COMMENT ON TABLE test_feedback IS 'Отзывы и комментарии к тестам';

-- Сообщение об успешном выполнении
SELECT 'База данных успешно настроена! Все таблицы, индексы, триггеры и политики созданы.' as message;

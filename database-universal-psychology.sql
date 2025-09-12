-- Универсальная платформа для психологических тестов
-- Расширенная схема базы данных

-- 1. ТИПЫ ТЕСТОВ (шаблоны)
CREATE TABLE IF NOT EXISTS test_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'big5', 'hexaco', 'mbti', etc.
  display_name TEXT NOT NULL, -- 'BIG 5', 'HEXACO', 'MBTI'
  description TEXT,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ФАКТОРЫ ЛИЧНОСТИ
CREATE TABLE IF NOT EXISTS personality_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'openness', 'conscientiousness', etc.
  display_name TEXT NOT NULL, -- 'Открытость опыту', 'Добросовестность'
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ШКАЛЫ ОЦЕНОК
CREATE TABLE IF NOT EXISTS rating_scales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'likert_5', 'likert_7', 'custom_10'
  display_name TEXT NOT NULL, -- 'Шкала Лайкерта 5-балльная'
  min_value INTEGER NOT NULL DEFAULT 1,
  max_value INTEGER NOT NULL DEFAULT 5,
  labels JSONB DEFAULT '{}', -- {"1": "Совсем не согласен", "5": "Полностью согласен"}
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ТЕСТЫ (расширенная версия)
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description TEXT,
  description_ru TEXT,
  
  -- Связь с типом теста
  test_type_id UUID REFERENCES test_types(id),
  
  -- Настройки теста
  instructions TEXT,
  instructions_ru TEXT,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  
  -- Настройки отображения
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_answers BOOLEAN DEFAULT false,
  show_progress BOOLEAN DEFAULT true,
  show_results_immediately BOOLEAN DEFAULT true,
  
  -- Статус и видимость
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_public BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT true,
  
  -- Метаданные
  author_id UUID,
  total_questions INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  
  -- Настройки подсчета баллов
  scoring_config JSONB DEFAULT '{}', -- конфигурация подсчета баллов
  interpretation_config JSONB DEFAULT '{}', -- конфигурация интерпретации
  
  -- Теги и категории
  tags JSONB DEFAULT '[]'::jsonb,
  category_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ВОПРОСЫ (расширенная версия)
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  
  -- Содержание вопроса
  question_text TEXT NOT NULL,
  question_text_ru TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', 'multiple_select', 'true_false', 
    'rating_scale', 'text_input', 'number_input', 'file_upload'
  )),
  
  -- Связь с фактором личности
  factor_id UUID REFERENCES personality_factors(id),
  
  -- Настройки шкалы оценок
  rating_scale_id UUID REFERENCES rating_scales(id),
  scale_min INTEGER DEFAULT 1,
  scale_max INTEGER DEFAULT 5,
  scale_labels JSONB DEFAULT '{}',
  
  -- Настройки вопроса
  points DECIMAL(5,2) DEFAULT 1.0,
  weight DECIMAL(5,2) DEFAULT 1.0, -- вес для подсчета баллов
  is_reverse BOOLEAN DEFAULT false, -- обратный вопрос
  required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Дополнительные настройки
  explanation TEXT,
  explanation_ru TEXT,
  media_url TEXT,
  time_limit_seconds INTEGER,
  
  -- Метаданные
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  tags JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ВАРИАНТЫ ОТВЕТОВ (для вопросов с выбором)
CREATE TABLE IF NOT EXISTS answer_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Содержание варианта
  option_text TEXT NOT NULL,
  option_text_ru TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  
  -- Настройки для психологических тестов
  points DECIMAL(5,2) DEFAULT 0,
  factor_scores JSONB DEFAULT '{}', -- баллы по факторам {"openness": 2, "conscientiousness": -1}
  
  -- Метаданные
  order_index INTEGER DEFAULT 0,
  explanation TEXT,
  explanation_ru TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ПОПЫТКИ ПРОХОЖДЕНИЯ (расширенная версия)
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID,
  
  -- Статус и результаты
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score DECIMAL(5,2) DEFAULT 0,
  max_possible_score DECIMAL(5,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  
  -- Результаты по факторам
  factor_scores JSONB DEFAULT '{}', -- {"openness": 75, "conscientiousness": 60}
  factor_percentiles JSONB DEFAULT '{}', -- процентили по факторам
  personality_profile JSONB DEFAULT '{}', -- профиль личности
  
  -- Время и метаданные
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  session_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ОТВЕТЫ ПОЛЬЗОВАТЕЛЕЙ (расширенная версия)
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Ответ пользователя
  answer_data JSONB NOT NULL, -- может быть строка, число, массив
  raw_answer TEXT, -- исходный ответ для отладки
  
  -- Подсчет баллов
  points_earned DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 0,
  factor_points JSONB DEFAULT '{}', -- баллы по факторам
  
  -- Метаданные
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0
);

-- 9. ИНТЕРПРЕТАЦИИ РЕЗУЛЬТАТОВ
CREATE TABLE IF NOT EXISTS result_interpretations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
  factor_id UUID REFERENCES personality_factors(id),
  
  -- Условия интерпретации
  score_range_min DECIMAL(5,2),
  score_range_max DECIMAL(5,2),
  percentile_range_min INTEGER,
  percentile_range_max INTEGER,
  
  -- Интерпретация
  title TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description TEXT,
  description_ru TEXT,
  recommendations TEXT,
  recommendations_ru TEXT,
  
  -- Метаданные
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. НОРМАТИВНЫЕ ДАННЫЕ
CREATE TABLE IF NOT EXISTS normative_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
  factor_id UUID REFERENCES personality_factors(id),
  
  -- Нормативные данные
  population TEXT NOT NULL, -- 'general', 'students', 'professionals'
  sample_size INTEGER NOT NULL,
  mean_score DECIMAL(5,2) NOT NULL,
  standard_deviation DECIMAL(5,2) NOT NULL,
  percentiles JSONB DEFAULT '{}', -- {"10": 25, "25": 35, "50": 50, "75": 65, "90": 75}
  
  -- Метаданные
  study_date DATE,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_tests_test_type_id ON tests(test_type_id);
CREATE INDEX IF NOT EXISTS idx_questions_factor_id ON questions(factor_id);
CREATE INDEX IF NOT EXISTS idx_questions_rating_scale_id ON questions(rating_scale_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_factor_scores ON test_attempts USING GIN(factor_scores);
CREATE INDEX IF NOT EXISTS idx_user_answers_answer_data ON user_answers USING GIN(answer_data);

-- RLS политики
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Политики для публичных тестов
CREATE POLICY "Public tests are viewable by everyone" ON tests
  FOR SELECT USING (is_public = true AND status = 'published');

CREATE POLICY "Public test questions are viewable by everyone" ON questions
  FOR SELECT USING (
    test_id IN (SELECT id FROM tests WHERE is_public = true AND status = 'published')
  );

CREATE POLICY "Public test answer options are viewable by everyone" ON answer_options
  FOR SELECT USING (
    question_id IN (
      SELECT id FROM questions 
      WHERE test_id IN (SELECT id FROM tests WHERE is_public = true AND status = 'published')
    )
  );

-- Политики для создания попыток
CREATE POLICY "Anyone can create test attempts" ON test_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own attempts" ON test_attempts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Политики для ответов
CREATE POLICY "Anyone can create user answers" ON user_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own answers" ON user_answers
  FOR SELECT USING (
    attempt_id IN (SELECT id FROM test_attempts WHERE auth.uid() = user_id OR user_id IS NULL)
  );

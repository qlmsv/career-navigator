-- ПЛАТФОРМА ТЕСТИРОВАНИЯ - Схема БД для создания и прохождения тестов
-- Создано: $(date)

-- 1. РОЛИ ПОЛЬЗОВАТЕЛЕЙ
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

-- 2. КАТЕГОРИИ ТЕСТОВ
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

-- 3. ТЕСТЫ
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
  time_limit_minutes INTEGER, -- лимит времени (NULL = без лимита)
  passing_score INTEGER DEFAULT 70, -- проходной балл (0-100)
  max_attempts INTEGER DEFAULT 3, -- максимальное количество попыток
  shuffle_questions BOOLEAN DEFAULT false, -- перемешивать вопросы
  shuffle_answers BOOLEAN DEFAULT false, -- перемешивать варианты ответов
  
  -- Статус и видимость
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_public BOOLEAN DEFAULT true, -- публичный тест или приватный
  requires_auth BOOLEAN DEFAULT true, -- требует авторизации
  
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

-- 4. ВОПРОСЫ
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  
  -- Содержание вопроса
  question_text TEXT NOT NULL,
  question_text_ru TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', -- множественный выбор (один ответ)
    'multiple_select', -- множественный выбор (несколько ответов)
    'true_false', -- правда/ложь
    'rating_scale', -- шкала оценки (1-5, 1-10)
    'text_input', -- текстовый ввод
    'number_input', -- числовой ввод
    'file_upload' -- загрузка файла
  )),
  
  -- Настройки вопроса
  points INTEGER DEFAULT 1, -- количество баллов за правильный ответ
  required BOOLEAN DEFAULT true, -- обязательный вопрос
  order_index INTEGER DEFAULT 0,
  
  -- Дополнительные настройки
  explanation TEXT, -- объяснение правильного ответа
  explanation_ru TEXT,
  media_url TEXT, -- ссылка на изображение/видео
  time_limit_seconds INTEGER, -- лимит времени на вопрос
  
  -- Метаданные
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  tags JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ВАРИАНТЫ ОТВЕТОВ
CREATE TABLE IF NOT EXISTS answer_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Содержание варианта
  option_text TEXT NOT NULL,
  option_text_ru TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false, -- правильный ответ
  
  -- Настройки
  points DECIMAL(5,2) DEFAULT 0, -- частичные баллы (для частично правильных ответов)
  order_index INTEGER DEFAULT 0,
  
  -- Дополнительные данные
  explanation TEXT, -- объяснение почему этот ответ правильный/неправильный
  explanation_ru TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ПОПЫТКИ ПРОХОЖДЕНИЯ ТЕСТОВ
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL для анонимных пользователей
  
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

-- 7. ОТВЕТЫ ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Ответ пользователя
  answer_data JSONB NOT NULL, -- может содержать разные типы данных в зависимости от типа вопроса
  
  -- Оценка ответа
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 0,
  
  -- Время ответа
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Дополнительные данные
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5), -- уверенность в ответе
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(attempt_id, question_id)
);

-- 8. РЕЗУЛЬТАТЫ И АНАЛИТИКА
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  
  -- Детальные результаты
  detailed_scores JSONB, -- результаты по категориям/темам
  strengths JSONB, -- сильные стороны
  weaknesses JSONB, -- слабые стороны
  recommendations JSONB, -- рекомендации
  
  -- AI анализ (если включен)
  ai_analysis JSONB,
  ai_recommendations JSONB,
  
  -- Сравнение с другими
  percentile_rank DECIMAL(5,2), -- процентиль среди всех прохождений
  average_comparison JSONB, -- сравнение со средними показателями
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ШАБЛОНЫ ТЕСТОВ (для быстрого создания)
CREATE TABLE IF NOT EXISTS test_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  description_ru TEXT,
  
  -- Настройки шаблона
  category_id UUID REFERENCES test_categories(id),
  template_data JSONB NOT NULL, -- структура теста с вопросами
  
  -- Метаданные
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. УВЕДОМЛЕНИЯ И КОММЕНТАРИИ
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

-- ИНДЕКСЫ для оптимизации
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
CREATE INDEX IF NOT EXISTS idx_test_results_attempt ON test_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_feedback_test ON test_feedback(test_id);

-- ТРИГГЕРЫ для автоматического обновления updated_at
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

-- ФУНКЦИЯ для обновления статистики теста
CREATE OR REPLACE FUNCTION update_test_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем статистику теста при завершении попытки
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

-- RLS политики
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_feedback ENABLE ROW LEVEL SECURITY;

-- Политики для публичного доступа
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

-- Политики для авторизованных пользователей
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

CREATE POLICY "Users can view their own results" ON test_results 
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback" ON test_feedback 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Политики для админов
CREATE POLICY "Admins can manage all tests" ON tests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all questions" ON questions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all answer options" ON answer_options 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admins can view all attempts" ON test_attempts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admins can view all results" ON test_results 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Политики для авторов тестов
CREATE POLICY "Authors can manage their tests" ON tests 
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage questions of their tests" ON questions 
  FOR ALL USING (
    test_id IN (SELECT id FROM tests WHERE author_id = auth.uid())
  );

CREATE POLICY "Authors can manage answer options of their tests" ON answer_options 
  FOR ALL USING (
    question_id IN (
      SELECT q.id FROM questions q
      JOIN tests t ON q.test_id = t.id
      WHERE t.author_id = auth.uid()
    )
  );

-- КОММЕНТАРИИ
COMMENT ON TABLE user_roles IS 'Роли пользователей в системе (админ, модератор, пользователь)';
COMMENT ON TABLE test_categories IS 'Категории тестов для организации';
COMMENT ON TABLE tests IS 'Основная таблица тестов с настройками';
COMMENT ON TABLE questions IS 'Вопросы тестов с различными типами';
COMMENT ON TABLE answer_options IS 'Варианты ответов для вопросов';
COMMENT ON TABLE test_attempts IS 'Попытки прохождения тестов пользователями';
COMMENT ON TABLE user_answers IS 'Ответы пользователей на вопросы';
COMMENT ON TABLE test_results IS 'Детальные результаты и аналитика';
COMMENT ON TABLE test_templates IS 'Шаблоны для быстрого создания тестов';
COMMENT ON TABLE test_feedback IS 'Отзывы и комментарии к тестам';

-- Создание таблиц для платформы тестирования

-- Создание таблицы категорий тестов
CREATE TABLE IF NOT EXISTS test_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Создание таблицы тестов
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description TEXT,
  description_ru TEXT,
  category_id UUID REFERENCES test_categories(id),
  author_id UUID NOT NULL,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_answers BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  is_public BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT true,
  total_questions INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  tags JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  instructions_ru TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы вопросов
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_ru TEXT NOT NULL,
  question_type TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  explanation TEXT,
  explanation_ru TEXT,
  media_url TEXT,
  time_limit_seconds INTEGER,
  difficulty_level TEXT DEFAULT 'medium',
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы вариантов ответов
CREATE TABLE IF NOT EXISTS answer_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_text_ru TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  points DECIMAL(5,2) DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  explanation TEXT,
  explanation_ru TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы попыток прохождения
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID,
  status TEXT DEFAULT 'in_progress',
  score DECIMAL(5,2) DEFAULT 0,
  max_possible_score DECIMAL(5,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  session_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы ответов пользователей
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_data JSONB NOT NULL,
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  confidence_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_tests_category_id ON tests(category_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_is_public ON tests(is_public);
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);

-- Включение RLS (Row Level Security)
ALTER TABLE test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Политики RLS для публичного доступа к тестам
CREATE POLICY "Public tests are viewable by everyone" ON tests
  FOR SELECT USING (is_public = true AND status = 'published');

CREATE POLICY "Test categories are viewable by everyone" ON test_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Questions are viewable for public tests" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tests 
      WHERE tests.id = questions.test_id 
      AND tests.is_public = true 
      AND tests.status = 'published'
    )
  );

CREATE POLICY "Answer options are viewable for public tests" ON answer_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN tests ON tests.id = questions.test_id
      WHERE questions.id = answer_options.question_id 
      AND tests.is_public = true 
      AND tests.status = 'published'
    )
  );

-- Политики для попыток прохождения (пользователи могут создавать свои попытки)
CREATE POLICY "Users can create their own test attempts" ON test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test attempts" ON test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own test attempts" ON test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Политики для ответов пользователей
CREATE POLICY "Users can create their own answers" ON user_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts 
      WHERE test_attempts.id = user_answers.attempt_id 
      AND test_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own answers" ON user_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM test_attempts 
      WHERE test_attempts.id = user_answers.attempt_id 
      AND test_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own answers" ON user_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM test_attempts 
      WHERE test_attempts.id = user_answers.attempt_id 
      AND test_attempts.user_id = auth.uid()
    )
  );

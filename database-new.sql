-- ============================================================================
-- НОВАЯ ЧИСТАЯ БАЗА ДАННЫХ ДЛЯ СИСТЕМЫ ТЕСТИРОВАНИЯ С FORMILY
-- ============================================================================

-- Очистка старых таблиц
DROP TABLE IF EXISTS test_responses CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ============================================================================
-- 1. ТАБЛИЦА АДМИНИСТРАТОРОВ
-- ============================================================================
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем первого админа (пароль: admin123)
-- ВНИМАНИЕ: Для демо храним пароль в открытом виде. В продакшене используйте bcrypt!
INSERT INTO admins (email, password_hash, name) VALUES 
('admin@test.com', 'admin123', 'Admin');

-- ============================================================================
-- 2. ТАБЛИЦА ТЕСТОВ
-- ============================================================================
CREATE TABLE tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Основная информация
  title TEXT NOT NULL,
  description TEXT,
  
  -- Formily schema (вся структура теста в JSON)
  formily_schema JSONB NOT NULL,
  
  -- Настройки
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  show_results BOOLEAN DEFAULT true,
  allow_multiple_attempts BOOLEAN DEFAULT true,
  time_limit_minutes INTEGER,
  
  -- Метаданные
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Статистика
  total_responses INTEGER DEFAULT 0
);

-- Индексы
CREATE INDEX idx_tests_status ON tests(status);
CREATE INDEX idx_tests_created_at ON tests(created_at DESC);

-- ============================================================================
-- 3. ТАБЛИЦА ОТВЕТОВ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================
CREATE TABLE test_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Связь с тестом
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
  
  -- Данные ответа (все ответы в JSON)
  response_data JSONB NOT NULL,
  
  -- Метаданные
  user_identifier TEXT, -- Опционально: email или имя пользователя
  ip_address INET,
  user_agent TEXT,
  
  -- Временные метки
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER,
  
  -- Результаты (если есть)
  score NUMERIC(5,2),
  results_data JSONB
);

-- Индексы
CREATE INDEX idx_responses_test_id ON test_responses(test_id);
CREATE INDEX idx_responses_completed_at ON test_responses(completed_at DESC);

-- ============================================================================
-- ТРИГГЕРЫ ДЛЯ ОБНОВЛЕНИЯ СТАТИСТИКИ
-- ============================================================================

-- Функция для обновления счетчика ответов
CREATE OR REPLACE FUNCTION update_test_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tests 
    SET total_responses = total_responses + 1,
        updated_at = NOW()
    WHERE id = NEW.test_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tests 
    SET total_responses = total_responses - 1,
        updated_at = NOW()
    WHERE id = OLD.test_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Триггер на добавление/удаление ответа
CREATE TRIGGER trigger_update_response_count
AFTER INSERT OR DELETE ON test_responses
FOR EACH ROW EXECUTE FUNCTION update_test_response_count();

-- Триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tests_updated_at
BEFORE UPDATE ON tests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security) - ОТКЛЮЧЕНО для простоты
-- ============================================================================

ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ГОТОВО!
-- ============================================================================

COMMENT ON TABLE tests IS 'Таблица тестов с Formily схемами';
COMMENT ON TABLE test_responses IS 'Ответы пользователей на тесты';
COMMENT ON TABLE admins IS 'Администраторы системы';

-- Пример Formily схемы (для справки):
/*
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Ваше имя",
      "x-decorator": "FormItem",
      "x-component": "Input",
      "required": true
    },
    "q1": {
      "type": "string",
      "title": "Вопрос 1: Выберите правильный ответ",
      "x-decorator": "FormItem",
      "x-component": "Radio.Group",
      "enum": [
        { "label": "Вариант A", "value": "a" },
        { "label": "Вариант B", "value": "b" },
        { "label": "Вариант C", "value": "c" }
      ],
      "x-component-props": {
        "correctAnswer": "a",
        "points": 10
      }
    }
  }
}
*/

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    // Читаем SQL из файла миграции
    const migrationSQL = `
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
    `
    
    // Выполняем SQL через rpc функцию
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      data
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

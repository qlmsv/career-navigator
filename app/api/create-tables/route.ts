import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)
    
    // SQL для создания основных таблиц платформы тестирования
    const createTablesSQL = `
      -- Создание таблицы категорий тестов
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

      -- Создание таблицы тестов
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

      -- Создание таблицы вопросов
      CREATE TABLE IF NOT EXISTS questions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        
        -- Содержание вопроса
        question_text TEXT NOT NULL,
        question_text_ru TEXT NOT NULL,
        question_type TEXT NOT NULL CHECK (question_type IN (
          'multiple_choice',
          'multiple_select',
          'true_false',
          'rating_scale',
          'text_input',
          'number_input',
          'file_upload'
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
        
        -- Метаданные
        difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
        tags JSONB DEFAULT '[]'::jsonb,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Создание таблицы вариантов ответов
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

      -- Создание таблицы попыток прохождения
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

      -- Создание таблицы ответов пользователей
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
    `
    
    // Выполняем SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTablesSQL })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tables created successfully'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

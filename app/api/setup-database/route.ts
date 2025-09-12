import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    const results = []
    
    // Создаем таблицы по одной
    const tables = [
      {
        name: 'test_types',
        sql: `CREATE TABLE IF NOT EXISTS test_types (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT,
          version TEXT DEFAULT '1.0',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'personality_factors',
        sql: `CREATE TABLE IF NOT EXISTS personality_factors (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'rating_scales',
        sql: `CREATE TABLE IF NOT EXISTS rating_scales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          min_value INTEGER NOT NULL DEFAULT 1,
          max_value INTEGER NOT NULL DEFAULT 5,
          labels JSONB DEFAULT '{}',
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'test_categories',
        sql: `CREATE TABLE IF NOT EXISTS test_categories (
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
        );`
      },
      {
        name: 'tests',
        sql: `CREATE TABLE IF NOT EXISTS tests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          title_ru TEXT NOT NULL,
          description TEXT,
          description_ru TEXT,
          test_type_id UUID REFERENCES test_types(id),
          category_id UUID REFERENCES test_categories(id),
          author_id UUID,
          instructions TEXT,
          instructions_ru TEXT,
          time_limit_minutes INTEGER,
          passing_score INTEGER DEFAULT 70,
          max_attempts INTEGER DEFAULT 3,
          shuffle_questions BOOLEAN DEFAULT false,
          shuffle_answers BOOLEAN DEFAULT false,
          show_progress BOOLEAN DEFAULT true,
          show_results_immediately BOOLEAN DEFAULT true,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          is_public BOOLEAN DEFAULT true,
          requires_auth BOOLEAN DEFAULT true,
          total_questions INTEGER DEFAULT 0,
          total_attempts INTEGER DEFAULT 0,
          average_score DECIMAL(5,2),
          completion_rate DECIMAL(5,2),
          scoring_config JSONB DEFAULT '{}',
          interpretation_config JSONB DEFAULT '{}',
          tags JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'questions',
        sql: `CREATE TABLE IF NOT EXISTS questions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_text_ru TEXT NOT NULL,
          question_type TEXT NOT NULL CHECK (question_type IN (
            'multiple_choice', 'multiple_select', 'true_false', 
            'rating_scale', 'text_input', 'number_input', 'file_upload'
          )),
          factor_id UUID REFERENCES personality_factors(id),
          rating_scale_id UUID REFERENCES rating_scales(id),
          scale_min INTEGER DEFAULT 1,
          scale_max INTEGER DEFAULT 5,
          scale_labels JSONB DEFAULT '{}',
          points DECIMAL(5,2) DEFAULT 1.0,
          weight DECIMAL(5,2) DEFAULT 1.0,
          is_reverse BOOLEAN DEFAULT false,
          required BOOLEAN DEFAULT true,
          order_index INTEGER DEFAULT 0,
          explanation TEXT,
          explanation_ru TEXT,
          media_url TEXT,
          time_limit_seconds INTEGER,
          difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
          tags JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'answer_options',
        sql: `CREATE TABLE IF NOT EXISTS answer_options (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          option_text_ru TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT false,
          points DECIMAL(5,2) DEFAULT 0,
          factor_scores JSONB DEFAULT '{}',
          order_index INTEGER DEFAULT 0,
          explanation TEXT,
          explanation_ru TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'test_attempts',
        sql: `CREATE TABLE IF NOT EXISTS test_attempts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
          user_id UUID,
          status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
          score DECIMAL(5,2) DEFAULT 0,
          max_possible_score DECIMAL(5,2) DEFAULT 0,
          percentage DECIMAL(5,2) DEFAULT 0,
          passed BOOLEAN DEFAULT false,
          factor_scores JSONB DEFAULT '{}',
          factor_percentiles JSONB DEFAULT '{}',
          personality_profile JSONB DEFAULT '{}',
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          time_spent_seconds INTEGER DEFAULT 0,
          user_agent TEXT,
          ip_address INET,
          session_data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'user_answers',
        sql: `CREATE TABLE IF NOT EXISTS user_answers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
          question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          answer_data JSONB NOT NULL,
          raw_answer TEXT,
          points_earned DECIMAL(5,2) DEFAULT 0,
          max_points DECIMAL(5,2) DEFAULT 0,
          factor_points JSONB DEFAULT '{}',
          answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          time_spent_seconds INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'result_interpretations',
        sql: `CREATE TABLE IF NOT EXISTS result_interpretations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
          factor_id UUID REFERENCES personality_factors(id),
          score_range_min DECIMAL(5,2),
          score_range_max DECIMAL(5,2),
          percentile_range_min INTEGER,
          percentile_range_max INTEGER,
          title TEXT NOT NULL,
          title_ru TEXT NOT NULL,
          description TEXT,
          description_ru TEXT,
          recommendations TEXT,
          recommendations_ru TEXT,
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      },
      {
        name: 'normative_data',
        sql: `CREATE TABLE IF NOT EXISTS normative_data (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_type_id UUID NOT NULL REFERENCES test_types(id) ON DELETE CASCADE,
          factor_id UUID REFERENCES personality_factors(id),
          population TEXT NOT NULL,
          sample_size INTEGER NOT NULL,
          mean_score DECIMAL(5,2) NOT NULL,
          standard_deviation DECIMAL(5,2) NOT NULL,
          percentiles JSONB DEFAULT '{}',
          study_date DATE,
          source TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      }
    ]
    
    for (const table of tables) {
      try {
        // Пытаемся выполнить SQL через rpc
        const { data, error } = await supabaseAdmin.rpc('exec', { sql: table.sql })
        
        if (error) {
          // Если rpc не работает, пробуем другой способ
          console.log(`Trying alternative method for ${table.name}`)
          results.push({ table: table.name, success: false, error: error.message })
        } else {
          results.push({ table: table.name, success: true })
        }
      } catch (err) {
        results.push({ 
          table: table.name, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database setup attempted',
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

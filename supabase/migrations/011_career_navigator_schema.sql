-- КАРЬЕРНЫЙ НАВИГАТОР - Новая схема БД для самодиагностики конкурентоспособности
-- Создано: $(date)

-- 1. КАТЕГОРИИ ЦИФРОВЫХ НАВЫКОВ
CREATE TABLE IF NOT EXISTS digital_skill_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- название иконки для UI
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ЦИФРОВЫЕ НАВЫКИ
CREATE TABLE IF NOT EXISTS digital_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES digital_skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  max_level INTEGER DEFAULT 5, -- максимальный уровень владения (1-5)
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(category_id, name)
);

-- 3. РЕГИОНЫ
CREATE TABLE IF NOT EXISTS regions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  country TEXT DEFAULT 'Russia',
  federal_district TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ПРОФЕССИИ (не связанные с ИКТ)
CREATE TABLE IF NOT EXISTS professions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  industry TEXT, -- отрасль
  is_ict_related BOOLEAN DEFAULT false, -- исключаем ИКТ-профессии
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ТРЕБОВАНИЯ К НАВЫКАМ ПО ПРОФЕССИЯМ И РЕГИОНАМ
CREATE TABLE IF NOT EXISTS profession_skill_requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profession_id UUID NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES digital_skills(id) ON DELETE CASCADE,
  
  required_level INTEGER NOT NULL CHECK (required_level >= 1 AND required_level <= 5),
  importance_weight DECIMAL(3,2) DEFAULT 1.0, -- вес важности навыка (0.1 - 1.0)
  
  -- Статистика по рынку труда
  demand_level TEXT CHECK (demand_level IN ('low', 'medium', 'high', 'critical')),
  salary_impact DECIMAL(5,2), -- влияние на зарплату в %
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(profession_id, region_id, skill_id)
);

-- 6. РЕГИОНАЛЬНАЯ СТАТИСТИКА ЗАРПЛАТ
CREATE TABLE IF NOT EXISTS regional_salary_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profession_id UUID NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  
  -- Зарплатная вилка
  salary_min INTEGER, -- минимальная зарплата
  salary_median INTEGER, -- медианная зарплата
  salary_max INTEGER, -- максимальная зарплата
  currency TEXT DEFAULT 'RUB',
  
  -- Статистика рынка
  vacancy_count INTEGER DEFAULT 0, -- количество вакансий
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
  growth_trend TEXT CHECK (growth_trend IN ('declining', 'stable', 'growing')),
  
  -- Метаданные
  data_source TEXT, -- источник данных (hh.ru, superjob.ru и т.д.)
  collection_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(profession_id, region_id, collection_date)
);

-- 7. САМООЦЕНКИ ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS user_skill_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Профессиональная информация
  current_profession_id UUID REFERENCES professions(id),
  target_profession_id UUID REFERENCES professions(id), -- желаемая профессия
  region_id UUID REFERENCES regions(id),
  experience_years INTEGER,
  current_salary INTEGER,
  target_salary INTEGER,
  
  -- Результаты оценки
  assessment_data JSONB NOT NULL, -- детальные результаты по навыкам
  overall_score DECIMAL(5,2), -- общий балл конкурентоспособности
  competitiveness_level TEXT CHECK (competitiveness_level IN ('low', 'below_average', 'average', 'above_average', 'high')),
  
  -- Метаданные
  assessment_duration INTEGER, -- время прохождения в секундах
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ДЕТАЛЬНЫЕ ОЦЕНКИ НАВЫКОВ
CREATE TABLE IF NOT EXISTS user_skill_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_skill_assessments(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES digital_skills(id) ON DELETE CASCADE,
  
  self_assessment_level INTEGER NOT NULL CHECK (self_assessment_level >= 1 AND self_assessment_level <= 5),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5), -- уверенность в оценке
  
  -- Сравнение с рынком
  market_required_level INTEGER,
  gap_analysis INTEGER, -- разница между требуемым и текущим уровнем
  improvement_priority TEXT CHECK (improvement_priority IN ('low', 'medium', 'high', 'critical')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assessment_id, skill_id)
);

-- 9. ОБРАЗОВАТЕЛЬНЫЕ РЕСУРСЫ
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT, -- провайдер курса
  url TEXT,
  resource_type TEXT CHECK (resource_type IN ('course', 'certification', 'book', 'video', 'article', 'practice')),
  
  -- Связь с навыками
  target_skills JSONB, -- массив skill_id которые развивает ресурс
  skill_level_from INTEGER DEFAULT 1,
  skill_level_to INTEGER DEFAULT 5,
  
  -- Характеристики
  duration_hours INTEGER,
  price_rub INTEGER DEFAULT 0, -- цена в рублях (0 = бесплатно)
  language TEXT DEFAULT 'ru',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Рейтинг и метрики
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2), -- процент завершивших курс
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ПЕРСОНАЛЬНЫЕ РЕКОМЕНДАЦИИ
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_skill_assessments(id) ON DELETE CASCADE,
  
  -- Рекомендации по развитию
  priority_skills JSONB, -- приоритетные навыки для развития
  recommended_resources JSONB, -- рекомендуемые курсы/ресурсы
  career_paths JSONB, -- возможные карьерные пути
  salary_potential JSONB, -- потенциал роста зарплаты
  
  -- ИИ-анализ
  ai_analysis TEXT, -- детальный анализ от ИИ
  action_plan JSONB, -- пошаговый план действий
  timeline_months INTEGER, -- примерный срок достижения целей
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 months') -- рекомендации актуальны 6 месяцев
);

-- ИНДЕКСЫ для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_digital_skills_category ON digital_skills(category_id);
CREATE INDEX IF NOT EXISTS idx_profession_requirements_profession ON profession_skill_requirements(profession_id);
CREATE INDEX IF NOT EXISTS idx_profession_requirements_region ON profession_skill_requirements(region_id);
CREATE INDEX IF NOT EXISTS idx_profession_requirements_skill ON profession_skill_requirements(skill_id);
CREATE INDEX IF NOT EXISTS idx_salary_data_profession_region ON regional_salary_data(profession_id, region_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user ON user_skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_profession ON user_skill_assessments(current_profession_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_scores_assessment ON user_skill_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_scores_skill ON user_skill_scores(skill_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_active ON learning_resources(is_active) WHERE is_active = true;

-- ТРИГГЕРЫ для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_digital_skill_categories_updated_at ON digital_skill_categories;
CREATE TRIGGER update_digital_skill_categories_updated_at
  BEFORE UPDATE ON digital_skill_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_digital_skills_updated_at ON digital_skills;
CREATE TRIGGER update_digital_skills_updated_at
  BEFORE UPDATE ON digital_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_professions_updated_at ON professions;
CREATE TRIGGER update_professions_updated_at
  BEFORE UPDATE ON professions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profession_skill_requirements_updated_at ON profession_skill_requirements;
CREATE TRIGGER update_profession_skill_requirements_updated_at
  BEFORE UPDATE ON profession_skill_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_regional_salary_data_updated_at ON regional_salary_data;
CREATE TRIGGER update_regional_salary_data_updated_at
  BEFORE UPDATE ON regional_salary_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_skill_assessments_updated_at ON user_skill_assessments;
CREATE TRIGGER update_user_skill_assessments_updated_at
  BEFORE UPDATE ON user_skill_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_resources_updated_at ON learning_resources;
CREATE TRIGGER update_learning_resources_updated_at
  BEFORE UPDATE ON learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики
ALTER TABLE digital_skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profession_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения справочных данных
CREATE POLICY "Public read access for skill categories" ON digital_skill_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for skills" ON digital_skills FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for regions" ON regions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for professions" ON professions FOR SELECT USING (is_active = true AND is_ict_related = false);
CREATE POLICY "Public read access for skill requirements" ON profession_skill_requirements FOR SELECT USING (true);
CREATE POLICY "Public read access for salary data" ON regional_salary_data FOR SELECT USING (true);
CREATE POLICY "Public read access for learning resources" ON learning_resources FOR SELECT USING (is_active = true);

-- Политики для пользовательских данных (только владелец)
CREATE POLICY "Users can manage their own assessments" ON user_skill_assessments 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skill scores" ON user_skill_scores 
  FOR ALL USING (
    assessment_id IN (
      SELECT id FROM user_skill_assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own recommendations" ON user_recommendations 
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM user_skill_assessments WHERE user_id = auth.uid()
    )
  );

-- КОММЕНТАРИИ к таблицам
COMMENT ON TABLE digital_skill_categories IS 'Категории цифровых навыков (базовая грамотность, офисные приложения и т.д.)';
COMMENT ON TABLE digital_skills IS 'Конкретные цифровые навыки с уровнями владения';
COMMENT ON TABLE regions IS 'Регионы России для анализа рынка труда';
COMMENT ON TABLE professions IS 'Профессии (исключая ИКТ) для анализа требований';
COMMENT ON TABLE profession_skill_requirements IS 'Требования к цифровым навыкам по профессиям и регионам';
COMMENT ON TABLE regional_salary_data IS 'Статистика зарплат по профессиям и регионам';
COMMENT ON TABLE user_skill_assessments IS 'Результаты самодиагностики пользователей';
COMMENT ON TABLE user_skill_scores IS 'Детальные оценки навыков пользователей';
COMMENT ON TABLE learning_resources IS 'Образовательные ресурсы для развития навыков';
COMMENT ON TABLE user_recommendations IS 'Персональные рекомендации по развитию карьеры';

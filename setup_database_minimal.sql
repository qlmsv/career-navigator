-- МИНИМАЛЬНАЯ НАСТРОЙКА БД для Карьерного навигатора
-- Скопируйте ВЕСЬ этот код в Supabase SQL Editor и нажмите Run

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Категории навыков
CREATE TABLE IF NOT EXISTS digital_skill_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Навыки
CREATE TABLE IF NOT EXISTS digital_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES digital_skill_categories(id),
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  max_level INTEGER DEFAULT 5,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Регионы
CREATE TABLE IF NOT EXISTS regions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  country TEXT DEFAULT 'Russia',
  federal_district TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Профессии
CREATE TABLE IF NOT EXISTS professions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ru TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  is_ict_related BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Оценки пользователей
CREATE TABLE IF NOT EXISTS user_skill_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  current_profession_id UUID REFERENCES professions(id),
  region_id UUID REFERENCES regions(id),
  experience_years INTEGER,
  current_salary INTEGER,
  assessment_data JSONB NOT NULL DEFAULT '{}',
  overall_score DECIMAL(5,2),
  competitiveness_level TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Детальные оценки
CREATE TABLE IF NOT EXISTS user_skill_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_skill_assessments(id),
  skill_id UUID NOT NULL REFERENCES digital_skills(id),
  self_assessment_level INTEGER NOT NULL,
  confidence_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Образовательные ресурсы
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  resource_type TEXT DEFAULT 'course',
  duration_hours INTEGER,
  price_rub INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'beginner',
  rating DECIMAL(3,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Настройка RLS
ALTER TABLE digital_skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

-- Политики чтения для всех
CREATE POLICY IF NOT EXISTS "allow_read_categories" ON digital_skill_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "allow_read_skills" ON digital_skills FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "allow_read_regions" ON regions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "allow_read_professions" ON professions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "allow_read_resources" ON learning_resources FOR SELECT USING (true);

-- Политики для пользовательских данных
CREATE POLICY IF NOT EXISTS "users_own_assessments" ON user_skill_assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "users_own_scores" ON user_skill_scores FOR ALL USING (
  assessment_id IN (SELECT id FROM user_skill_assessments WHERE user_id = auth.uid())
);

-- ДОБАВЛЯЕМ ДАННЫЕ (только если таблицы пустые)

-- Категории
INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index)
SELECT 'basic_digital_literacy', 'Базовая цифровая грамотность', 'Основы работы с компьютером', 'monitor', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skill_categories WHERE name = 'basic_digital_literacy');

INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index)
SELECT 'office_applications', 'Офисные приложения', 'MS Office, Google Workspace', 'file-text', 2
WHERE NOT EXISTS (SELECT 1 FROM digital_skill_categories WHERE name = 'office_applications');

INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index)
SELECT 'communication_tools', 'Коммуникационные инструменты', 'Видеоконференции, мессенджеры', 'message-circle', 3
WHERE NOT EXISTS (SELECT 1 FROM digital_skill_categories WHERE name = 'communication_tools');

INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index)
SELECT 'data_analysis', 'Работа с данными', 'Excel, аналитика, визуализация', 'bar-chart', 4
WHERE NOT EXISTS (SELECT 1 FROM digital_skill_categories WHERE name = 'data_analysis');

INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index)
SELECT 'digital_security', 'Цифровая безопасность', 'Пароли, защита данных', 'shield', 5
WHERE NOT EXISTS (SELECT 1 FROM digital_skill_categories WHERE name = 'digital_security');

INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index)
SELECT 'online_presence', 'Онлайн-присутствие', 'Социальные сети, LinkedIn', 'globe', 6
WHERE NOT EXISTS (SELECT 1 FROM digital_skill_categories WHERE name = 'online_presence');

-- Регионы
INSERT INTO regions (name, name_ru, federal_district)
SELECT 'moscow', 'Москва', 'Центральный'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'moscow');

INSERT INTO regions (name, name_ru, federal_district)
SELECT 'saint_petersburg', 'Санкт-Петербург', 'Северо-Западный'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'saint_petersburg');

INSERT INTO regions (name, name_ru, federal_district)
SELECT 'moscow_region', 'Московская область', 'Центральный'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'moscow_region');

INSERT INTO regions (name, name_ru, federal_district)
SELECT 'krasnodar_krai', 'Краснодарский край', 'Южный'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'krasnodar_krai');

INSERT INTO regions (name, name_ru, federal_district)
SELECT 'tatarstan', 'Республика Татарстан', 'Приволжский'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'tatarstan');

-- Профессии
INSERT INTO professions (name, name_ru, description, industry, is_ict_related)
SELECT 'accountant', 'Бухгалтер', 'Ведение бухгалтерского учета', 'Экономика и финансы', false
WHERE NOT EXISTS (SELECT 1 FROM professions WHERE name = 'accountant');

INSERT INTO professions (name, name_ru, description, industry, is_ict_related)
SELECT 'hr_specialist', 'HR-специалист', 'Управление персоналом', 'Управление', false
WHERE NOT EXISTS (SELECT 1 FROM professions WHERE name = 'hr_specialist');

INSERT INTO professions (name, name_ru, description, industry, is_ict_related)
SELECT 'marketing_specialist', 'Маркетолог', 'Продвижение товаров и услуг', 'Маркетинг', false
WHERE NOT EXISTS (SELECT 1 FROM professions WHERE name = 'marketing_specialist');

INSERT INTO professions (name, name_ru, description, industry, is_ict_related)
SELECT 'teacher', 'Учитель', 'Преподавание в школе', 'Образование', false
WHERE NOT EXISTS (SELECT 1 FROM professions WHERE name = 'teacher');

INSERT INTO professions (name, name_ru, description, industry, is_ict_related)
SELECT 'sales_manager', 'Менеджер по продажам', 'Продажи, работа с клиентами', 'Продажи', false
WHERE NOT EXISTS (SELECT 1 FROM professions WHERE name = 'sales_manager');

-- Навыки (добавляем базовые)
INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  (SELECT id FROM digital_skill_categories WHERE name = 'basic_digital_literacy'),
  'computer_basics', 'Основы работы с ПК', 'Включение/выключение, файловая система', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skills WHERE name = 'computer_basics');

INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  (SELECT id FROM digital_skill_categories WHERE name = 'office_applications'),
  'spreadsheets', 'Электронные таблицы', 'Excel, Google Sheets, формулы', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skills WHERE name = 'spreadsheets');

INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  (SELECT id FROM digital_skill_categories WHERE name = 'communication_tools'),
  'video_conferencing', 'Видеоконференции', 'Zoom, Teams, Meet', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skills WHERE name = 'video_conferencing');

INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  (SELECT id FROM digital_skill_categories WHERE name = 'data_analysis'),
  'excel_advanced', 'Продвинутый Excel', 'Сводные таблицы, макросы', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skills WHERE name = 'excel_advanced');

INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  (SELECT id FROM digital_skill_categories WHERE name = 'digital_security'),
  'password_management', 'Управление паролями', 'Сложные пароли, 2FA', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skills WHERE name = 'password_management');

INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  (SELECT id FROM digital_skill_categories WHERE name = 'online_presence'),
  'linkedin_usage', 'LinkedIn', 'Профиль, нетворкинг', 1
WHERE NOT EXISTS (SELECT 1 FROM digital_skills WHERE name = 'linkedin_usage');

-- Проверяем результат
SELECT 
  'Успешно настроено!' as status,
  (SELECT COUNT(*) FROM digital_skill_categories) as categories_count,
  (SELECT COUNT(*) FROM digital_skills) as skills_count,
  (SELECT COUNT(*) FROM regions) as regions_count,
  (SELECT COUNT(*) FROM professions) as professions_count;

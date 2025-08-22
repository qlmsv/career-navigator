-- ПРОСТАЯ НАСТРОЙКА БД для Карьерного навигатора
-- Выполните этот файл в Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. КАТЕГОРИИ ЦИФРОВЫХ НАВЫКОВ
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

-- 2. ЦИФРОВЫЕ НАВЫКИ
CREATE TABLE IF NOT EXISTS digital_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES digital_skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  max_level INTEGER DEFAULT 5,
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

-- 4. ПРОФЕССИИ
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

-- 5. САМООЦЕНКИ ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS user_skill_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  current_profession_id UUID REFERENCES professions(id),
  target_profession_id UUID REFERENCES professions(id),
  region_id UUID REFERENCES regions(id),
  experience_years INTEGER,
  current_salary INTEGER,
  target_salary INTEGER,
  
  assessment_data JSONB NOT NULL,
  overall_score DECIMAL(5,2),
  competitiveness_level TEXT CHECK (competitiveness_level IN ('low', 'below_average', 'average', 'above_average', 'high')),
  
  assessment_duration INTEGER,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ДЕТАЛЬНЫЕ ОЦЕНКИ НАВЫКОВ
CREATE TABLE IF NOT EXISTS user_skill_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_skill_assessments(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES digital_skills(id) ON DELETE CASCADE,
  
  self_assessment_level INTEGER NOT NULL CHECK (self_assessment_level >= 1 AND self_assessment_level <= 5),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  
  market_required_level INTEGER,
  gap_analysis INTEGER,
  improvement_priority TEXT CHECK (improvement_priority IN ('low', 'medium', 'high', 'critical')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assessment_id, skill_id)
);

-- 7. ОБРАЗОВАТЕЛЬНЫЕ РЕСУРСЫ
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  url TEXT,
  resource_type TEXT CHECK (resource_type IN ('course', 'certification', 'book', 'video', 'article', 'practice')),
  
  target_skills JSONB,
  skill_level_from INTEGER DEFAULT 1,
  skill_level_to INTEGER DEFAULT 5,
  
  duration_hours INTEGER,
  price_rub INTEGER DEFAULT 0,
  language TEXT DEFAULT 'ru',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS политики
ALTER TABLE digital_skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения
DROP POLICY IF EXISTS "Public read skill categories" ON digital_skill_categories;
CREATE POLICY "Public read skill categories" ON digital_skill_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read skills" ON digital_skills;
CREATE POLICY "Public read skills" ON digital_skills FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read regions" ON regions;
CREATE POLICY "Public read regions" ON regions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read professions" ON professions;
CREATE POLICY "Public read professions" ON professions FOR SELECT USING (is_active = true AND is_ict_related = false);

DROP POLICY IF EXISTS "Public read resources" ON learning_resources;
CREATE POLICY "Public read resources" ON learning_resources FOR SELECT USING (is_active = true);

-- Политики для пользовательских данных
DROP POLICY IF EXISTS "Users own assessments" ON user_skill_assessments;
CREATE POLICY "Users own assessments" ON user_skill_assessments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own scores" ON user_skill_scores;
CREATE POLICY "Users own scores" ON user_skill_scores FOR ALL USING (
  assessment_id IN (SELECT id FROM user_skill_assessments WHERE user_id = auth.uid())
);

-- НАЧАЛЬНЫЕ ДАННЫЕ
-- Категории навыков
INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index) VALUES
('basic_digital_literacy', 'Базовая цифровая грамотность', 'Основы работы с компьютером, интернетом и цифровыми устройствами', 'monitor', 1),
('office_applications', 'Офисные приложения', 'MS Office, Google Workspace, LibreOffice и аналоги', 'file-text', 2),
('communication_tools', 'Коммуникационные инструменты', 'Видеоконференции, мессенджеры, корпоративные платформы', 'message-circle', 3),
('data_analysis', 'Работа с данными', 'Excel, аналитика, визуализация данных, базовая статистика', 'bar-chart', 4),
('digital_security', 'Цифровая безопасность', 'Пароли, защита данных, фишинг, резервное копирование', 'shield', 5),
('online_presence', 'Онлайн-присутствие', 'Социальные сети, профессиональные платформы, цифровая репутация', 'globe', 6);

-- Регионы
INSERT INTO regions (name, name_ru, federal_district) VALUES
('moscow', 'Москва', 'Центральный'),
('saint_petersburg', 'Санкт-Петербург', 'Северо-Западный'),
('moscow_region', 'Московская область', 'Центральный'),
('krasnodar_krai', 'Краснодарский край', 'Южный'),
('rostov_region', 'Ростовская область', 'Южный'),
('sverdlovsk_region', 'Свердловская область', 'Уральский'),
('novosibirsk_region', 'Новосибирская область', 'Сибирский'),
('tatarstan', 'Республика Татарстан', 'Приволжский'),
('nizhny_novgorod_region', 'Нижегородская область', 'Приволжский'),
('samara_region', 'Самарская область', 'Приволжский');

-- Профессии
INSERT INTO professions (name, name_ru, description, industry, is_ict_related) VALUES
('accountant', 'Бухгалтер', 'Ведение бухгалтерского учета, составление отчетности', 'Экономика и финансы', false),
('financial_analyst', 'Финансовый аналитик', 'Анализ финансовых данных, подготовка отчетов', 'Экономика и финансы', false),
('hr_specialist', 'HR-специалист', 'Управление персоналом, подбор кадров', 'Управление', false),
('project_manager', 'Менеджер проектов', 'Планирование и управление проектами', 'Управление', false),
('marketing_specialist', 'Маркетолог', 'Продвижение товаров и услуг, анализ рынка', 'Маркетинг', false),
('sales_manager', 'Менеджер по продажам', 'Продажи, работа с клиентами', 'Продажи', false),
('teacher', 'Учитель', 'Преподавание в школе', 'Образование', false),
('doctor', 'Врач', 'Медицинская практика, лечение пациентов', 'Здравоохранение', false),
('lawyer', 'Юрист', 'Правовое консультирование, ведение дел', 'Юриспруденция', false),
('office_manager', 'Офис-менеджер', 'Административное управление офисом', 'Управление', false);

-- Навыки (добавляем после создания категорий)
INSERT INTO digital_skills (category_id, name, name_ru, description, order_index)
SELECT 
  dsc.id,
  skill_data.name,
  skill_data.name_ru,
  skill_data.description,
  skill_data.order_index
FROM digital_skill_categories dsc
CROSS JOIN (
  VALUES
    ('basic_digital_literacy', 'computer_basics', 'Основы работы с ПК', 'Включение/выключение, файловая система, установка программ', 1),
    ('basic_digital_literacy', 'internet_browsing', 'Работа с интернетом', 'Браузеры, поиск информации, скачивание файлов', 2),
    ('basic_digital_literacy', 'email_usage', 'Электронная почта', 'Отправка, получение, вложения, папки', 3),
    ('office_applications', 'word_processing', 'Текстовые редакторы', 'MS Word, Google Docs, форматирование, стили', 1),
    ('office_applications', 'spreadsheets', 'Электронные таблицы', 'Excel, Google Sheets, формулы, графики', 2),
    ('office_applications', 'presentations', 'Презентации', 'PowerPoint, Google Slides, дизайн слайдов', 3),
    ('communication_tools', 'video_conferencing', 'Видеоконференции', 'Zoom, Teams, Meet, организация встреч', 1),
    ('communication_tools', 'instant_messaging', 'Мессенджеры', 'WhatsApp, Telegram, корпоративные чаты', 2),
    ('data_analysis', 'excel_advanced', 'Продвинутый Excel', 'Сводные таблицы, макросы, сложные формулы', 1),
    ('data_analysis', 'data_visualization', 'Визуализация данных', 'Графики, диаграммы, дашборды', 2),
    ('digital_security', 'password_management', 'Управление паролями', 'Сложные пароли, менеджеры паролей, 2FA', 1),
    ('digital_security', 'phishing_awareness', 'Распознавание фишинга', 'Подозрительные письма, ссылки, социальная инженерия', 2),
    ('online_presence', 'social_media', 'Социальные сети', 'Facebook, Instagram, профессиональное использование', 1),
    ('online_presence', 'linkedin_usage', 'LinkedIn', 'Профиль, нетворкинг, поиск работы', 2)
) AS skill_data(category_name, name, name_ru, description, order_index)
WHERE dsc.name = skill_data.category_name;

-- Образовательные ресурсы
INSERT INTO learning_resources (title, description, provider, resource_type, duration_hours, price_rub, difficulty_level, rating) VALUES
('Основы компьютерной грамотности', 'Базовый курс по работе с компьютером для начинающих', 'Stepik', 'course', 20, 0, 'beginner', 4.5),
('Microsoft Excel для всех', 'Полный курс по работе с Excel от базового до продвинутого уровня', 'Coursera', 'course', 40, 2990, 'intermediate', 4.7),
('Цифровая безопасность в повседневной жизни', 'Как защитить себя в интернете', 'Лекториум', 'course', 15, 0, 'beginner', 4.3);

-- Сообщение об успешной установке
SELECT 'База данных успешно настроена! Теперь можно использовать самодиагностику.' as status;

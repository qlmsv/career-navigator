-- ПОЛНАЯ НАСТРОЙКА БД для Карьерного навигатора
-- Выполните этот файл в Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- 5. САМООЦЕНКИ ПОЛЬЗОВАТЕЛЕЙ
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

-- 6. ДЕТАЛЬНЫЕ ОЦЕНКИ НАВЫКОВ
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

-- 7. ОБРАЗОВАТЕЛЬНЫЕ РЕСУРСЫ
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
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения справочных данных
DROP POLICY IF EXISTS "Public read access for skill categories" ON digital_skill_categories;
CREATE POLICY "Public read access for skill categories" ON digital_skill_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for skills" ON digital_skills;
CREATE POLICY "Public read access for skills" ON digital_skills FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for regions" ON regions;
CREATE POLICY "Public read access for regions" ON regions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for professions" ON professions;
CREATE POLICY "Public read access for professions" ON professions FOR SELECT USING (is_active = true AND is_ict_related = false);

DROP POLICY IF EXISTS "Public read access for learning resources" ON learning_resources;
CREATE POLICY "Public read access for learning resources" ON learning_resources FOR SELECT USING (is_active = true);

-- Политики для пользовательских данных (только владелец)
DROP POLICY IF EXISTS "Users can manage their own assessments" ON user_skill_assessments;
CREATE POLICY "Users can manage their own assessments" ON user_skill_assessments 
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own skill scores" ON user_skill_scores;
CREATE POLICY "Users can manage their own skill scores" ON user_skill_scores 
  FOR ALL USING (
    assessment_id IN (
      SELECT id FROM user_skill_assessments WHERE user_id = auth.uid()
    )
  );

-- ========== НАЧАЛЬНЫЕ ДАННЫЕ ==========

-- 1. КАТЕГОРИИ ЦИФРОВЫХ НАВЫКОВ
INSERT INTO digital_skill_categories (name, name_ru, description, icon, order_index) VALUES
('basic_digital_literacy', 'Базовая цифровая грамотность', 'Основы работы с компьютером, интернетом и цифровыми устройствами', 'monitor', 1),
('office_applications', 'Офисные приложения', 'MS Office, Google Workspace, LibreOffice и аналоги', 'file-text', 2),
('communication_tools', 'Коммуникационные инструменты', 'Видеоконференции, мессенджеры, корпоративные платформы', 'message-circle', 3),
('data_analysis', 'Работа с данными', 'Excel, аналитика, визуализация данных, базовая статистика', 'bar-chart', 4),
('digital_security', 'Цифровая безопасность', 'Пароли, защита данных, фишинг, резервное копирование', 'shield', 5),
('online_presence', 'Онлайн-присутствие', 'Социальные сети, профессиональные платформы, цифровая репутация', 'globe', 6)
ON CONFLICT (name) DO NOTHING;

-- 2. ЦИФРОВЫЕ НАВЫКИ по категориям
INSERT INTO digital_skills (category_id, name, name_ru, description, order_index) VALUES
-- Базовая цифровая грамотность
((SELECT id FROM digital_skill_categories WHERE name = 'basic_digital_literacy'), 'computer_basics', 'Основы работы с ПК', 'Включение/выключение, файловая система, установка программ', 1),
((SELECT id FROM digital_skill_categories WHERE name = 'basic_digital_literacy'), 'internet_browsing', 'Работа с интернетом', 'Браузеры, поиск информации, скачивание файлов', 2),
((SELECT id FROM digital_skill_categories WHERE name = 'basic_digital_literacy'), 'email_usage', 'Электронная почта', 'Отправка, получение, вложения, папки', 3),
((SELECT id FROM digital_skill_categories WHERE name = 'basic_digital_literacy'), 'mobile_devices', 'Мобильные устройства', 'Смартфоны, планшеты, приложения, синхронизация', 4),

-- Офисные приложения
((SELECT id FROM digital_skill_categories WHERE name = 'office_applications'), 'word_processing', 'Текстовые редакторы', 'MS Word, Google Docs, форматирование, стили', 1),
((SELECT id FROM digital_skill_categories WHERE name = 'office_applications'), 'spreadsheets', 'Электронные таблицы', 'Excel, Google Sheets, формулы, графики', 2),
((SELECT id FROM digital_skill_categories WHERE name = 'office_applications'), 'presentations', 'Презентации', 'PowerPoint, Google Slides, дизайн слайдов', 3),
((SELECT id FROM digital_skill_categories WHERE name = 'office_applications'), 'pdf_handling', 'Работа с PDF', 'Просмотр, создание, редактирование PDF-файлов', 4),

-- Коммуникационные инструменты
((SELECT id FROM digital_skill_categories WHERE name = 'communication_tools'), 'video_conferencing', 'Видеоконференции', 'Zoom, Teams, Meet, организация встреч', 1),
((SELECT id FROM digital_skill_categories WHERE name = 'communication_tools'), 'instant_messaging', 'Мессенджеры', 'WhatsApp, Telegram, корпоративные чаты', 2),
((SELECT id FROM digital_skill_categories WHERE name = 'communication_tools'), 'collaboration_platforms', 'Платформы сотрудничества', 'Slack, Trello, Notion, совместная работа', 3),
((SELECT id FROM digital_skill_categories WHERE name = 'communication_tools'), 'calendar_management', 'Управление календарем', 'Google Calendar, Outlook, планирование встреч', 4),

-- Работа с данными
((SELECT id FROM digital_skill_categories WHERE name = 'data_analysis'), 'excel_advanced', 'Продвинутый Excel', 'Сводные таблицы, макросы, сложные формулы', 1),
((SELECT id FROM digital_skill_categories WHERE name = 'data_analysis'), 'data_visualization', 'Визуализация данных', 'Графики, диаграммы, дашборды', 2),
((SELECT id FROM digital_skill_categories WHERE name = 'data_analysis'), 'basic_statistics', 'Базовая статистика', 'Среднее, медиана, корреляция, тренды', 3),
((SELECT id FROM digital_skill_categories WHERE name = 'data_analysis'), 'database_basics', 'Основы баз данных', 'SQL запросы, фильтрация, сортировка', 4),

-- Цифровая безопасность
((SELECT id FROM digital_skill_categories WHERE name = 'digital_security'), 'password_management', 'Управление паролями', 'Сложные пароли, менеджеры паролей, 2FA', 1),
((SELECT id FROM digital_skill_categories WHERE name = 'digital_security'), 'phishing_awareness', 'Распознавание фишинга', 'Подозрительные письма, ссылки, социальная инженерия', 2),
((SELECT id FROM digital_skill_categories WHERE name = 'digital_security'), 'data_backup', 'Резервное копирование', 'Облачные хранилища, локальные копии, восстановление', 3),
((SELECT id FROM digital_skill_categories WHERE name = 'digital_security'), 'privacy_settings', 'Настройки приватности', 'Социальные сети, браузеры, персональные данные', 4),

-- Онлайн-присутствие
((SELECT id FROM digital_skill_categories WHERE name = 'online_presence'), 'social_media', 'Социальные сети', 'Facebook, Instagram, профессиональное использование', 1),
((SELECT id FROM digital_skill_categories WHERE name = 'online_presence'), 'linkedin_usage', 'LinkedIn', 'Профиль, нетворкинг, поиск работы', 2),
((SELECT id FROM digital_skill_categories WHERE name = 'online_presence'), 'online_reputation', 'Цифровая репутация', 'Управление репутацией, поиск себя в интернете', 3),
((SELECT id FROM digital_skill_categories WHERE name = 'online_presence'), 'digital_etiquette', 'Цифровой этикет', 'Культура общения онлайн, профессиональная переписка', 4)
ON CONFLICT (category_id, name) DO NOTHING;

-- 3. РЕГИОНЫ (основные регионы России)
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
('samara_region', 'Самарская область', 'Приволжский'),
('chelyabinsk_region', 'Челябинская область', 'Уральский'),
('bashkortostan', 'Республика Башкортостан', 'Приволжский'),
('krasnoyarsk_krai', 'Красноярский край', 'Сибирский'),
('perm_krai', 'Пермский край', 'Приволжский'),
('voronezh_region', 'Воронежская область', 'Центральный')
ON CONFLICT (name) DO NOTHING;

-- 4. ПРОФЕССИИ (не связанные с ИКТ)
INSERT INTO professions (name, name_ru, description, industry, is_ict_related) VALUES
-- Экономика и финансы
('accountant', 'Бухгалтер', 'Ведение бухгалтерского учета, составление отчетности', 'Экономика и финансы', false),
('financial_analyst', 'Финансовый аналитик', 'Анализ финансовых данных, подготовка отчетов', 'Экономика и финансы', false),
('economist', 'Экономист', 'Экономический анализ, планирование, прогнозирование', 'Экономика и финансы', false),

-- Управление и администрирование
('hr_specialist', 'HR-специалист', 'Управление персоналом, подбор кадров', 'Управление', false),
('project_manager', 'Менеджер проектов', 'Планирование и управление проектами', 'Управление', false),
('office_manager', 'Офис-менеджер', 'Административное управление офисом', 'Управление', false),

-- Маркетинг и продажи
('marketing_specialist', 'Маркетолог', 'Продвижение товаров и услуг, анализ рынка', 'Маркетинг', false),
('sales_manager', 'Менеджер по продажам', 'Продажи, работа с клиентами', 'Продажи', false),
('content_manager', 'Контент-менеджер', 'Создание и управление контентом', 'Маркетинг', false),

-- Образование
('teacher', 'Учитель', 'Преподавание в школе', 'Образование', false),
('university_lecturer', 'Преподаватель вуза', 'Преподавание в высшем учебном заведении', 'Образование', false),

-- Здравоохранение
('doctor', 'Врач', 'Медицинская практика, лечение пациентов', 'Здравоохранение', false),
('nurse', 'Медсестра', 'Медицинский уход за пациентами', 'Здравоохранение', false),

-- Юриспруденция
('lawyer', 'Юрист', 'Правовое консультирование, ведение дел', 'Юриспруденция', false),

-- Производство
('production_manager', 'Менеджер производства', 'Управление производственными процессами', 'Производство', false),
('quality_control', 'Контролер качества', 'Контроль качества продукции', 'Производство', false),

-- Логистика
('logistics_specialist', 'Логист', 'Управление поставками и складскими операциями', 'Логистика', false),

-- Туризм
('travel_agent', 'Турагент', 'Организация туристических поездок', 'Туризм', false),

-- Банковская сфера
('bank_clerk', 'Банковский служащий', 'Обслуживание клиентов в банке', 'Банковская сфера', false),

-- Государственная служба
('civil_servant', 'Государственный служащий', 'Работа в государственных органах', 'Государственная служба', false)
ON CONFLICT (name) DO NOTHING;

-- 5. ПРИМЕРЫ ОБРАЗОВАТЕЛЬНЫХ РЕСУРСОВ
INSERT INTO learning_resources (title, description, provider, url, resource_type, target_skills, duration_hours, price_rub, difficulty_level, rating) VALUES
('Основы компьютерной грамотности', 'Базовый курс по работе с компьютером для начинающих', 'Stepik', 'https://stepik.org', 'course', '["computer_basics", "internet_browsing"]', 20, 0, 'beginner', 4.5),
('Microsoft Excel для всех', 'Полный курс по работе с Excel от базового до продвинутого уровня', 'Coursera', 'https://coursera.org', 'course', '["spreadsheets", "excel_advanced"]', 40, 2990, 'intermediate', 4.7),
('Цифровая безопасность в повседневной жизни', 'Как защитить себя в интернете', 'Лекториум', 'https://lektorium.tv', 'course', '["password_management", "phishing_awareness"]', 15, 0, 'beginner', 4.3),
('LinkedIn для профессионалов', 'Создание эффективного профиля и нетворкинг', 'Нетология', 'https://netology.ru', 'course', '["linkedin_usage", "online_reputation"]', 10, 1500, 'beginner', 4.4),
('Визуализация данных в Excel', 'Создание профессиональных графиков и диаграмм', 'SkillFactory', 'https://skillfactory.ru', 'course', '["data_visualization", "excel_advanced"]', 25, 4990, 'intermediate', 4.6)
ON CONFLICT DO NOTHING;

-- Сообщение об успешной установке
SELECT 'База данных для Карьерного навигатора успешно настроена!' as status;

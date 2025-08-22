-- Отключение RLS политик для всех таблиц Карьерного навигатора
-- Выполните этот скрипт в Supabase SQL Editor

-- Отключаем RLS для всех таблиц
ALTER TABLE digital_skill_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE digital_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE professions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE profession_skill_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE regional_salary_data DISABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT 
    'digital_skill_categories' as table_name,
    (SELECT COUNT(*) FROM digital_skill_categories) as record_count
UNION ALL
SELECT 
    'digital_skills' as table_name,
    (SELECT COUNT(*) FROM digital_skills) as record_count
UNION ALL
SELECT 
    'regions' as table_name,
    (SELECT COUNT(*) FROM regions) as record_count
UNION ALL
SELECT 
    'professions' as table_name,
    (SELECT COUNT(*) FROM professions) as record_count;

-- Сообщение об успехе
SELECT '✅ RLS отключен для всех таблиц! Приложение должно работать.' as status;

-- Разрешаем NULL значения в work_experience для возможности создания пустых записей
ALTER TABLE work_experience 
ALTER COLUMN company_name DROP NOT NULL,
ALTER COLUMN position_title DROP NOT NULL;

-- Добавляем проверку что хотя бы одно поле заполнено
ALTER TABLE work_experience 
ADD CONSTRAINT work_experience_not_all_null 
CHECK (
  company_name IS NOT NULL OR 
  position_title IS NOT NULL OR 
  description IS NOT NULL
);

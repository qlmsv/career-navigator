-- Сделать всех существующих пользователей админами
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавляем роль 'admin' для всех пользователей из auth.users
INSERT INTO user_roles (user_id, role, is_active, granted_at)
SELECT 
  id as user_id,
  'admin' as role,
  true as is_active,
  NOW() as granted_at
FROM auth.users
WHERE id NOT IN (
  -- Исключаем пользователей, у которых уже есть роль admin
  SELECT user_id FROM user_roles WHERE role = 'admin' AND is_active = true
);

-- Показываем результат
SELECT 
  u.email,
  ur.role,
  ur.is_active,
  ur.granted_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.granted_at DESC;

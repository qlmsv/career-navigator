# Настройка базы данных

## Проблема
В логах приложения видны ошибки:
- `Could not find the table 'public.tests' in the schema cache`
- `Multiple GoTrueClient instances detected`

## Решение

### 1. Создание таблиц в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Скопируйте и выполните содержимое файла `database-setup-minimal.sql`

**Примечание:** 
- Если вы получили ошибку `ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification`, используйте `database-setup-minimal.sql`
- Если вы получили ошибку о том, что политики уже существуют, используйте `database-setup-safe.sql`
- `database-setup-minimal.sql` - самый простой и надежный вариант

### 2. Проверка создания таблиц

После выполнения SQL скрипта, проверьте, что таблицы созданы:

```bash
curl -X GET "https://career-navigator-production.up.railway.app/api/check-tables"
```

Ожидаемый ответ:
```json
{
  "success": true,
  "tables": {
    "tests": true,
    "test_categories": true,
    "questions": true,
    "answer_options": true
  }
}
```

### 3. Создание тестовых данных

После создания таблиц, создайте тестовые данные:

```bash
curl -X POST "https://career-navigator-production.up.railway.app/api/init-test-data"
```

## Структура таблиц

### test_categories
- Категории тестов (Программирование, Дизайн, Маркетинг и т.д.)

### tests
- Основная информация о тестах
- Связь с категориями
- Настройки теста (время, проходной балл и т.д.)

### questions
- Вопросы тестов
- Типы вопросов (множественный выбор, множественный выбор и т.д.)

### answer_options
- Варианты ответов на вопросы
- Отметка правильных ответов

### test_attempts
- Попытки прохождения тестов пользователями
- Результаты и статистика

### user_answers
- Ответы пользователей на конкретные вопросы
- Связь с попытками прохождения

## RLS (Row Level Security)

Все таблицы защищены политиками RLS:
- Публичные тесты доступны всем
- Пользователи могут создавать свои попытки прохождения
- Пользователи видят только свои результаты

## После настройки

После выполнения всех шагов:
1. Ошибки 404 должны исчезнуть
2. Предупреждение о множественных клиентах должно исчезнуть
3. Платформа тестирования будет полностью функциональна

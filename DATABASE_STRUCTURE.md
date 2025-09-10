# 🗄️ Структура базы данных Career Navigator

## 📊 Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTH.USERS                              │
│                    (Supabase Auth)                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:1
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER_PROFILES                               │
│ • id (UUID)                                                    │
│ • user_id (FK → auth.users)                                   │
│ • full_name, first_name, last_name                            │
│ • phone, location, age, birth_date                            │
│ • current_position, current_company, industry                 │
│ • experience_level, total_experience                          │
│ • university, degree, specialization                          │
│ • key_skills (JSONB), technical_skills (JSONB)                │
│ • work_format, career_goals                                   │
│ • profile_completeness (0-100)                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:N
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   WORK_EXPERIENCE                              │
│ • id (UUID)                                                    │
│ • user_id (FK → auth.users)                                   │
│ • company_name, position_title                                │
│ • start_date, end_date, duration_months                       │
│ • description, achievements (JSONB)                           │
│ • technologies (JSONB), team_size                             │
│ • is_current, order_index                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  EDUCATION_HISTORY                             │
│ • id (UUID)                                                    │
│ • user_id (FK → auth.users)                                   │
│ • institution_name, degree_type                               │
│ • specialization, start_year, graduation_year                 │
│ • education_type, location                                    │
│ • order_index                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TEST_RESULTS                               │
│ • id (UUID)                                                    │
│ • user_id (FK → auth.users)                                   │
│ • big_five_scores (JSONB)                                     │
│ • dominant_archetype                                           │
│ • all_answers (JSONB)                                         │
│ • ai_analysis (JSONB)                                         │
│ • answers (JSONB), raw_scores (JSONB)                         │
│ • archetype, personality_traits (JSONB)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🧪 Система тестирования

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER_ROLES                                  │
│ • id (UUID)                                                    │
│ • user_id (FK → auth.users)                                   │
│ • role (admin/moderator/user)                                 │
│ • granted_by, granted_at, expires_at                          │
│ • is_active                                                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ N:1
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TEST_CATEGORIES                               │
│ • id (UUID)                                                    │
│ • name, name_ru                                                │
│ • description, icon, color                                     │
│ • order_index, is_active                                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:N
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       TESTS                                    │
│ • id (UUID)                                                    │
│ • title, title_ru, description, description_ru                │
│ • category_id (FK → test_categories)                          │
│ • author_id (FK → auth.users)                                 │
│ • time_limit_minutes, passing_score                           │
│ • max_attempts, shuffle_questions, shuffle_answers            │
│ • status (draft/published/archived)                           │
│ • is_public, requires_auth                                    │
│ • total_questions, total_attempts                             │
│ • average_score, completion_rate                              │
│ • tags (JSONB), instructions                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:N
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     QUESTIONS                                  │
│ • id (UUID)                                                    │
│ • test_id (FK → tests)                                        │
│ • question_text, question_text_ru                             │
│ • question_type (multiple_choice/multiple_select/true_false/  │
│   rating_scale/text_input/number_input/file_upload)           │
│ • points, required, order_index                               │
│ • explanation, media_url                                      │
│ • difficulty_level, tags (JSONB)                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:N
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ANSWER_OPTIONS                               │
│ • id (UUID)                                                    │
│ • question_id (FK → questions)                                │
│ • option_text, option_text_ru                                 │
│ • is_correct, points                                          │
│ • order_index, explanation                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Прохождение тестов

```
┌─────────────────────────────────────────────────────────────────┐
│                   TEST_ATTEMPTS                                │
│ • id (UUID)                                                    │
│ • test_id (FK → tests)                                        │
│ • user_id (FK → auth.users, nullable)                         │
│ • status (in_progress/completed/abandoned/timeout)            │
│ • score, max_possible_score, percentage                       │
│ • passed, started_at, completed_at                            │
│ • time_spent_seconds                                          │
│ • user_agent, ip_address, session_data (JSONB)                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:N
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER_ANSWERS                                │
│ • id (UUID)                                                    │
│ • attempt_id (FK → test_attempts)                             │
│ • question_id (FK → questions)                                │
│ • answer_data (JSONB)                                         │
│ • is_correct, points_earned, max_points                       │
│ • answered_at, time_spent_seconds                             │
│ • confidence_level (1-5)                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ 1:1
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TEST_RESULTS_NEW                              │
│ • id (UUID)                                                    │
│ • attempt_id (FK → test_attempts)                             │
│ • detailed_scores (JSONB)                                     │
│ • strengths, weaknesses, recommendations (JSONB)              │
│ • ai_analysis, ai_recommendations (JSONB)                     │
│ • percentile_rank, average_comparison (JSONB)                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Дополнительные таблицы

```
┌─────────────────────────────────────────────────────────────────┐
│                  TEST_TEMPLATES                                │
│ • id (UUID)                                                    │
│ • name, name_ru, description                                  │
│ • category_id (FK → test_categories)                          │
│ • template_data (JSONB)                                       │
│ • is_public, usage_count                                      │
│ • created_by (FK → auth.users)                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   TEST_FEEDBACK                                │
│ • id (UUID)                                                    │
│ • test_id (FK → tests)                                        │
│ • user_id (FK → auth.users, nullable)                         │
│ • rating (1-5), comment                                       │
│ • is_anonymous                                                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔑 Ключевые особенности

### **1. Поддержка анонимных пользователей**
- `test_attempts.user_id` может быть `NULL`
- `user_answers` привязываются к `attempt_id`
- Данные хранятся 24 часа в localStorage

### **2. Гибкая система вопросов**
- **multiple_choice** - один правильный ответ
- **multiple_select** - несколько правильных ответов
- **true_false** - да/нет
- **rating_scale** - шкала оценок
- **text_input** - текстовый ввод
- **number_input** - числовой ввод
- **file_upload** - загрузка файлов

### **3. Многоязычность**
- Все тексты дублируются на русском (`_ru` поля)
- Поддержка локализации интерфейса

### **4. JSONB поля для гибкости**
- `key_skills`, `technical_skills` - массивы навыков
- `achievements`, `technologies` - структурированные данные
- `session_data` - временные данные сессии
- `ai_analysis` - результаты AI анализа

### **5. Статистика и аналитика**
- Автоматический подсчет `average_score`, `completion_rate`
- Триггеры для обновления статистики
- Детальные результаты с AI анализом

### **6. Безопасность (RLS)**
- Пользователи видят только свои данные
- Публичный доступ к опубликованным тестам
- Любой авторизованный пользователь = админ

## 📈 Индексы для производительности

```sql
-- Основные индексы
idx_user_profiles_user_id
idx_work_experience_user_id
idx_education_history_user_id
idx_test_results_user_id

-- Система тестирования
idx_user_roles_user_id
idx_tests_category, idx_tests_author, idx_tests_status
idx_questions_test, idx_questions_type
idx_answer_options_question
idx_test_attempts_test, idx_test_attempts_user
idx_user_answers_attempt, idx_user_answers_question
```

## 🚀 Готовые данные

После применения миграции будут созданы базовые категории:
- **Общие знания** (General Knowledge)
- **Цифровые навыки** (Digital Skills)  
- **Программирование** (Programming)
- **Бизнес** (Business)

---

**Всего таблиц: 15**  
**Поддержка: анонимные пользователи, многоязычность, AI анализ, детальная статистика**

# Настройка базы данных для Career Navigator

## Текущая архитектура

Ваш проект использует **Supabase** как БД. Это PostgreSQL в облаке.

```
Next.js (хостинг) ──▶ Supabase (БД в облаке)
```

---

## Вариант 1: Оставить Supabase ✅ РЕКОМЕНДУЕТСЯ

### Преимущества:

- ✅ **Бесплатно** (до 500 MB, 2 GB bandwidth/месяц)
- ✅ **Автоматические бэкапы**
- ✅ **Нет настройки**
- ✅ **REST API из коробки**
- ✅ **Работает с любым хостингом**

### Что нужно:

Просто добавьте переменные окружения на хостинге:

**Для Vercel:**

1. Settings → Environment Variables
2. Добавьте:

```
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Для VPS:**

1. Создайте файл `.env.production`
2. Добавьте те же переменные

**Для Railway:**

1. Variables tab
2. Добавьте переменные

### Где взять ключи Supabase:

1. Зайдите на [supabase.com](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Settings → API
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Лимиты бесплатного тарифа:

- ✅ 500 MB база данных
- ✅ 2 GB bandwidth/месяц
- ✅ 50,000 ежемесячных запросов
- ✅ Unlimited API requests
- ✅ 500 MB file storage

**Для вашего проекта этого более чем достаточно!**

---

## Вариант 2: PostgreSQL на VPS (Reg.ru)

Используйте только если:

- ❌ Нужна БД в России
- ❌ Supabase заблокирован
- ❌ Нужно > 500 MB

### Шаг 1: Установка PostgreSQL

На VPS выполните:

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Запуск и автостарт
systemctl start postgresql
systemctl enable postgresql

# Проверка версии
psql --version  # PostgreSQL 15.x
```

### Шаг 2: Создание базы данных

```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql

# В консоли PostgreSQL:
CREATE DATABASE career_navigator;
CREATE USER career_user WITH ENCRYPTED PASSWORD 'сильный_пароль_123';
GRANT ALL PRIVILEGES ON DATABASE career_navigator TO career_user;

# Даем права на схему public
\c career_navigator
GRANT ALL ON SCHEMA public TO career_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO career_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO career_user;

# Выход
\q
```

### Шаг 3: Настройка удаленного доступа (опционально)

Если нужен доступ извне VPS:

```bash
# Редактируем конфиг PostgreSQL
nano /etc/postgresql/15/main/postgresql.conf

# Найдите и измените:
listen_addresses = '*'

# Сохраните и выйдите
```

```bash
# Настройка доступа
nano /etc/postgresql/15/main/pg_hba.conf

# Добавьте в конец:
host    all             all             0.0.0.0/0               scram-sha-256

# Сохраните
```

```bash
# Перезапуск PostgreSQL
systemctl restart postgresql

# Разрешаем порт в файрволле
ufw allow 5432/tcp
```

### Шаг 4: Миграция данных из Supabase

#### 4.1. Экспорт из Supabase

```bash
# Подключитесь к Supabase
pg_dump -h db.ваш-проект.supabase.co \
        -U postgres \
        -d postgres \
        --clean \
        --if-exists \
        -f supabase_backup.sql

# Введите пароль из Supabase (Settings → Database)
```

#### 4.2. Импорт в локальную БД

```bash
# Восстановление дампа
psql -U career_user -d career_navigator -f supabase_backup.sql
```

### Шаг 5: Обновление подключения в Next.js

Так как вы используете Supabase клиент, нужно изменить на прямое подключение к PostgreSQL.

**Установите библиотеку:**

```bash
npm install pg
```

**Создайте файл lib/db.ts:**

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'career_navigator',
  user: process.env.DB_USER || 'career_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export default pool
```

**Переменные окружения (.env.production):**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=career_navigator
DB_USER=career_user
DB_PASSWORD=сильный_пароль_123
```

**Обновите API routes:**

```typescript
// Было (Supabase):
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
const { data } = await supabase.from('tests').select('*')

// Стало (PostgreSQL):
import pool from '@/lib/db'
const { rows } = await pool.query('SELECT * FROM tests')
```

### Шаг 6: Создание таблиц (если не импортировали)

Если не делали миграцию из Supabase, создайте таблицы вручную:

```bash
# Подключитесь к БД
sudo -u postgres psql -d career_navigator
```

```sql
-- Таблица администраторов
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица тестов
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  formily_schema JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  show_results BOOLEAN DEFAULT false,
  allow_multiple_attempts BOOLEAN DEFAULT true,
  time_limit_minutes INTEGER,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_responses INTEGER DEFAULT 0
);

-- Таблица ответов
CREATE TABLE test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  user_identifier VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INTEGER,
  score NUMERIC(10,2),
  results_data JSONB
);

-- Индексы
CREATE INDEX idx_tests_status ON tests(status);
CREATE INDEX idx_tests_created_at ON tests(created_at);
CREATE INDEX idx_responses_test_id ON test_responses(test_id);
CREATE INDEX idx_responses_completed_at ON test_responses(completed_at);
```

---

## Вариант 3: Управляемая БД на Reg.ru

Reg.ru предлагает управляемый PostgreSQL:

1. Зайдите на reg.ru → **Базы данных** → **PostgreSQL**
2. Выберите тариф (от ~300₽/мес)
3. Получите:
   - Хост
   - Порт
   - Логин
   - Пароль
4. Используйте как в Варианте 2

### Преимущества:

- ✅ Автоматические бэкапы
- ✅ Мониторинг
- ✅ Техподдержка reg.ru

### Недостатки:

- ❌ Платно
- ❌ Нет REST API (нужно менять код)

---

## Сравнение вариантов

| Критерий           | Supabase  | PostgreSQL на VPS | Управляемая БД |
| ------------------ | --------- | ----------------- | -------------- |
| **Стоимость**      | Бесплатно | Включено в VPS    | ~300₽/мес      |
| **Настройка**      | Готово    | 30 минут          | 10 минут       |
| **Бэкапы**         | Автомат   | Вручную           | Автомат        |
| **API**            | REST API  | Нужно писать      | Нужно писать   |
| **Изменения кода** | Нет       | Да                | Да             |
| **Поддержка**      | Supabase  | Самостоятельно    | Reg.ru         |

---

## 🏆 Рекомендация

### ДЛЯ БОЛЬШИНСТВА СЛУЧАЕВ:

**Оставьте Supabase!**

- ✅ Уже работает
- ✅ Бесплатно
- ✅ Не нужно ничего менять
- ✅ Автобэкапы
- ✅ Масштабируется

### ПЕРЕНОС НА СВОЮ БД НУЖЕН ТОЛЬКО ЕСЛИ:

- Требования к размещению данных в РФ
- Нужно > 500 MB
- Supabase заблокирован
- Специфические требования к производительности

---

## Бэкапы Supabase

Даже если используете Supabase, делайте бэкапы:

### Автоматические бэкапы:

1. Зайдите в Supabase Dashboard
2. Database → Backups
3. Включите Daily Backups (бесплатно)

### Ручной бэкап:

```bash
# Установите Supabase CLI
npm install -g supabase

# Логин
supabase login

# Экспорт базы
supabase db dump -f backup_$(date +%Y%m%d).sql
```

---

## Мониторинг базы данных

### Для Supabase:

1. Dashboard → Database → Metrics
2. Смотрите:
   - Active connections
   - Database size
   - Query performance

### Для PostgreSQL на VPS:

```bash
# Статистика БД
sudo -u postgres psql -c "SELECT
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;"

# Активные подключения
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Итого

**Для вашего проекта:**

1. **Используйте Supabase** (уже настроено)
2. Работает с **любым хостингом** (Vercel/VPS/Railway)
3. Просто добавьте переменные окружения на новом хостинге
4. **Ничего не нужно менять!**

---

**Готово!** База данных готова к работе с любым хостингом.

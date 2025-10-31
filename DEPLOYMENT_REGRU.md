# Деплой Next.js приложения на VPS от Reg.ru

## Шаг 1: Заказ VPS на Reg.ru

1. Перейдите на [reg.ru](https://www.reg.ru) → **Хостинг и серверы** → **VPS**
2. Выберите тариф:
   - **Рекомендуемый:** VPS-2 (2 GB RAM, 2 vCPU)
   - **Минимальный:** VPS-1 (1 GB RAM) - может быть недостаточно
3. Параметры:
   - **ОС:** Ubuntu 22.04 LTS
   - **Панель управления:** Не требуется (будем настраивать вручную)
   - **Срок:** На ваше усмотрение

4. После заказа получите:
   - IP-адрес сервера (например: 123.45.67.89)
   - Логин: root
   - Пароль для доступа

---

## Шаг 2: Подключение к серверу

### Через SSH (macOS/Linux)

```bash
ssh root@ВАШ_IP_АДРЕС
```

Введите пароль от VPS.

### Через PuTTY (Windows)

1. Скачайте [PuTTY](https://www.putty.org/)
2. Введите IP-адрес
3. Port: 22
4. Connection Type: SSH
5. Login as: root
6. Введите пароль

---

## Шаг 3: Настройка сервера

После подключения выполните команды:

### 3.1. Обновление системы

```bash
apt update && apt upgrade -y
```

### 3.2. Установка Node.js 20

```bash
# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Проверка версии
node --version  # Должно быть v20.x.x
npm --version   # Должно быть 10.x.x
```

### 3.3. Установка Git

```bash
apt install -y git
```

### 3.4. Установка PM2 (менеджер процессов)

```bash
npm install -g pm2
```

### 3.5. Установка Nginx (веб-сервер)

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 3.6. Установка Certbot (для SSL)

```bash
apt install -y certbot python3-certbot-nginx
```

---

## Шаг 4: Клонирование проекта

### 4.1. Создание пользователя для приложения

```bash
# Создаем пользователя deploy
adduser deploy
usermod -aG sudo deploy

# Переключаемся на пользователя
su - deploy
```

### 4.2. Клонирование репозитория

```bash
cd ~
git clone https://github.com/ВАШ_USERNAME/career-navigator.git
cd career-navigator
```

**Альтернатива:** Если репозиторий приватный:

```bash
# Создайте Personal Access Token на GitHub
git clone https://TOKEN@github.com/ВАШ_USERNAME/career-navigator.git
```

---

## Шаг 5: Настройка переменных окружения

### 5.1. Создание .env файла

```bash
cd ~/career-navigator
nano .env.production
```

Вставьте:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ВАШ_ПРОЕКТ.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_анон_ключ
SUPABASE_SERVICE_ROLE_KEY=ваш_сервис_ключ

# URL приложения
NEXT_PUBLIC_APP_URL=https://ваш-домен.ru

# Node.js
NODE_ENV=production
```

Сохраните: `Ctrl+X`, затем `Y`, затем `Enter`

### 5.2. Загрузка переменных

```bash
export $(cat .env.production | xargs)
```

---

## Шаг 6: Установка зависимостей и сборка

```bash
cd ~/career-navigator

# Установка зависимостей
npm ci --production=false

# Сборка проекта
npm run build
```

**Важно:** Если возникнут ошибки памяти:

```bash
# Увеличьте лимит памяти для Node.js
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

---

## Шаг 7: Запуск приложения через PM2

### 7.1. Создание PM2 конфигурации

```bash
nano ecosystem.config.js
```

Вставьте:

```javascript
module.exports = {
  apps: [{
    name: 'career-navigator',
    script: 'npm',
    args: 'start',
    cwd: '/home/deploy/career-navigator',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
}
```

Сохраните.

### 7.2. Запуск приложения

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Выполните команду, которую выдаст `pm2 startup`.

### 7.3. Проверка статуса

```bash
pm2 status
pm2 logs career-navigator
```

Приложение запущено на `http://localhost:3000`

---

## Шаг 8: Настройка Nginx

### 8.1. Выход из пользователя deploy

```bash
exit  # Возвращаемся к root
```

### 8.2. Создание конфигурации Nginx

```bash
nano /etc/nginx/sites-available/career-navigator
```

Вставьте (замените **ваш-домен.ru**):

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Увеличенный таймаут для больших запросов
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Статические файлы Next.js
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Файлы загрузок
    location /uploads {
        alias /home/deploy/career-navigator/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Сохраните.

### 8.3. Активация конфигурации

```bash
# Создаем символическую ссылку
ln -s /etc/nginx/sites-available/career-navigator /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию
rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl restart nginx
```

---

## Шаг 9: Настройка DNS на Reg.ru

1. Зайдите в [reg.ru](https://www.reg.ru) → **Мои домены**
2. Выберите ваш домен → **Управление доменом** → **DNS-серверы и зона**
3. Добавьте A-записи:

   | Тип | Субдомен | Значение | TTL |
   |-----|----------|----------|-----|
   | A   | @        | ВАШ_IP_VPS | 3600 |
   | A   | www      | ВАШ_IP_VPS | 3600 |

4. Сохраните изменения

**Важно:** DNS может обновляться до 24 часов, но обычно это 15-30 минут.

---

## Шаг 10: Настройка SSL (HTTPS)

После того как DNS заработает:

```bash
# Получение SSL сертификата от Let's Encrypt
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с ToS
# - Выберите: Redirect HTTP to HTTPS (рекомендуется)
```

Certbot автоматически:
- Получит SSL сертификат
- Обновит конфигурацию Nginx
- Настроит автообновление

### 10.1. Проверка автообновления

```bash
certbot renew --dry-run
```

---

## Шаг 11: Проверка работы

Откройте в браузере:
```
https://ваш-домен.ru
```

Должно открыться ваше приложение с зеленым замком (HTTPS).

---

## Обновление приложения в будущем

### Через SSH:

```bash
# Переключаемся на пользователя deploy
su - deploy
cd ~/career-navigator

# Получаем новый код
git pull origin main

# Устанавливаем зависимости (если были изменения)
npm ci --production=false

# Пересобираем
npm run build

# Перезапускаем PM2
pm2 restart career-navigator
```

---

## Мониторинг и логи

### Просмотр логов PM2

```bash
pm2 logs career-navigator
pm2 logs career-navigator --lines 100
```

### Просмотр логов Nginx

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Статус PM2

```bash
pm2 status
pm2 monit
```

---

## Полезные команды

### PM2

```bash
pm2 restart career-navigator  # Перезапуск
pm2 stop career-navigator     # Остановка
pm2 start career-navigator    # Запуск
pm2 delete career-navigator   # Удаление из PM2
pm2 save                      # Сохранение списка процессов
```

### Nginx

```bash
systemctl restart nginx       # Перезапуск
systemctl status nginx        # Статус
nginx -t                      # Проверка конфигурации
```

### Системные ресурсы

```bash
htop                          # Мониторинг процессов
df -h                         # Использование диска
free -h                       # Использование памяти
```

---

## Troubleshooting

### Приложение не запускается

```bash
# Проверьте логи
pm2 logs career-navigator --lines 100

# Проверьте порты
netstat -tulpn | grep 3000

# Убедитесь, что сборка прошла успешно
cd ~/career-navigator
npm run build
```

### 502 Bad Gateway

```bash
# Проверьте, запущен ли PM2
pm2 status

# Перезапустите приложение
pm2 restart career-navigator

# Проверьте логи Nginx
tail -f /var/log/nginx/error.log
```

### Нет места на диске

```bash
# Очистка кеша npm
npm cache clean --force

# Очистка старых логов PM2
pm2 flush

# Проверка места
df -h
```

---

## Безопасность

### Настройка файрволла (UFW)

```bash
# Разрешаем SSH, HTTP, HTTPS
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
ufw status
```

### Отключение root login через SSH

```bash
nano /etc/ssh/sshd_config

# Найдите и измените:
PermitRootLogin no

# Перезапустите SSH
systemctl restart sshd
```

### Регулярные обновления

```bash
# Каждую неделю
apt update && apt upgrade -y
```

---

## Альтернатива: Docker (опционально)

Если хотите использовать Docker на VPS:

1. Установите Docker
2. Создайте Dockerfile (уже есть в проекте от Railway)
3. Соберите образ
4. Запустите контейнер

Подробнее: [Docker deployment guide](DOCKER_DEPLOYMENT.md)

---

## Стоимость

**VPS-2 на reg.ru:**
- 2 GB RAM, 2 vCPU, 30 GB SSD
- ~400-500 руб/месяц

**VPS-3 на reg.ru:**
- 4 GB RAM, 2 vCPU, 60 GB SSD
- ~700-800 руб/месяц

**SSL сертификат:** Бесплатно (Let's Encrypt)

**Домен:** У вас уже есть

---

## Поддержка

Если возникнут проблемы:
1. Проверьте логи: `pm2 logs`
2. Проверьте статус: `pm2 status`
3. Проверьте Nginx: `nginx -t`
4. Проверьте DNS: `nslookup ваш-домен.ru`

---

**Готово!** Ваше приложение развернуто на VPS от Reg.ru с вашим доменом.

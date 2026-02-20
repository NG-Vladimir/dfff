# Настройка Supabase

## 1. Создать проект

1. Зайдите на [supabase.com](https://supabase.com) и создайте аккаунт
2. **New Project** → введите название (например, `worship`)
3. Задайте пароль базы и выберите регион
4. **Create project**

## 2. Создать таблицы

В Supabase откройте **SQL Editor** и выполните:

```sql
-- Участники
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Назначения
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  role_id TEXT NOT NULL,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  slot INT DEFAULT 0
);

-- Политики (доступ без авторизации)
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on people" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
```

## 3. Получить ключи

1. **Project Settings** → **API**
2. Скопируйте:
   - **Project URL**
   - **anon public** (ключ)

## 4. Добавить в Vercel

1. Vercel → проект → **Settings** → **Environment Variables**
2. Добавьте:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
3. **Deployments** → **Redeploy**

## 5. Для локальной разработки

Создайте файл `.env` в корне проекта:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_ключ
```

Без Supabase приложение работает с localStorage (данные только в браузере).

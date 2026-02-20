# Деплой PWA

## 1. Запушить на GitHub

```bash
cd /Users/vladimir/Desktop/worship

# Создать репозиторий на github.com (новый, пустой)
# Затем:

git init
git add .
git commit -m "График служения PWA"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/worship.git
git push -u origin main
```

## 2. Деплой на Vercel (бесплатно)

1. Зайти на **vercel.com** → войти через GitHub
2. **Add New** → **Project**
3. Импортировать репозиторий **worship**
4. Нажать **Deploy** (настройки по умолчанию подойдут)

Через 1–2 минуты будет ссылка вида: `https://worship-xxx.vercel.app`

Эту ссылку можно открывать на телефоне и ставить PWA на главный экран.

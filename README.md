# Tercel - Приложение для транскрибирования аудиофайлов

Tercel - это современное веб-приложение для транскрибирования аудиофайлов с использованием Fireworks AI API. Приложение имеет элегантный минималистичный интерфейс и обеспечивает удобную работу с аудиофайлами.

## Особенности

- Минималистичный интерфейс с анимированными элементами
- Стильная зона загрузки файлов с визуальной обратной связью
- Отображение результатов транскрибирования в удобном формате
- Возможность копирования и скачивания результатов
- Темная и светлая тема
- Адаптивный дизайн для различных устройств

## Технический стек

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Shadcn/UI
- **API**: Fireworks AI API для транскрибирования аудио
- **Стилизация**: Next-themes для управления темами, анимированные UI-компоненты

## Установка и настройка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/tercel.git
cd tercel/frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` в корне проекта и добавьте API ключ Fireworks AI:
```
API_KEY=ваш_api_ключ_fireworks
```

4. Запустите приложение в режиме разработки:
```bash
npm run dev
```

5. Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## Работа с Fireworks AI API

Приложение использует Fireworks AI API для транскрибирования аудиофайлов. Для корректной работы необходимо:

1. Получить API ключ на сайте [Fireworks AI](https://fireworks.ai)
2. Добавить ключ в `.env.local` файл как показано выше
3. API ключ автоматически будет использован для запросов к API

### Обработка ответов API

Приложение отправляет аудиофайлы на API через POST-запрос и обрабатывает следующие сценарии:
- Успешная транскрипция с получением текстового результата
- Обработка различных ошибок API
- Корректная работа с форматами ответов (текст/JSON)

## API маршруты

### POST /api/transcribe

Принимает аудиофайл и отправляет его в Fireworks API для транскрибирования.

**Параметры запроса:**
- `file`: Аудиофайл (multipart/form-data)
- `format`: Формат вывода (по умолчанию "text")

**Параметры Fireworks API:**
- `vad_model`: "silero"
- `alignment_model`: "tdnn_ffn"
- `preprocessing`: "dynamic"
- `temperature`: "0"
- `timestamp_granularities`: "segment"
- `response_format`: format (из запроса)

**Формат ответа:**
```json
{
  "success": true,
  "text": "Транскрибированный текст",
  "format": "text"
}
```

**Обработка ошибок:**
```json
{
  "error": "Описание ошибки"
}
```

## Структура интерфейса

Пользовательский интерфейс состоит из двух основных секций:
1. **Секция загрузки** - для выбора и загрузки аудиофайла
2. **Секция результатов** - для отображения транскрибированного текста с возможностью копирования и скачивания

## Особенности реализации

1. **Обработка ошибок API**: Приложение корректно обрабатывает нестандартные ответы от API, включая нарушение формата JSON
2. **Логирование**: Подробное логирование на сервере для отладки проблем с API
3. **UI компоненты**: Использование переиспользуемых компонентов из библиотеки Shadcn/UI

## Структура проекта

```
frontend/
├── app/
│   ├── api/
│   │   └── transcribe/
│   │       └── route.ts     # API-маршрут для транскрибирования
│   ├── assets/
│   │   └── fonts/          # Шрифты приложения
│   │   ├── globals.css         # Глобальные стили
│   │   ├── layout.tsx          # Корневой макет приложения
│   │   └── page.tsx            # Главная страница
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx      # Компонент кнопки
│   │   │   ├── card.tsx        # Компонент карточки
│   │   │   ├── dropzone.tsx    # Компонент зоны загрузки файлов
│   │   │   ├── particles.tsx   # Компонент анимированных частиц
│   │   │   └── ...             # Другие UI-компоненты
│   │   ├── transcription-section.tsx # Основной компонент транскрибирования
│   │   ├── mode-toggle.tsx     # Компонент переключения темы
│   │   └── theme-provider.tsx  # Провайдер темы
│   ├── lib/
│   │   └── utils.ts            # Утилиты
│   ├── public/                 # Публичные статические файлы
│   └── next.config.ts          # Конфигурация Next.js
└── .env.local              # Локальные переменные окружения (не включается в репозиторий)
```

## Разрешение проблем

### Проблема с парсингом JSON-ответа

Если вы видите ошибку "Unexpected token 'R'" или подобные ошибки парсинга JSON, это может быть вызвано нестандартным форматом ответа от Fireworks API. В приложении реализована обработка таких случаев:

1. Ответ API получается сначала как текст
2. Выполняется проверка на соответствие формату JSON
3. Если формат соответствует JSON, выполняется парсинг
4. Если формат не соответствует, используется текстовый ответ

## Лицензия

MIT

```
frontend
├─ .next
│  ├─ app-build-manifest.json
│  ├─ build-manifest.json
│  ├─ cache
│  │  ├─ .rscinfo
│  │  ├─ swc
│  │  │  └─ plugins
│  │  │     └─ v7_macos_aarch64_8.0.0
│  │  └─ webpack
│  │     ├─ client-development
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 10.pack.gz
│  │     │  ├─ 11.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ 3.pack.gz
│  │     │  ├─ 4.pack.gz
│  │     │  ├─ 5.pack.gz
│  │     │  ├─ 6.pack.gz
│  │     │  ├─ 7.pack.gz
│  │     │  ├─ 8.pack.gz
│  │     │  ├─ 9.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     ├─ client-development-fallback
│  │     │  ├─ 0.pack.gz
│  │     │  └─ index.pack.gz
│  │     └─ server-development
│  │        ├─ 0.pack.gz
│  │        ├─ 1.pack.gz
│  │        ├─ 10.pack.gz
│  │        ├─ 11.pack.gz
│  │        ├─ 12.pack.gz
│  │        ├─ 13.pack.gz
│  │        ├─ 14.pack.gz
│  │        ├─ 15.pack.gz
│  │        ├─ 16.pack.gz
│  │        ├─ 17.pack.gz
│  │        ├─ 2.pack.gz
│  │        ├─ 3.pack.gz
│  │        ├─ 4.pack.gz
│  │        ├─ 5.pack.gz
│  │        ├─ 6.pack.gz
│  │        ├─ 7.pack.gz
│  │        ├─ 8.pack.gz
│  │        ├─ 9.pack.gz
│  │        ├─ index.pack.gz
│  │        └─ index.pack.gz.old
│  ├─ package.json
│  ├─ react-loadable-manifest.json
│  ├─ server
│  │  ├─ app-paths-manifest.json
│  │  ├─ interception-route-rewrite-manifest.js
│  │  ├─ middleware-build-manifest.js
│  │  ├─ middleware-manifest.json
│  │  ├─ middleware-react-loadable-manifest.js
│  │  ├─ next-font-manifest.js
│  │  ├─ next-font-manifest.json
│  │  ├─ pages-manifest.json
│  │  ├─ server-reference-manifest.js
│  │  └─ server-reference-manifest.json
│  ├─ static
│  │  ├─ chunks
│  │  │  └─ polyfills.js
│  │  └─ development
│  │     ├─ _buildManifest.js
│  │     └─ _ssgManifest.js
│  ├─ trace
│  └─ types
│     ├─ cache-life.d.ts
│     └─ package.json
├─ .nvmrc
├─ .specstory
│  ├─ .what-is-this.md
│  └─ history
│     ├─ 2025-03-20_10-58-подготовка-проекта-к-деплою-на-vercel.md
│     └─ 2025-03-22_07-07-изучение-ui-и-анимации-проекта.md
├─ README.md
├─ VERCEL_SETUP.md
├─ app
│  ├─ api
│  │  └─ transcribe
│  │     └─ route.ts
│  │   ├── assets
│  │   │  └─ fonts
│  │   │     ├─ CosmicGroteskNova-Bold.woff2
│  │   │     ├─ CosmicGroteskNova-Medium.woff2
│  │   │     ├─ CosmicGroteskNova-Regular.woff2
│  │   │     └─ CosmicGroteskNova-SemiBold.woff2
│  │   ├── favicon.ico
│  │   ├── fonts.ts
│  │   ├── globals.css
│  │   ├── layout.tsx
│  │   └─ page.tsx
│  ├─ components
│  │  ├─ mode-toggle.tsx
│  │  ├─ theme-provider.tsx
│  │  ├─ transcription-section.tsx
│  │  └─ ui
│  │     ├─ alert.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ dropzone.tsx
│  │     ├─ glow-effect.tsx
│  │     ├─ infinity-effect.tsx
│  │     ├─ input.tsx
│  │     ├─ particles.tsx
│  │     ├─ progress.tsx
│  │     ├─ shiny-text.tsx
│  │     └─ tabs.tsx
│  ├─ components.json
│  ├─ eslint.config.mjs
│  ├─ lib
│  │  └─ utils.ts
│  ├─ next.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ public
│  │  ├─ file.svg
│  │  ├─ globe.svg
│  │  ├─ next.svg
│  │  ├─ vercel.svg
│  │  └─ window.svg
│  ├─ tailwind.config.js
│  ├─ tsconfig.json
│  └─ vercel.json
└─ .env.local

```
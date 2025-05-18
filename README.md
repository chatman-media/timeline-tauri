# Timeline Tauri App

Приложение для создания и редактирования видео, построенное на базе Tauri, React и XState.

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/your-username/timeline-tauri/check-all.yml?branch=main)
![GitHub License](https://img.shields.io/github/license/your-username/timeline-tauri)
![CSS Linting](https://img.shields.io/badge/css%20linting-stylelint-blueviolet)

## Обзор проекта

Timeline Tauri App - это настольное приложение для создания и редактирования видео, которое сочетает в себе мощь Rust на бэкенде и современный React-интерфейс на фронтенде. Приложение использует архитектуру, основанную на конечных автоматах (XState), для управления сложной логикой состояний.

### Ключевые особенности

- 🎬 Создание и редактирование видеопроектов с различными соотношениями сторон и разрешениями
- 🖥️ Кроссплатформенность (Windows, macOS, Linux) благодаря Tauri
- 🧠 Управление состоянием с помощью XState
- 🌐 Поддержка интернационализации (i18n)
- 🧪 Полное тестовое покрытие с использованием Vitest
- 🎨 Современный UI с использованием Tailwind CSS
- 🔍 Строгий контроль качества кода с помощью ESLint, Stylelint и Clippy

## Начало работы

### Предварительные требования

- [Node.js](https://nodejs.org/) (v18 или выше)
- [Rust](https://www.rust-lang.org/tools/install) (последняя стабильная версия)
- [bun](https://bun.sh/) (последняя стабильная версия)

### Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/your-username/timeline-tauri.git
cd timeline-tauri
```

2. Установите зависимости:

```bash
bun install
```

### Запуск в режиме разработки

```bash
bun tauri dev
```

### Сборка для релиза

```bash
bun tauri build
```

## Структура проекта

```
timeline-tauri/
├── src/                  # Исходный код фронтенда (React, Next.js)
│   ├── features/         # Функциональные модули приложения
│   │   ├── browser/      # Компоненты браузера файлов
│   │   ├── media-studio/ # Компоненты студии редактирования медиа
│   │   ├── modals/       # Модальные окна и диалоги
│   │   └── project-settings/ # Настройки проекта
│   ├── i18n/             # Интернационализация
│   └── types/            # TypeScript типы
├── src-tauri/            # Исходный код бэкенда (Rust)
│   ├── src/              # Rust код
│   └── Cargo.toml        # Конфигурация Rust зависимостей
├── public/               # Статические файлы
└── package.json          # Конфигурация Node.js зависимостей
```

## Разработка

### Доступные скрипты

- `bun dev` - Запуск Next.js в режиме разработки
- `bun tauri dev` - Запуск Tauri в режиме разработки
- `bun build` - Сборка Next.js
- `bun tauri build` - Сборка Tauri приложения

#### Линтинг и форматирование

- `bun lint` - Проверка JavaScript/TypeScript кода с помощью ESLint
- `bun lint:fix` - Исправление ошибок ESLint
- `bun lint:css` - Проверка CSS кода с помощью Stylelint
- `bun lint:css:fix` - Исправление ошибок Stylelint
- `bun format:imports` - Форматирование импортов
- `bun lint:rust` - Проверка Rust кода с помощью Clippy
- `bun format:rust` - Форматирование Rust кода с помощью rustfmt
- `bun check:all` - Запуск всех проверок и тестов
- `bun fix:all` - Исправление всех ошибок линтинга

#### Тестирование

- `bun test` - Запуск тестов
- `bun test:app` - Запуск тестов только для компонентов приложения
- `bun test:coverage` - Запуск тестов с отчетом о покрытии
- `bun test:ui` - Запуск тестов с UI интерфейсом
- `bun test:e2e` - Запуск end-to-end тестов с Playwright

### Машины состояний (XState)

Проект использует XState для управления сложной логикой состояний. Основные машины состояний:

- `project-settings-machine.ts` - Управление настройками проекта
- `modal-machine.ts` - Управление модальными окнами
- `browser-visibility-machine.ts` - Управление видимостью браузера файлов

### Тестирование

Проект использует Vitest для модульного тестирования. Тесты находятся рядом с тестируемыми файлами с расширением `.test.ts` или `.test.tsx`.

```bash
# Запуск всех тестов
bun test

# Запуск тестов с отчетом о покрытии
bun test:coverage
```

## Непрерывная интеграция

Проект настроен для использования GitHub Actions для непрерывной интеграции. Рабочие процессы:

- `lint.yml` - Проверка JavaScript/TypeScript, CSS и Rust кода
- `lint-css.yml` - Проверка только CSS кода (запускается при изменении CSS файлов)
- `build.yml` - Сборка проекта
- `check-all.yml` - Запуск всех проверок и тестов

### Конфигурация линтеров

#### Stylelint (CSS)

Проект использует Stylelint для проверки CSS кода. Конфигурация находится в файле `.stylelintrc.json`. Основные особенности:

- Поддержка Tailwind CSS директив
- Игнорирование дублирующихся селекторов для совместимости с Tailwind
- Автоматическое исправление ошибок при сохранении файла (в VS Code)

Для запуска CSS линтера используйте команду:

```bash
bun lint:css
```

Для автоматического исправления ошибок:

```bash
bun lint:css:fix
```

## Лицензия

[MIT](LICENSE)

## Дополнительные ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [Tauri Documentation](https://v2.tauri.app/start/)
- [XState Documentation](https://xstate.js.org/docs/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stylelint Documentation](https://stylelint.io/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Лицензия

Данный проект распространяется под специальной коммерческой лицензией с разделением прибыли.

**Основные условия:**

- **Некоммерческое использование**: Разрешается свободно использовать, модифицировать и распространять программное обеспечение в некоммерческих целях.
- **Коммерческое использование**: Требуется заключение соглашения с автором о разделении прибыли.

Для получения полной информации о лицензии, пожалуйста, ознакомьтесь с файлом [LICENSE](./LICENSE).

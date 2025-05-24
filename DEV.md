# Разработка Timeline Studio

## Архитектура приложения

### 🏗️ Основные компоненты

**Главные компоненты:**

- **`MediaStudio`** - корневой компонент с выбором layout'а
- **`TopBar`** - верхняя панель с меню и управлением
- **`Browser`** - браузер медиафайлов с табами (медиа, музыка, эффекты, фильтры, шаблоны, субтитры)
- **`Timeline`** - таймлайн для редактирования с ресурсами и AI чатом
- **`VideoPlayer`** - видеоплеер с элементами управления
- **`ModalContainer`** - контейнер для модальных окон

**Layout системы:**

- **DefaultLayout** - стандартный макет (браузер + плеер + таймлайн)
- **VerticalLayout** - вертикальный макет
- **DualLayout** - двойной макет
- **OptionsLayout** - макет с опциями

### 🎯 Машины состояний (XState v5)

1. **`appSettingsMachine`** - централизованное управление настройками

   - Состояния: `loading` → `idle` / `error`
   - Управляет: пользовательские настройки, проекты, медиафайлы, избранное

2. **`chatMachine`** - управление AI чатом

   - Состояния: `idle` → `processing` → `idle`
   - События: отправка/получение сообщений, выбор агента

3. **`modalMachine`** - управление модальными окнами

   - Состояния: `closed` ⇄ `opened`

4. **`playerMachine`** - управление видеоплеером

   - Состояния: `idle` → `loading` → `ready`

5. **`resourcesMachine`** - управление ресурсами таймлайна

   - Управляет: эффекты, фильтры, переходы, шаблоны, музыка, субтитры

6. **`musicMachine`** - управление музыкальными файлами
   - Фильтрация и поиск музыкальных файлов

7. **`userSettingsMachine`** - управление пользовательскими настройками
   - Настройки интерфейса, API ключи, видимость браузера

8. **`projectSettingsMachine`** - управление настройками проекта
   - Разрешение, частота кадров, настройки экспорта

9. **`mediaMachine`** - управление медиафайлами
   - Загрузка файлов, избранное, состояние загрузки

> **Примечание**: Машина состояний для таймлайна (`timelineMachine`) пока не реализована и будет добавлена в будущих версиях.

### 🔄 Провайдеры состояния

**Иерархия провайдеров:**

```typescript
AppProvider = composeProviders(
  I18nProvider, // Интернационализация
  ModalProvider, // Модальные окна
  AppSettingsProvider, // Централизованные настройки
  ProjectSettingsProvider, // Настройки проекта
  UserSettingsProvider, // Пользовательские настройки
  ResourcesProvider, // Ресурсы таймлайна
  MusicProvider, // Музыкальные файлы
  MediaProvider, // Медиафайлы
  PreviewSizeProvider, // Размеры превью
  TemplateListProvider, // Шаблоны
  PlayerProvider, // Видеоплеер
  ChatProvider, // AI чат
);
```

**Основные контексты:**

- **`AppSettingsContext`** - централизованное состояние приложения
- **`ChatContext`** - состояние AI чата
- **`ResourcesContext`** - ресурсы таймлайна
- **`UserSettingsContext`** - пользовательские настройки

### ✨ Технологический стек

- **Frontend**: React 19, Next.js 15, TypeScript
- **State Management**: XState v5, React Context
- **UI**: Tailwind CSS v4, Radix UI, Shadcn/ui
- **Desktop**: Tauri v2 (Rust)
- **Testing**: Vitest, Testing Library, Playwright
- **Build**: Vite, PostCSS, LightningCSS

### 🔧 Архитектурные принципы

- **XState v5** для управления сложной логикой состояний
- **Композиция провайдеров** для уменьшения вложенности
- **Централизованное состояние** через `AppSettingsProvider`
- **Типизация TypeScript** для всех контекстов и событий
- **Модульная структура** по features
- **Resizable панели** для гибкого UI

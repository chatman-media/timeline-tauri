# Машины состояний (XState) в Timeline Editor

## Введение в XState

Timeline Editor использует библиотеку XState для управления сложной логикой приложения. XState предоставляет формальный способ моделирования и управления состояниями на основе конечных автоматов (finite state machines).

Основные преимущества использования XState:

- Предсказуемое поведение приложения
- Явное моделирование состояний и переходов
- Упрощение обработки сложных пользовательских сценариев
- Улучшение тестируемости кода

## Основные машины состояний

В Timeline Studio используются следующие основные машины состояний:

1. **appSettingsMachine** - централизованное управление настройками приложения
2. **chatMachine** - управление AI чатом
3. **modalMachine** - управление модальными окнами
4. **playerMachine** - управление видеоплеером
5. **resourcesMachine** - управление ресурсами таймлайна
6. **musicMachine** - управление музыкальными файлами
7. **userSettingsMachine** - управление пользовательскими настройками
8. **projectSettingsMachine** - управление настройками проекта
9. **mediaMachine** - управление медиафайлами

## appSettingsMachine

**Назначение**: Централизованное управление настройками приложения, проектами, медиафайлами и избранным.

**Контекст**:

```typescript
interface AppSettingsContext {
  userSettings: {
    previewSizes: Record<"MEDIA" | "TRANSITIONS" | "TEMPLATES", number>;
    activeTab: BrowserTab;
    layoutMode: LayoutMode;
    screenshotsPath: string;
    playerScreenshotsPath: string;
    playerVolume: number;
    openAiApiKey: string;
    claudeApiKey: string;
    isBrowserVisible: boolean;
    isLoaded: boolean;
  };
  recentProjects: RecentProject[];
  currentProject: {
    path: string | null;
    name: string;
    isDirty: boolean;
    isNew: boolean;
  };
  mediaFiles: {
    allMediaFiles: MediaFile[];
    error: string | null;
    isLoading: boolean;
  };
  favorites: FavoritesType;
  isLoading: boolean;
  error: string | null;
}
```

**Состояния**:

- `loading` - загрузка настроек из хранилища
- `idle` - настройки загружены, приложение готово к работе
- `error` - ошибка загрузки настроек

**Основные события**:

- `UPDATE_USER_SETTINGS` - обновление пользовательских настроек
- `ADD_RECENT_PROJECT` - добавление проекта в список недавних
- `UPDATE_FAVORITES` - обновление избранного
- `CREATE_NEW_PROJECT` - создание нового проекта
- `OPEN_PROJECT` - открытие существующего проекта
- `SAVE_PROJECT` - сохранение проекта
- `SET_PROJECT_DIRTY` - отметка проекта как измененного
- `UPDATE_MEDIA_FILES` - обновление списка медиафайлов
- `RELOAD_SETTINGS` - перезагрузка настроек

**Методы провайдера**:

- `updateUserSettings()` - обновление пользовательских настроек
- `addRecentProject()` - добавление в недавние проекты
- `addToFavorites()` - добавление в избранное
- `removeFromFavorites()` - удаление из избранного
- `createNewProject()` - создание нового проекта
- `openProject()` - открытие проекта
- `saveProject()` - сохранение проекта

## chatMachine

**Назначение**: Управление AI чатом для взаимодействия с различными моделями ИИ.

**Контекст**:

```typescript
interface ChatMachineContext {
  chatMessages: ChatMessage[];
  selectedAgentId: string | null;
  isProcessing: boolean;
  error: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
}
```

**Состояния**:

- `idle` - ожидание действий пользователя
- `processing` - обработка сообщения ИИ

**Основные события**:

- `SEND_CHAT_MESSAGE` - отправка сообщения пользователем
- `RECEIVE_CHAT_MESSAGE` - получение ответа от ИИ
- `SELECT_AGENT` - выбор модели ИИ (агента)
- `SET_PROCESSING` - установка состояния обработки
- `SET_ERROR` - установка ошибки
- `CLEAR_MESSAGES` - очистка истории сообщений
- `REMOVE_MESSAGE` - удаление конкретного сообщения

**Методы провайдера**:

- `sendChatMessage(message: string)` - отправка сообщения
- `receiveChatMessage(message: ChatMessage)` - получение ответа
- `selectAgent(agentId: string)` - выбор агента
- `setProcessing(isProcessing: boolean)` - установка состояния обработки
- `setError(error: string | null)` - установка ошибки
- `clearMessages()` - очистка сообщений
- `removeMessage(messageId: string)` - удаление сообщения

## playerMachine

**Назначение**: Управление видеоплеером, воспроизведением и записью.

**Контекст**:

```typescript
interface PlayerContext {
  video: MediaFile | null;
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  isSeeking: boolean;
  isChangingCamera: boolean;
  isRecording: boolean;
  videoRefs: Record<string, HTMLVideoElement>;
  videos: Record<string, TimelineVideo>;
  error: string | null;
}

interface TimelineVideo {
  id: string;
  src: string;
  startTime: number;
  endTime: number;
  volume: number;
}
```

**Состояния**:

- `idle` - начальное состояние
- `loading` - загрузка видео
- `ready` - видео готово к воспроизведению
- `playing` - воспроизведение
- `paused` - пауза
- `seeking` - перемотка
- `changingCamera` - смена камеры
- `recording` - запись
- `error` - ошибка воспроизведения

**Основные события**:

- `LOAD_VIDEO` - загрузка видео
- `PLAY` - воспроизведение
- `PAUSE` - пауза
- `SEEK` - перемотка к определенному времени
- `SET_VOLUME` - установка громкости
- `CHANGE_CAMERA` - смена камеры
- `START_RECORDING` - начало записи
- `STOP_RECORDING` - остановка записи
- `ADD_VIDEO_REF` - добавление ссылки на видео элемент
- `UPDATE_TIME` - обновление текущего времени

**Методы провайдера**:

- `loadVideo(video: MediaFile)` - загрузка видео
- `play()` - воспроизведение
- `pause()` - пауза
- `seek(time: number)` - перемотка
- `setVolume(volume: number)` - установка громкости
- `changeCamera()` - смена камеры
- `startRecording()` - начало записи
- `stopRecording()` - остановка записи
- `addVideoRef(id: string, ref: HTMLVideoElement)` - добавление ссылки на видео

## resourcesMachine

**Назначение**: Управление ресурсами таймлайна (эффекты, фильтры, переходы, шаблоны, музыка, субтитры).

**Контекст**:

```typescript
interface ResourcesContext {
  effects: Effect[];
  filters: Filter[];
  transitions: Transition[];
  templates: Template[];
  music: MusicFile[];
  subtitles: SubtitleFile[];
  selectedResource: Resource | null;
  isLoading: boolean;
  error: string | null;
}

interface Resource {
  id: string;
  name: string;
  type: "effect" | "filter" | "transition" | "template" | "music" | "subtitle";
  thumbnail?: string;
  duration?: number;
  path: string;
}
```

**Состояния**:

- `idle` - начальное состояние
- `loading` - загрузка ресурсов
- `loaded` - ресурсы загружены
- `error` - ошибка загрузки

**Основные события**:

- `LOAD_RESOURCES` - загрузка всех ресурсов
- `ADD_RESOURCE` - добавление ресурса
- `REMOVE_RESOURCE` - удаление ресурса
- `SELECT_RESOURCE` - выбор ресурса
- `APPLY_TO_TIMELINE` - применение ресурса к таймлайну
- `UPDATE_RESOURCE` - обновление ресурса
- `FILTER_RESOURCES` - фильтрация ресурсов

**Методы провайдера**:

- `loadResources()` - загрузка ресурсов
- `addResource(resource: Resource)` - добавление ресурса
- `removeResource(id: string)` - удаление ресурса
- `selectResource(resource: Resource)` - выбор ресурса
- `applyToTimeline(resource: Resource)` - применение к таймлайну
- `getResourcesByType(type: string)` - получение ресурсов по типу
- `filterResources(query: string)` - фильтрация ресурсов

## modalMachine

**Назначение**: Управление модальными окнами приложения.

**Контекст**:

```typescript
interface ModalContext {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  size: "sm" | "md" | "lg" | "xl" | "full";
  onClose?: () => void;
  data?: any;
}
```

**Состояния**:

- `closed` - модальное окно закрыто
- `opened` - модальное окно открыто

**Основные события**:

- `OPEN` - открытие модального окна
- `CLOSE` - закрытие модального окна
- `SET_CONTENT` - установка содержимого
- `SET_DATA` - установка данных для модального окна

**Методы провайдера**:

- `openModal(content: ReactNode, options?)` - открытие модального окна
- `closeModal()` - закрытие модального окна
- `setModalData(data: any)` - установка данных

## musicMachine

**Назначение**: Управление музыкальными файлами и их фильтрацией.

**Контекст**:

```typescript
interface MusicContext {
  musicFiles: MusicFile[];
  filteredMusicFiles: MusicFile[];
  selectedMusicFile: MusicFile | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

interface MusicFile {
  id: string;
  name: string;
  path: string;
  duration: number;
  artist?: string;
  album?: string;
  genre?: string;
  thumbnail?: string;
}
```

**Состояния**:

- `loading` - загрузка музыкальных файлов
- `success` - файлы успешно загружены
- `error` - ошибка загрузки

**Основные события**:

- `LOAD_MUSIC` - загрузка музыкальных файлов
- `FILTER_MUSIC` - фильтрация по поисковому запросу
- `SELECT_MUSIC` - выбор музыкального файла
- `ADD_TO_TIMELINE` - добавление на таймлайн
- `CLEAR_SELECTION` - очистка выбора

**Методы провайдера**:

- `loadMusicFiles()` - загрузка музыкальных файлов
- `filterMusic(query: string)` - фильтрация музыки
- `selectMusicFile(file: MusicFile)` - выбор файла
- `addToTimeline(file: MusicFile)` - добавление на таймлайн
- `clearSelection()` - очистка выбора

## userSettingsMachine

**Назначение**: Управление пользовательскими настройками интерфейса и поведения приложения.

**Контекст**:

```typescript
interface UserSettingsContext {
  previewSizes: Record<"MEDIA" | "TRANSITIONS" | "TEMPLATES", number>;
  activeTab: BrowserTab;
  layoutMode: LayoutMode;
  screenshotsPath: string;
  playerScreenshotsPath: string;
  playerVolume: number;
  openAiApiKey: string;
  claudeApiKey: string;
  isBrowserVisible: boolean;
  isLoaded: boolean;
}
```

**Состояния**:

- `idle` - ожидание действий пользователя

**Основные события**:

- `UPDATE_ALL_SETTINGS` - обновление всех настроек
- `UPDATE_ACTIVE_TAB` - изменение активной вкладки
- `UPDATE_LAYOUT_MODE` - изменение режима layout'а
- `UPDATE_SCREENSHOTS_PATH` - изменение пути для скриншотов
- `UPDATE_PLAYER_SCREENSHOTS_PATH` - изменение пути для скриншотов плеера
- `UPDATE_OPENAI_API_KEY` - обновление API ключа OpenAI
- `UPDATE_CLAUDE_API_KEY` - обновление API ключа Claude
- `TOGGLE_BROWSER_VISIBILITY` - переключение видимости браузера
- `UPDATE_PLAYER_VOLUME` - изменение громкости плеера

**Методы провайдера**:

- `handleTabChange(tab: string)` - изменение активной вкладки
- `handleLayoutModeChange(mode: LayoutMode)` - изменение layout'а
- `handleScreenshotsPathChange(path: string)` - изменение пути скриншотов
- `handleOpenAiApiKeyChange(key: string)` - изменение API ключа OpenAI
- `handleClaudeApiKeyChange(key: string)` - изменение API ключа Claude
- `toggleBrowserVisibility()` - переключение видимости браузера
- `handlePlayerVolumeChange(volume: number)` - изменение громкости

## projectSettingsMachine

**Назначение**: Управление настройками конкретного проекта (разрешение, частота кадров, экспорт).

**Контекст**:

```typescript
interface ProjectSettingsContext {
  settings: ProjectSettings;
}

interface ProjectSettings {
  resolution: Resolution;
  frameRate: number;
  exportSettings: ExportSettings;
  // другие настройки проекта
}
```

**Состояния**:

- `idle` - ожидание действий пользователя

**Основные события**:

- `UPDATE_SETTINGS` - обновление настроек проекта
- `RESET_SETTINGS` - сброс настроек к значениям по умолчанию

**Методы провайдера**:

- `updateSettings(settings: ProjectSettings)` - обновление настроек
- `resetSettings()` - сброс настроек к значениям по умолчанию

## mediaMachine

**Назначение**: Управление медиафайлами, их загрузкой и избранным.

**Контекст**:

```typescript
interface MediaContext {
  allMediaFiles: MediaFile[];
  error: string | null;
  isLoading: boolean;
  favorites: FavoritesType;
}

interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: "video" | "audio" | "image";
  duration?: number;
  thumbnail?: string;
}
```

**Состояния**:

- `idle` - начальное состояние
- `loading` - загрузка медиафайлов
- `loaded` - медиафайлы загружены

**Основные события**:

- `FETCH_MEDIA` - загрузка медиафайлов
- `ADD_TO_FAVORITES` - добавление в избранное
- `REMOVE_FROM_FAVORITES` - удаление из избранного
- `UPDATE_MEDIA_FILES` - обновление списка файлов

**Методы провайдера**:

- `fetchMediaFiles()` - загрузка медиафайлов
- `addToFavorites(file: MediaFile)` - добавление в избранное
- `removeFromFavorites(fileId: string)` - удаление из избранного
- `updateMediaFiles(files: MediaFile[])` - обновление списка файлов

## Взаимодействие машин состояний

Машины состояний взаимодействуют между собой через события и централизованное состояние:

```
                    +---------------------+
                    |                     |
                    | appSettingsMachine  |
                    |   (центральное      |
                    |    состояние)       |
                    +---------------------+
                             |
                             |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
+----------------+  +----------------+  +----------------+
|                |  |                |  |                |
|  chatMachine   |  | playerMachine  |  |resourcesMachine|
|                |  |                |  |                |
+----------------+  +----------------+  +----------------+
        |                    |                    |
        |                    |                    |
        v                    v                    v
+----------------+  +----------------+  +----------------+
|                |  |                |  |                |
| modalMachine   |  |  musicMachine  |  |   (будущие     |
|                |  |                |  |   машины)      |
+----------------+  +----------------+  +----------------+
```

### Примеры взаимодействия:

1. **Централизованное управление настройками**:

   - `appSettingsMachine` управляет всеми настройками приложения
   - Другие машины получают доступ к настройкам через контекст

2. **AI чат и модальные окна**:

   - `chatMachine` может открывать модальные окна через `modalMachine`
   - Для отображения настроек агентов или ошибок

3. **Плеер и ресурсы**:

   - `playerMachine` воспроизводит видео с примененными ресурсами
   - `resourcesMachine` предоставляет эффекты и фильтры для применения

4. **Музыка и плеер**:
   - `musicMachine` предоставляет музыкальные файлы
   - `playerMachine` может воспроизводить выбранную музыку

## Реализация машин состояний

Машины состояний реализованы с использованием XState v5 и хранятся в соответствующих feature директориях:

```
/src/features/
  ├── app-state/
  │   └── app-settings-machine.ts
  ├── chat/services/
  │   └── chat-machine.ts
  ├── modals/
  │   ├── services/modal-machine.ts
  │   └── features/
  │       ├── user-settings/user-settings-machine.ts
  │       └── project-settings/project-settings-machine.ts
  ├── video-player/components/
  │   └── player-machine.ts
  ├── browser/
  │   ├── resources/resources-machine.ts
  │   ├── components/tabs/music/music-machine.ts
  │   └── media/media-machine.ts
```

Для доступа к машинам состояний используются провайдеры контекста:

```
/src/features/
  ├── app-state/app-settings-provider.tsx
  ├── chat/services/chat-provider.tsx
  ├── modals/
  │   ├── services/modal-provider.tsx
  │   └── features/
  │       ├── user-settings/user-settings-provider.tsx
  │       └── project-settings/project-settings-provider.tsx
  ├── video-player/providers/player-provider.tsx
  ├── browser/
  │   ├── resources/resources-provider.tsx
  │   ├── components/tabs/music/music-provider.tsx
  │   └── media/media-provider.tsx
  └── media-studio/providers.tsx (композиция всех провайдеров)
```

Хуки для использования контекстов встроены в провайдеры:

```typescript
// Примеры использования хуков
import { useAppSettings } from "@/features/app-state/app-settings-provider";
import { useChat } from "@/features/chat/services/chat-provider";
import { useModal } from "@/features/modals/services/modal-provider";
import { useUserSettings } from "@/features/modals/features/user-settings/user-settings-provider";
import { useProjectSettings } from "@/features/modals/features/project-settings/project-settings-provider";
import { usePlayer } from "@/features/video-player/providers/player-provider";
import { useResources } from "@/features/browser/resources/resources-provider";
import { useMusic } from "@/features/browser/components/tabs/music/music-provider";
import { useMedia } from "@/features/browser/media/media-provider";
```

### Композиция провайдеров

Все провайдеры объединены в `AppProvider` с помощью функции `composeProviders`:

```typescript
export const AppProvider = composeProviders(
  I18nProvider, // Интернационализация
  ModalProvider, // Модальные окна
  AppSettingsProvider, // Централизованные настройки приложения
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

### Особенности архитектуры

1. **Централизованное состояние**: `appSettingsMachine` служит центральным хранилищем для настроек приложения
2. **Feature-based организация**: Каждая машина состояний находится в соответствующей feature директории
3. **Композиция провайдеров**: Все провайдеры объединены в один `AppProvider` для упрощения использования
4. **TypeScript типизация**: Все машины состояний полностью типизированы
5. **Тестируемость**: Каждая машина состояний имеет соответствующие тесты

## Связанные документы

- [Разработка Timeline Studio](../DEV.md) - общая архитектура приложения
- [Документация по XState v5](https://stately.ai/docs/xstate) - официальная документация
- [Руководство по тестированию](../docs/testing.md) - тестирование машин состояний

import { createContext, useContext } from "react";

import { useMachine } from "@xstate/react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  BrowserTab,
  LayoutMode,
  userSettingsMachine,
} from "./user-settings-machine";

/**
 * Интерфейс значения контекста пользовательских настроек
 * Определяет данные и методы, доступные через хук useUserSettings
 *
 * @interface UserSettingsContextValue
 */
interface UserSettingsContextValue {
  // Данные настроек
  activeTab: BrowserTab; // Активная вкладка в браузере
  layoutMode: LayoutMode; // Текущий макет интерфейса
  playerScreenshotsPath: string; // Путь для сохранения скриншотов плеера
  screenshotsPath: string; // Путь для сохранения скриншотов
  playerVolume: number; // Громкость плеера (0-100)
  openAiApiKey: string; // API ключ OpenAI
  claudeApiKey: string; // API ключ Claude
  isBrowserVisible: boolean; // Флаг видимости браузера

  // Методы для изменения настроек
  handleTabChange: (value: string) => void; // Изменение активной вкладки
  handleLayoutChange: (value: LayoutMode) => void; // Изменение макета интерфейса
  handleScreenshotsPathChange: (value: string) => void; // Изменение пути для скриншотов
  handlePlayerScreenshotsPathChange: (value: string) => void; // Изменение пути для скриншотов плеера
  handlePlayerVolumeChange: (value: number) => void; // Изменение громкости плеера
  handleAiApiKeyChange: (value: string) => void; // Изменение API ключа OpenAI
  handleClaudeApiKeyChange: (value: string) => void; // Изменение API ключа Claude
  toggleBrowserVisibility: () => void; // Переключение видимости браузера
}

/**
 * Контекст для хранения и предоставления доступа к пользовательским настройкам
 * Изначально не имеет значения (undefined)
 */

export const UserSettingsContext = createContext<
  UserSettingsContextValue | undefined
>(undefined);

/**
 * Провайдер пользовательских настроек
 * Компонент, который предоставляет доступ к пользовательским настройкам через контекст
 * Использует XState машину состояний для управления настройками
 *
 * @param {Object} props - Пропсы компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} Провайдер контекста с пользовательскими настройками
 */
export function UserSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("UserSettingsProvider rendering");

  // Инициализируем машину состояний для управления пользовательскими настройками
  const [state, send] = useMachine(userSettingsMachine);

  // Отладочные логи
  console.log("UserSettingsProvider state:", state.context);
  console.log("UserSettingsProvider state status:", state.status);

  // Добавляем обработчик горячих клавиш Cmd+B/Ctrl+B для переключения видимости браузера
  useHotkeys(
    "mod+b",
    (event) => {
      event.preventDefault();
      send({
        type: "TOGGLE_BROWSER_VISIBILITY",
      });
    },
    {
      enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
      preventDefault: true,
    },
  );

  // Примечание: Сохранение настроек в IndexedDB удалено, так как теперь используется Tauri Store
  // для централизованного хранения данных через app-settings-provider

  // Создаем значение контекста, которое будет доступно через хук useUserSettings
  const value = {
    // Данные настроек из контекста машины состояний
    activeTab: state.context.activeTab,
    layoutMode: state.context.layoutMode,
    screenshotsPath: state.context.screenshotsPath,
    playerScreenshotsPath: state.context.playerScreenshotsPath,
    playerVolume: state.context.playerVolume,
    openAiApiKey: state.context.openAiApiKey,
    claudeApiKey: state.context.claudeApiKey,
    isBrowserVisible: state.context.isBrowserVisible,

    /**
     * Обработчик изменения активной вкладки
     * @param {string} value - Новое значение активной вкладки
     */
    handleTabChange: (value: string) => {
      console.log("Tab change requested:", value);
      // Проверяем, что значение является допустимым BrowserTab
      if (
        [
          "media",
          "music",
          "transitions",
          "effects",
          "filters",
          "templates",
        ].includes(value)
      ) {
        // Отправляем событие в машину состояний
        send({
          type: "UPDATE_ACTIVE_TAB",
          tab: value as BrowserTab,
        });
        console.log("Active tab updated:", value);
      } else {
        console.error("Invalid tab value:", value);
      }
    },

    /**
     * Обработчик изменения макета интерфейса
     * @param {LayoutMode} value - Новый макет интерфейса
     */
    handleLayoutChange: (value: LayoutMode) => {
      console.log("Layout change requested:", value);
      console.log(
        "Current layoutMode before update:",
        state.context.layoutMode,
      );

      // Проверяем, что значение является допустимым LayoutMode
      if (["default", "options", "vertical", "dual"].includes(value)) {
        console.log("Updating layoutMode:", value);
        // Отправляем событие в машину состояний
        send({
          type: "UPDATE_LAYOUT",
          layoutMode: value,
        });
      } else {
        console.error("Invalid layout value:", value);
      }
    },

    /**
     * Обработчик изменения пути для скриншотов плеера
     * @param {string} value - Новый путь для скриншотов плеера
     */
    handlePlayerScreenshotsPathChange: (value: string) => {
      console.log("Player screenshots path change requested:", value);
      // Отправляем событие в машину состояний
      send({
        type: "UPDATE_PLAYER_SCREENSHOTS_PATH",
        path: value,
      });
      console.log("Player screenshots path updated:", value);
    },

    /**
     * Обработчик изменения пути для скриншотов
     * @param {string} value - Новый путь для скриншотов
     */
    handleScreenshotsPathChange: (value: string) => {
      console.log("Screenshots path change requested:", value);
      // Отправляем событие в машину состояний
      send({
        type: "UPDATE_SCREENSHOTS_PATH",
        path: value,
      });
      console.log("Screenshots path updated:", value);
    },

    /**
     * Обработчик изменения API ключа OpenAI
     * @param {string} value - Новый API ключ OpenAI
     */
    handleAiApiKeyChange: (value: string) => {
      // Скрываем API ключ в логах для безопасности
      console.log("AI API key change requested:", value ? "***" : "(empty)");
      // Отправляем событие в машину состояний
      send({
        type: "UPDATE_OPENAI_API_KEY",
        apiKey: value,
      });
      console.log("AI API key updated");
    },

    /**
     * Обработчик изменения API ключа Claude
     * @param {string} value - Новый API ключ Claude
     */
    handleClaudeApiKeyChange: (value: string) => {
      // Скрываем API ключ в логах для безопасности
      console.log(
        "Claude API key change requested:",
        value ? "***" : "(empty)",
      );
      // Отправляем событие в машину состояний
      send({
        type: "UPDATE_CLAUDE_API_KEY",
        apiKey: value,
      });
      console.log("Claude API key updated");
    },

    /**
     * Обработчик изменения громкости плеера
     * @param {number} value - Новое значение громкости (0-100)
     */
    handlePlayerVolumeChange: (value: number) => {
      console.log("Player volume change requested:", value);
      // Отправляем событие в машину состояний
      send({
        type: "UPDATE_PLAYER_VOLUME",
        volume: value,
      });
      console.log("Player volume updated");
    },

    /**
     * Обработчик переключения видимости браузера
     * Инвертирует текущее значение флага видимости
     */
    toggleBrowserVisibility: () => {
      console.log("Browser visibility toggle requested");
      // Отправляем событие в машину состояний
      send({
        type: "TOGGLE_BROWSER_VISIBILITY",
      });
      console.log("Browser visibility toggled");
    },
  };

  // Возвращаем провайдер контекста с созданным значением
  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

/**
 * Хук для доступа к пользовательским настройкам
 * Предоставляет доступ к текущим настройкам и методам для их изменения
 *
 * @returns {UserSettingsContextValue} Объект с настройками и методами для их изменения
 * @throws {Error} Если хук используется вне компонента UserSettingsProvider
 */
export function useUserSettings() {
  // Получаем значение контекста
  const context = useContext(UserSettingsContext);

  // Проверяем, что хук используется внутри провайдера
  if (!context) {
    throw new Error(
      "useUserSettings must be used within a UserSettingsProvider",
    );
  }

  // Возвращаем значение контекста
  return context;
}

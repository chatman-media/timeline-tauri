import { ReactNode, createContext, useContext, useEffect } from "react";

import { appDataDir, basename, join } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useMachine } from "@xstate/react";

import { FavoritesType } from "@/features/browser/media/media-machine";
import { UserSettingsContext } from "@/features/modals/features/user-settings/user-settings-machine";

import {
  AppSettingsContext as AppSettingsContextType,
  appSettingsMachine,
} from "./app-settings-machine";

/**
 * Интерфейс контекста провайдера настроек приложения
 */
interface AppSettingsProviderContext {
  // Состояние машины
  state: {
    context: AppSettingsContextType;
    matches: (value: string) => boolean;
    can: (event: { type: string }) => boolean;
  };

  // Методы для работы с настройками
  updateUserSettings: (settings: Partial<UserSettingsContext>) => void;
  addRecentProject: (path: string, name: string) => void;
  removeRecentProject: (path: string) => void;
  clearRecentProjects: () => void;
  updateFavorites: (favorites: Partial<FavoritesType>) => void;
  addToFavorites: (itemType: keyof FavoritesType, item: any) => void;
  removeFromFavorites: (itemType: keyof FavoritesType, itemId: string) => void;
  reloadSettings: () => void;

  // Методы для работы с проектами
  createNewProject: (name?: string) => void;
  openProject: () => Promise<{ path: string; name: string } | null>;
  saveProject: (name: string) => Promise<{ path: string; name: string } | null>;
  setProjectDirty: (isDirty: boolean) => void;
  updateMediaFiles: (files: any[]) => void;

  // Геттеры для удобного доступа к данным
  getUserSettings: () => UserSettingsContext;
  getRecentProjects: () => AppSettingsContextType["recentProjects"];
  getFavorites: () => FavoritesType;
  getCurrentProject: () => AppSettingsContextType["currentProject"];
  getMediaFiles: () => AppSettingsContextType["mediaFiles"];
  isLoading: () => boolean;
  getError: () => string | null;
}

// Создаем контекст
const AppSettingsContext = createContext<
  AppSettingsProviderContext | undefined
>(undefined);

/**
 * Провайдер настроек приложения
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  // Используем машину состояний
  const [state, send] = useMachine(appSettingsMachine);

  // Проверяем, есть ли открытый проект, и если нет, создаем новый
  useEffect(() => {
    if (
      !state.context.isLoading &&
      !state.context.currentProject.path &&
      !state.context.currentProject.isNew
    ) {
      // Если нет открытого проекта и не создан новый, создаем новый проект
      send({ type: "CREATE_NEW_PROJECT" });
    }
  }, [
    state.context.isLoading,
    state.context.currentProject.path,
    state.context.currentProject.isNew,
    send,
  ]);

  // Методы для работы с настройками
  const updateUserSettings = (settings: Partial<UserSettingsContext>) => {
    send({ type: "UPDATE_USER_SETTINGS", settings });
  };

  const addRecentProject = (path: string, name: string) => {
    send({ type: "ADD_RECENT_PROJECT", path, name });
  };

  const removeRecentProject = (path: string) => {
    send({ type: "REMOVE_RECENT_PROJECT", path });
  };

  const clearRecentProjects = () => {
    send({ type: "CLEAR_RECENT_PROJECTS" });
  };

  const updateFavorites = (favorites: Partial<FavoritesType>) => {
    send({ type: "UPDATE_FAVORITES", favorites });
  };

  const addToFavorites = (itemType: keyof FavoritesType, item: any) => {
    send({ type: "ADD_TO_FAVORITES", itemType, item });
  };

  const removeFromFavorites = (
    itemType: keyof FavoritesType,
    itemId: string,
  ) => {
    send({ type: "REMOVE_FROM_FAVORITES", itemType, itemId });
  };

  const reloadSettings = () => {
    send({ type: "RELOAD_SETTINGS" });
  };

  // Методы для работы с проектами
  const createNewProject = (name?: string) => {
    send({ type: "CREATE_NEW_PROJECT", name });
  };

  const openProject = async () => {
    try {
      // Получаем директорию данных приложения
      const appDir = await appDataDir().catch(() => null);

      // Открываем диалог выбора файла
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Timeline Studio Project",
            extensions: ["tlsp"],
          },
        ],
        // Если директория приложения доступна, используем её как начальную директорию
        defaultPath: appDir ?? undefined,
      });

      // Если пользователь отменил выбор, возвращаемся
      if (selected === null) {
        return null;
      }

      // Получаем путь к файлу
      const path = selected;

      // Получаем имя файла из пути
      const name = await basename(path);

      // Отправляем событие в машину состояний
      send({ type: "OPEN_PROJECT", path, name });

      return { path, name };
    } catch (error) {
      console.error("[openProject] Error opening project:", error);
      throw error;
    }
  };

  const saveProject = async (name: string) => {
    try {
      const currentProject = getCurrentProject();

      // Если у проекта уже есть путь, сохраняем по этому пути
      if (currentProject.path) {
        send({ type: "SAVE_PROJECT", path: currentProject.path, name });
        return { path: currentProject.path, name };
      }

      // Получаем директорию данных приложения
      const appDir = await appDataDir().catch(() => null);

      // Формируем путь к файлу по умолчанию
      const defaultFilePath = appDir
        ? await join(appDir, `${name}.tlsp`)
        : `${name}.tlsp`;

      // Иначе открываем диалог сохранения файла
      const path = await save({
        filters: [
          {
            name: "Timeline Studio Project",
            extensions: ["tlsp"],
          },
        ],
        defaultPath: defaultFilePath,
      });

      // Если пользователь отменил выбор, возвращаемся
      if (path === null) {
        return null;
      }

      // Отправляем событие в машину состояний
      send({ type: "SAVE_PROJECT", path, name });

      return { path, name };
    } catch (error) {
      console.error("[saveProject] Error saving project:", error);
      throw error;
    }
  };

  const setProjectDirty = (isDirty: boolean) => {
    send({ type: "SET_PROJECT_DIRTY", isDirty });
  };

  const updateMediaFiles = (files: any[]) => {
    send({ type: "UPDATE_MEDIA_FILES", files });
  };

  // Геттеры для удобного доступа к данным
  const getUserSettings = () => state.context.userSettings;
  const getRecentProjects = () => state.context.recentProjects;
  const getFavorites = () => state.context.favorites;
  const getCurrentProject = () => state.context.currentProject;
  const getMediaFiles = () => state.context.mediaFiles;
  const isLoading = () => state.context.isLoading;
  const getError = () => state.context.error;

  // Значение контекста
  const value: AppSettingsProviderContext = {
    state: {
      context: state.context,
      matches: (value: string) => state.matches(value),
      can: (event: { type: string }) => state.can(event as any),
    },
    updateUserSettings,
    addRecentProject,
    removeRecentProject,
    clearRecentProjects,
    updateFavorites,
    addToFavorites,
    removeFromFavorites,
    reloadSettings,
    createNewProject,
    openProject,
    saveProject,
    setProjectDirty,
    updateMediaFiles,
    getUserSettings,
    getRecentProjects,
    getFavorites,
    getCurrentProject,
    getMediaFiles,
    isLoading,
    getError,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

/**
 * Хук для доступа к контексту настроек приложения
 */

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error(
      "useAppSettings must be used within an AppSettingsProvider",
    );
  }

  return context;
}

/**
 * Хук для доступа к списку последних открытых проектов
 */

export function useRecentProjects() {
  const {
    getRecentProjects,
    addRecentProject,
    removeRecentProject,
    clearRecentProjects,
  } = useAppSettings();

  return {
    recentProjects: getRecentProjects(),
    addRecentProject,
    removeRecentProject,
    clearRecentProjects,
  };
}

/**
 * Хук для доступа к избранным элементам
 */
export function useFavorites() {
  const { getFavorites, updateFavorites, addToFavorites, removeFromFavorites } =
    useAppSettings();

  return {
    favorites: getFavorites(),
    updateFavorites,
    addToFavorites,
    removeFromFavorites,
  };
}

/**
 * Хук для доступа к текущему проекту
 */

export function useCurrentProject() {
  const {
    getCurrentProject,
    createNewProject,
    openProject,
    saveProject,
    setProjectDirty,
  } = useAppSettings();

  return {
    currentProject: getCurrentProject(),
    createNewProject,
    openProject,
    saveProject,
    setProjectDirty,
  };
}

/**
 * Хук для доступа к медиа-файлам
 */
export function useMediaFiles() {
  const { getMediaFiles, updateMediaFiles } = useAppSettings();

  return {
    mediaFiles: getMediaFiles(),
    updateMediaFiles,
  };
}

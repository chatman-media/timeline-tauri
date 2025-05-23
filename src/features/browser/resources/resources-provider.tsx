import React, { ReactNode, createContext, useContext } from "react";

import { useMachine } from "@xstate/react";

import { SubtitleStyle } from "@/features/browser/components/tabs/subtitles/subtitles";
import { MediaTemplate } from "@/features/browser/components/tabs/templates/lib/templates";
import { VideoEffect } from "@/types/effects";
import { VideoFilter } from "@/types/filters";
import { MediaFile } from "@/types/media";
import {
  EffectResource,
  FilterResource,
  MusicResource,
  SubtitleResource,
  TemplateResource,
  TransitionResource,
} from "@/types/resources";
import { TransitionEffect } from "@/types/transitions";

import { ResourcesMachineContext, resourcesMachine } from "./resources-machine";

interface ResourcesContextType extends ResourcesMachineContext {
  // Методы для работы с ресурсами
  addEffect: (effect: VideoEffect) => void;
  addFilter: (filter: VideoFilter) => void;
  addTransition: (transition: TransitionEffect) => void;
  addTemplate: (template: MediaTemplate) => void;
  addMusic: (file: MediaFile) => void;
  addSubtitle: (style: SubtitleStyle) => void;
  removeResource: (resourceId: string) => void;
  updateResource: (resourceId: string, params: Record<string, any>) => void;

  // Методы для проверки наличия ресурса в хранилище
  isEffectAdded: (effect: VideoEffect) => boolean;
  isFilterAdded: (filter: VideoFilter) => boolean;
  isTransitionAdded: (transition: TransitionEffect) => boolean;
  isTemplateAdded: (template: MediaTemplate) => boolean;
  isMusicFileAdded: (file: MediaFile) => boolean;
  isSubtitleAdded: (style: SubtitleStyle) => boolean;
}

interface ResourcesProviderProps {
  children: ReactNode;
}

const ResourcesContext = createContext<ResourcesContextType | null>(null);

export function useResources(): ResourcesContextType {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error("useResources must be used within a ResourcesProvider");
  }
  return context;
}

export function ResourcesProvider({ children }: ResourcesProviderProps) {
  const [state, send] = useMachine(resourcesMachine);

  // Извлекаем свойства контекста из состояния машины
  const {
    resources,
    effectResources,
    filterResources,
    transitionResources,
    templateResources,
    musicResources,
    subtitleResources,
  } = state.context;

  // Методы для работы с ресурсами
  const handleAddEffect = React.useCallback(
    (effect: VideoEffect) => {
      send({ type: "ADD_EFFECT", effect });
    },
    [send],
  );

  const handleAddFilter = React.useCallback(
    (filter: VideoFilter) => {
      send({ type: "ADD_FILTER", filter });
    },
    [send],
  );

  const handleAddTransition = React.useCallback(
    (transition: TransitionEffect) => {
      console.log("Adding transition:", transition);
      send({ type: "ADD_TRANSITION", transition });
    },
    [send],
  );

  const handleAddTemplate = React.useCallback(
    (template: MediaTemplate) => {
      send({ type: "ADD_TEMPLATE", template });
    },
    [send],
  );

  const handleAddMusic = React.useCallback(
    (file: MediaFile) => {
      console.log("Adding music file to resources:", file.name);
      send({ type: "ADD_MUSIC", file });
    },
    [send],
  );

  const handleAddSubtitle = React.useCallback(
    (style: SubtitleStyle) => {
      console.log("Adding subtitle style to resources:", style.name);
      send({ type: "ADD_SUBTITLE", style });
    },
    [send],
  );

  const handleRemoveResource = React.useCallback(
    (resourceId: string) => {
      send({ type: "REMOVE_RESOURCE", resourceId });
    },
    [send],
  );

  const handleUpdateResource = React.useCallback(
    (resourceId: string, params: Record<string, any>) => {
      send({ type: "UPDATE_RESOURCE", resourceId, params });
    },
    [send],
  );

  // Методы для проверки наличия ресурса в хранилище
  // Создаем кэш для результатов проверки эффектов
  const effectAddedCache = React.useRef<Record<string, boolean>>({});

  // Сбрасываем кэш при изменении effectResources
  React.useEffect(() => {
    effectAddedCache.current = {};
  }, [effectResources]);

  const isEffectAdded = React.useCallback(
    (effect: VideoEffect) => {
      // Проверяем, есть ли результат в кэше
      if (effectAddedCache.current[effect.id]) {
        return effectAddedCache.current[effect.id];
      }

      // Если результата нет в кэше, вычисляем его
      const isAdded = effectResources.some(
        (resource: EffectResource) => resource.resourceId === effect.id,
      );

      // Сохраняем результат в кэше
      effectAddedCache.current[effect.id] = isAdded;

      return isAdded;
    },
    [effectResources],
  );

  // Создаем кэш для результатов проверки фильтров
  const filterAddedCache = React.useRef<Record<string, boolean>>({});

  // Сбрасываем кэш при изменении filterResources
  React.useEffect(() => {
    filterAddedCache.current = {};
  }, [filterResources]);

  const isFilterAdded = React.useCallback(
    (filter: VideoFilter) => {
      // Проверяем, есть ли результат в кэше
      if (filterAddedCache.current[filter.id]) {
        return filterAddedCache.current[filter.id];
      }

      // Если результата нет в кэше, вычисляем его
      const isAdded = filterResources.some(
        (resource: FilterResource) => resource.resourceId === filter.id,
      );

      // Сохраняем результат в кэше
      filterAddedCache.current[filter.id] = isAdded;

      return isAdded;
    },
    [filterResources],
  );

  // Создаем кэш для результатов проверки переходов
  const transitionAddedCache = React.useRef<Record<string, boolean>>({});

  // Сбрасываем кэш при изменении transitionResources
  React.useEffect(() => {
    transitionAddedCache.current = {};
  }, [transitionResources]);

  const isTransitionAdded = React.useCallback(
    (transition: TransitionEffect) => {
      // Проверяем, есть ли результат в кэше
      const cacheKey = transition.id || transition.type;
      if (transitionAddedCache.current[cacheKey]) {
        return transitionAddedCache.current[cacheKey];
      }

      // Если результата нет в кэше, вычисляем его
      const isAdded = transitionResources.some(
        (resource: TransitionResource) => {
          return (
            resource.resourceId === transition.id ||
            resource.resourceId === transition.type
          );
        },
      );

      // Сохраняем результат в кэше
      transitionAddedCache.current[cacheKey] = isAdded;

      // Логируем только при первой проверке для каждого перехода
      console.log("Checking if transition is added:", transition);
      console.log("Current transitionResources:", transitionResources);
      console.log("Transition isAdded result:", isAdded);

      return isAdded;
    },
    [transitionResources],
  );

  // Создаем кэш для результатов проверки шаблонов
  const templateAddedCache = React.useRef<Record<string, boolean>>({});

  // Сбрасываем кэш при изменении templateResources
  React.useEffect(() => {
    templateAddedCache.current = {};
  }, [templateResources]);

  const isTemplateAdded = React.useCallback(
    (template: MediaTemplate) => {
      // Проверяем, есть ли результат в кэше
      if (templateAddedCache.current[template.id]) {
        return templateAddedCache.current[template.id];
      }

      // Если результата нет в кэше, вычисляем его
      const isAdded = templateResources.some(
        (resource: TemplateResource) => resource.resourceId === template.id,
      );

      // Сохраняем результат в кэше
      templateAddedCache.current[template.id] = isAdded;

      return isAdded;
    },
    [templateResources],
  );

  // Создаем кэш для результатов проверки музыкальных файлов
  const musicFileAddedCache = React.useRef<Record<string, boolean>>({});

  // Сбрасываем кэш при изменении musicResources
  React.useEffect(() => {
    musicFileAddedCache.current = {};
  }, [musicResources]);

  const isMusicFileAdded = React.useCallback(
    (file: MediaFile) => {
      // Проверяем, есть ли результат в кэше
      if (musicFileAddedCache.current[file.id]) {
        return musicFileAddedCache.current[file.id];
      }

      // Если результата нет в кэше, вычисляем его
      const isAdded = musicResources.some(
        (resource: MusicResource) => resource.resourceId === file.id,
      );

      // Сохраняем результат в кэше
      musicFileAddedCache.current[file.id] = isAdded;

      // Логируем только при первой проверке для каждого файла
      console.log("Checking if music file is added:", file.name, file.id);
      console.log("Current music resources:", musicResources);
      console.log("Music file isAdded result:", isAdded);

      return isAdded;
    },
    [musicResources],
  );

  // Создаем кэш для результатов проверки стилей субтитров
  const subtitleAddedCache = React.useRef<Record<string, boolean>>({});

  // Сбрасываем кэш при изменении subtitleResources
  React.useEffect(() => {
    subtitleAddedCache.current = {};
  }, [subtitleResources]);

  const isSubtitleAdded = React.useCallback(
    (style: SubtitleStyle) => {
      // Проверяем, есть ли результат в кэше
      if (subtitleAddedCache.current[style.id]) {
        return subtitleAddedCache.current[style.id];
      }

      // Если результата нет в кэше, вычисляем его
      const isAdded = subtitleResources.some(
        (resource: SubtitleResource) => resource.resourceId === style.id,
      );

      // Сохраняем результат в кэше
      subtitleAddedCache.current[style.id] = isAdded;

      // Логируем только при первой проверке для каждого стиля
      console.log("Checking if subtitle style is added:", style.name, style.id);
      console.log("Current subtitle resources:", subtitleResources);
      console.log("Subtitle style isAdded result:", isAdded);

      return isAdded;
    },
    [subtitleResources],
  );

  const value: ResourcesContextType = {
    // Данные из контекста машины состояний
    resources,
    effectResources,
    filterResources,
    transitionResources,
    templateResources,
    musicResources,
    subtitleResources,

    // Методы для работы с ресурсами
    addEffect: handleAddEffect,
    addFilter: handleAddFilter,
    addTransition: handleAddTransition,
    addTemplate: handleAddTemplate,
    addMusic: handleAddMusic,
    addSubtitle: handleAddSubtitle,
    removeResource: handleRemoveResource,
    updateResource: handleUpdateResource,

    // Методы для проверки наличия ресурса в хранилище
    isEffectAdded,
    isFilterAdded,
    isTransitionAdded,
    isTemplateAdded,
    isMusicFileAdded,
    isSubtitleAdded,
  };

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  );
}

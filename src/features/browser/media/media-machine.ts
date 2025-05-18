import { assign, createMachine, fromPromise } from "xstate"

import { MediaFile } from "@/types/media"

export interface FavoritesType {
  [key: string]: any[]
  media: MediaFile[]
  audio: MediaFile[]
  transition: any[]
  effect: any[]
  template: any[]
  filter: any[]
}

export interface MediaContextType {
  allMediaFiles: MediaFile[]
  error: string | null
  isLoading: boolean
  favorites: FavoritesType
}

export type MediaEventType =
  | { type: "INCLUDE_FILES"; files: MediaFile[] }
  | { type: "REMOVE_FILE"; path: string }
  | { type: "CLEAR_FILES" }
  | { type: "setAllMediaFiles"; files: MediaFile[] }
  | { type: "addMediaFiles"; files: MediaFile[] }
  | { type: "removeMediaFiles"; files: MediaFile[] }
  | { type: "setIncludedFiles"; files: MediaFile[] }
  | { type: "setUnavailableFiles"; files: MediaFile[] }
  | { type: "setLoading"; loading: boolean }
  | { type: "FETCH_MEDIA" }
  | { type: "RELOAD" }
  | { type: "ADD_TO_FAVORITES"; item: any; itemType: string }
  | { type: "REMOVE_FROM_FAVORITES"; item: any; itemType: string }
  | { type: "CLEAR_FAVORITES"; itemType?: string }

const fetchMedia = fromPromise(async () => {
  try {
    console.log("[mediaMachine] Загружаем файлы с сервера")
    const response = await fetch("/api/media")
    if (!response.ok) {
      throw new Error(
        `Ошибка загрузки медиафайлов: ${response.status} ${response.statusText}`,
      )
    }
    const data = await response.json()

    if (!data || typeof data !== "object" || !("media" in data)) {
      throw new Error("Некорректный формат данных от сервера")
    }

    const files = data.media
    if (!Array.isArray(files)) {
      throw new Error("Некорректный формат данных от сервера")
    }

    const validFiles = files.filter(
      (file) =>
        file &&
        typeof file === "object" &&
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (file.isVideo || file.isAudio || file.isImage),
    )

    if (validFiles.length === 0) {
      console.warn("Не найдено валидных медиафайлов")
    }
  } catch (error) {
    console.error("[mediaMachine] Ошибка при загрузке файлов:", error)
    throw error
  }
})

export const mediaMachine = createMachine({
  id: "media",
  initial: "idle",
  context: {
    allMediaFiles: [],
    error: null,
    isLoading: false,
    favorites: {
      media: [],
      audio: [],
      transition: [],
      effect: [],
      template: [],
      filter: [],
    },
  } as MediaContextType,
  states: {
    idle: {
      on: {
        FETCH_MEDIA: "loading",
      },
    },
    loading: {
      entry: assign({ isLoading: true, error: null }),
      invoke: {
        src: fetchMedia,
        onDone: {
          target: "loaded",
          actions: assign({
            allMediaFiles: ({ event }) => event.output,
            isLoading: false,
          }),
        },
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) => (event.error as Error).message,
            isLoading: false,
          }),
        },
      },
    },
    loaded: {
      on: {
        INCLUDE_FILES: {
          actions: [
            assign({
              allMediaFiles: ({ context, event }) => {
                return context.allMediaFiles.map((file) => {
                  const isInEventFiles = event.files.some(
                    (f: MediaFile) => f.path === file.path,
                  )
                  if (isInEventFiles) {
                    return {
                      ...file,
                      isIncluded: true,
                      lastCheckedAt: Date.now(), // Обновляем временную метку
                    }
                  }
                  return file
                })
              },
            }),
          ],
        },
        REMOVE_FILE: {
          actions: [
            assign({
              allMediaFiles: ({ context, event }) => {
                return context.allMediaFiles.map((file) => {
                  if (file.path === event.path) {
                    return {
                      ...file,
                      isIncluded: false,
                      lastCheckedAt: Date.now(), // Обновляем временную метку
                    }
                  }
                  return file
                })
              },
            }),
          ],
        },
        CLEAR_FILES: {
          actions: [
            assign({
              allMediaFiles: ({ context }) => {
                const now = Date.now()
                return context.allMediaFiles.map((file) => {
                  return {
                    ...file,
                    isIncluded: false,
                    lastCheckedAt: now, // Обновляем временную метку
                  }
                })
              },
            }),
          ],
        },
        setAllMediaFiles: {
          actions: [
            assign({
              allMediaFiles: ({ event }) => event.files,
            }),
          ],
        },
        addMediaFiles: {
          actions: [
            assign({
              allMediaFiles: ({ context, event }) => {
                return [...context.allMediaFiles]
              },
            }),
          ],
        },
        removeMediaFiles: {
          actions: [
            assign({
              allMediaFiles: ({ context, event }) =>
                context.allMediaFiles.filter(
                  (f) => !event.files.some((e: MediaFile) => e.path === f.path),
                ),
            }),
          ],
        },
        setIncludedFiles: {
          actions: [
            assign({
              allMediaFiles: ({ context, event }) => {
                const now = Date.now()
                return context.allMediaFiles.map((file) => {
                  const isInEventFiles = event.files.some(
                    (f: MediaFile) => f.path === file.path,
                  )
                  return {
                    ...file,
                    isIncluded: isInEventFiles,
                    lastCheckedAt: now, // Обновляем временную метку
                  }
                })
              },
            }),
          ],
        },
        setUnavailableFiles: {
          actions: [
            assign({
              allMediaFiles: ({ context, event }) => {
                const now = Date.now()
                return context.allMediaFiles.map((file) => {
                  const isInEventFiles = event.files.some(
                    (f: MediaFile) => f.path === file.path,
                  )
                  if (isInEventFiles) {
                    return {
                      ...file,
                      isUnavailable: true,
                      lastCheckedAt: now, // Обновляем временную метку
                    }
                  }
                  return file
                })
              },
            }),
          ],
        },
        setLoading: {
          actions: assign({
            isLoading: ({ event }) => event.loading,
          }),
        },
        ADD_TO_FAVORITES: {
          actions: assign({
            favorites: ({ context, event }) => {
              const { item, itemType } = event
              const currentFavorites = { ...context.favorites }

              // Создаем массив, если его еще нет
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (!currentFavorites[itemType]) {
                currentFavorites[itemType] = []
              }

              // Проверяем, есть ли уже такой элемент в избранном
              const isAlreadyFavorite = currentFavorites[itemType].some(
                (favItem: any) => favItem.id === item.id,
              )

              // Если элемента еще нет в избранном, добавляем его
              if (!isAlreadyFavorite) {
                currentFavorites[itemType] = [
                  ...currentFavorites[itemType],
                  item,
                ]
              }

              return currentFavorites
            },
          }),
        },
        REMOVE_FROM_FAVORITES: {
          actions: assign({
            favorites: ({ context, event }) => {
              const { item, itemType } = event
              const currentFavorites = { ...context.favorites }

              // Если массив существует, удаляем элемент
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (currentFavorites[itemType]) {
                currentFavorites[itemType] = currentFavorites[itemType].filter(
                  (favItem: any) => favItem.id !== item.id,
                )
              }

              return currentFavorites
            },
          }),
        },
        CLEAR_FAVORITES: {
          actions: assign({
            favorites: ({ context, event }) => {
              const currentFavorites = { ...context.favorites }

              // Если указан тип, очищаем только его
              if (event.itemType) {
                currentFavorites[event.itemType] = []
              } else {
                // Иначе очищаем все типы
                Object.keys(currentFavorites).forEach((key) => {
                  currentFavorites[key] = []
                })
              }

              return currentFavorites
            },
          }),
        },
        RELOAD: "loading",
      },
    },
    error: {
      on: {
        RELOAD: "loading",
      },
    },
  },
})

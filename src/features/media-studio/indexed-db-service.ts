import { get, set } from "idb-keyval"

import { UserSettingsContext } from "../user-settings/user-settings-machine"

// Ключи для хранения данных в IndexedDB
export const TIMELINE_USER_SETTINGS_STATE_KEY = "timeline-user-settings-state"
export const TIMELINE_USER_SETTINGS_STATE_TIMESTAMP_KEY = "timeline-user-settings-state-timestamp"

/**
 * Сервис для работы с IndexedDB для таймлайна
 * Предоставляет методы для сохранения и загрузки состояния таймлайна
 */
export class TimelineIndexedDBService {
  private static instance: TimelineIndexedDBService

  /**
   * Получить экземпляр сервиса (Singleton)
   */
  public static getInstance(): TimelineIndexedDBService {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!TimelineIndexedDBService.instance) {
      TimelineIndexedDBService.instance = new TimelineIndexedDBService()
    }
    return TimelineIndexedDBService.instance
  }

  /**
   * Рекурсивно удаляет функции из объекта для безопасной сериализации
   * @param obj Объект для обработки
   * @returns Объект без функций
   */
  private removeFunctions(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj === "function") {
      // Для функций возвращаем строку с описанием
      return "[Function]"
    }

    if (typeof obj !== "object") {
      return obj
    }

    // Для массивов
    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeFunctions(item))
    }

    // Для объектов
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.removeFunctions(obj[key])
      }
    }
    return result
  }

  /**
   * Сохраняет состояние таймлайна в IndexedDB
   * @param state Состояние таймлайна
   */
  public async saveTimelineState(
    state: Partial<UserSettingsContext>,
  ): Promise<void> {
    try {
      // Удаляем функции из объекта перед сохранением
      const safeStateToSave = this.removeFunctions(state)

      // Сохраняем состояние
      await set(TIMELINE_USER_SETTINGS_STATE_KEY, safeStateToSave)
      // Сохраняем временную метку
      await set(TIMELINE_USER_SETTINGS_STATE_TIMESTAMP_KEY, Date.now())
      console.log(
        `[TimelineIndexedDBService] Состояние таймлайна сохранено в IndexedDB`,
      )
    } catch (error) {
      console.error(
        "[TimelineIndexedDBService] Ошибка при сохранении состояния таймлайна:",
        error,
      )
    }
  }

  /**
   * Загружает состояние таймлайна из IndexedDB
   * @returns Состояние таймлайна или null, если данных нет
   */
  public async loadTimelineState(): Promise<Partial<UserSettingsContext> | null> {
    try {
      const state = await get<Partial<UserSettingsContext>>(TIMELINE_USER_SETTINGS_STATE_KEY)
      if (state && Object.keys(state).length > 0) {
        console.log(
          `[TimelineIndexedDBService] Состояние таймлайна загружено из IndexedDB`,
        )
        return state
      }
      console.log(
        "[TimelineIndexedDBService] В IndexedDB нет сохраненного состояния таймлайна",
      )
      return null
    } catch (error) {
      console.error(
        "[TimelineIndexedDBService] Ошибка при загрузке состояния таймлайна:",
        error,
      )
      return null
    }
  }

  /**
   * Получает временную метку последнего сохранения состояния таймлайна
   * @returns Временная метка или null, если данных нет
   */
  public async getLastSaveTimestamp(): Promise<number | null> {
    try {
      const timestamp = await get<number>(TIMELINE_USER_SETTINGS_STATE_TIMESTAMP_KEY)
      return timestamp ?? null
    } catch (error) {
      console.error(
        "[TimelineIndexedDBService] Ошибка при получении временной метки:",
        error,
      )
      return null
    }
  }

  /**
   * Проверяет, нужно ли обновить данные
   * @param maxAgeMs Максимальный возраст данных в миллисекундах (по умолчанию 1 час)
   * @returns true, если данные устарели и нужно обновить
   */
  public async shouldRefreshData(maxAgeMs: number = 3600000): Promise<boolean> {
    const timestamp = await this.getLastSaveTimestamp()
    if (!timestamp) return true

    const now = Date.now()
    const age = now - timestamp
    return age > maxAgeMs
  }
}

// Экспортируем экземпляр сервиса
export const timelineIndexedDBService = TimelineIndexedDBService.getInstance()

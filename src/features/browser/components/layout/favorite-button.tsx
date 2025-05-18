import { memo, useEffect, useRef, useState } from "react"

import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { MediaFile } from "@/types/media"

interface FavoriteButtonProps {
  file: MediaFile
  size?: number
  type?: "media" | "audio" | "transition" | "effect" | "template" | "filter"
  isFavorite?: boolean
  onAddToFavorites?: (
    e: React.MouseEvent,
    file: MediaFile,
    type: string,
  ) => void
  onRemoveFromFavorites?: (
    e: React.MouseEvent,
    file: MediaFile,
    type: string,
  ) => void
}

/**
 * Кнопка для добавления/удаления элемента в избранное
 *
 * Функционал:
 * - Отображает кнопку добавления в избранное
 * - Кнопка с состояниями (в избранном/не в избранном)
 * - Плавная анимация при добавлении в избранное
 * - Задержка перед отображением кнопки удаления из избранного после добавления
 *
 * @param file - Объект медиафайла или другого элемента
 * @param size - Размер кнопки (по умолчанию 60)
 * @param type - Тип элемента (по умолчанию "media")
 */
export const FavoriteButton = memo(function FavoriteButton({
  file,
  size = 60,
  type = "media",
  isFavorite = false,
  onAddToFavorites,
  onRemoveFromFavorites,
}: FavoriteButtonProps) {
  const { t } = useTranslation()

  // Если не переданы обработчики, не рендерим компонент
  if (!onAddToFavorites && !onRemoveFromFavorites) {
    return null
  }

  const [isHovering, setIsHovering] = useState(false)
  const [isRecentlyAdded, setIsRecentlyAdded] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const prevIsFavoriteRef = useRef(isFavorite)

  // Немедленно устанавливаем состояние при изменении isFavorite
  useEffect(() => {
    // Обновляем состояние немедленно при изменении isFavorite
    if (isFavorite !== prevIsFavoriteRef.current) {
      // Если элемент добавлен в избранное, устанавливаем флаг isRecentlyAdded
      if (isFavorite) {
        setIsRecentlyAdded(true)

        // Очищаем предыдущий таймер, если он есть
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }

        // Через 3 секунды сбрасываем флаг
        timerRef.current = setTimeout(() => {
          setIsRecentlyAdded(false)
          timerRef.current = null
        }, 1500)
      } else {
        // Если элемент удален из избранного, сбрасываем флаг isRecentlyAdded
        setIsRecentlyAdded(false)

        // Очищаем таймер
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }

      // Обновляем предыдущее значение isFavorite
      prevIsFavoriteRef.current = isFavorite
    }

    // Очищаем таймер при размонтировании компонента
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isFavorite, file.name])

  // Принудительно обновляем состояние при монтировании компонента
  useEffect(() => {
    // Если элемент уже в избранном при монтировании компонента
    if (isFavorite) {
      setIsRecentlyAdded(true)
      prevIsFavoriteRef.current = true

      // Через 3 секунды сбрасываем флаг
      const timer = setTimeout(() => {
        setIsRecentlyAdded(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isFavorite])

  // Определяем, можно ли показывать кнопку удаления
  // Не показываем кнопку удаления в течение 3 секунд после добавления
  const canShowRemoveButton = !isRecentlyAdded

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isFavorite && isHovering && canShowRemoveButton) {
      // Удаляем из избранного
      onRemoveFromFavorites?.(e, file, type)
    } else if (!isFavorite) {
      // Добавляем в избранное
      onAddToFavorites?.(e, file, type)
      // Немедленно обновляем визуальное состояние
      setIsRecentlyAdded(true)
    }
  }

  const iconSize = size > 100 ? "h-3.5 w-3.5" : "h-2.5 w-2.5"

  return (
    <div
      className={cn(
        "absolute z-10 cursor-pointer rounded-full p-1 text-white transition-all duration-150 dark:hover:text-black/70",
        size > 100 ? "right-[36px] bottom-1" : "right-[28px] bottom-0.5",
        isFavorite
          ? isRecentlyAdded
            ? "visible scale-110 bg-[#38dacac3] dark:bg-[#35d1c1]" // Яркий цвет и увеличенный размер для недавно добавленных
            : "visible bg-[#38dacac3] dark:bg-[#35d1c1]" // Добавлен класс visible
          : "invisible bg-[#2f2d38] group-hover:visible group-hover:bg-[#35d1c1]/75 hover:bg-[#35d1c1] dark:group-hover:bg-[#35d1c1] dark:hover:bg-[#35d1c1]", // Скрыта по умолчанию, видима при наведении
      )}
      onClick={handleToggleFavorite}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title={
        isFavorite
          ? isHovering && canShowRemoveButton
            ? t("browser.media.removeFromFavorites")
            : t("browser.media.inFavorites")
          : t("browser.media.addToFavorites")
      }
    >
      <Star
        className={`${iconSize} ${isFavorite ? "fill-white" : ""} transition-transform duration-150 hover:scale-110`}
        strokeWidth={2}
      />
    </div>
  )
})

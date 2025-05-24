import { memo, useEffect, useRef, useState } from "react";

import { Check, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { MediaFile } from "@/types/media";

interface AddMediaButtonProps {
  file: MediaFile;
  isAdded?: boolean;
  size?: number;
  onAddMedia?: (e: React.MouseEvent, file: MediaFile) => void;
  onRemoveMedia?: (e: React.MouseEvent, file: MediaFile) => void;
}

/**
 * Кнопка для добавления/удаления медиафайла на таймлайн
 *
 * Функционал:
 * - Отображает кнопку добавления медиафайла на таймлайн
 * - Кнопка добавления с состояниями (добавлено/не добавлено)
 * - При наведении на добавленный элемент меняется на кнопку удаления
 * - Темная тема для UI элементов
 * - Плавная анимация при добавлении файла
 * - Задержка перед отображением кнопки удаления после добавления файла
 *
 * @param file - Объект медиафайла
 * @param isAdded - Флаг, показывающий добавлен ли файл
 * @param size - Размер кнопки (по умолчанию 60)
 * @param onAddMedia - Callback для добавления файла
 * @param onRemoveMedia - Callback для удаления файла (если не указан, используется onAddMedia)
 */
export const AddMediaButton = memo(function AddMediaButton({
  file,
  isAdded,
  size = 60,
  onAddMedia,
  onRemoveMedia,
}: AddMediaButtonProps) {
  const { t } = useTranslation();
  const [isHovering, setIsHovering] = useState(false);
  const [isRecentlyAdded, setIsRecentlyAdded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevIsAddedRef = useRef(isAdded);

  // Обновляем состояние при изменении isAdded
  useEffect(() => {
    if (isAdded !== prevIsAddedRef.current) {
      // Если файл добавлен, устанавливаем флаг isRecentlyAdded
      if (isAdded) {
        setIsRecentlyAdded(true);

        // Очищаем предыдущий таймер, если он есть
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Через 1.5 секунды сбрасываем флаг
        timerRef.current = setTimeout(() => {
          setIsRecentlyAdded(false);
          timerRef.current = null;
        }, 1500);
      } else {
        // Если файл удален, сбрасываем флаг isRecentlyAdded
        setIsRecentlyAdded(false);

        // Очищаем таймер
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }

      // Обновляем предыдущее значение isAdded
      prevIsAddedRef.current = isAdded;
    }

    // Очищаем таймер при размонтировании компонента
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAdded]);

  if (!onAddMedia) return null;

  // Если функция удаления не передана, используем функцию добавления
  const handleRemove = onRemoveMedia ?? onAddMedia;

  const iconSize = size > 100 ? "h-3.5 w-3.5" : "h-2.5 w-2.5";

  // Определяем, можно ли показывать кнопку удаления
  // Не показываем кнопку удаления в течение 1.5 секунд после добавления
  const canShowRemoveButton = !isRecentlyAdded;

  return (
    <button
      type="button"
      className={cn(
        "absolute z-[1] cursor-pointer rounded-full p-1 transition-all duration-150 dark:hover:text-black/50 border-0 outline-none focus:ring-2 focus:ring-teal-light",
        size > 100 ? "right-[5px] bottom-1" : "right-1 bottom-0.5",
        isAdded
          ? isRecentlyAdded
            ? "visible scale-110 bg-teal dark:bg-teal" // Яркий цвет и увеличенный размер для недавно добавленных
            : "visible bg-teal dark:bg-teal" // Добавлен класс visible
          : "invisible bg-teal group-hover:visible group-hover:bg-teal-light/75 hover:bg-teal-light dark:group-hover:bg-teal-light/75 dark:hover:bg-teal-light", // Скрыта по умолчанию, видима при наведении
      )}
      style={{ color: "#ffffff" }}
      onClick={(e) => {
        e.stopPropagation();
        // Предотвращаем двойные клики
        e.preventDefault();

        if (isAdded && isHovering && canShowRemoveButton) {
          handleRemove(e, file);
        } else if (!isAdded) {
          onAddMedia(e, file);
          setIsRecentlyAdded(true);
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title={
        isAdded
          ? isHovering && canShowRemoveButton
            ? t("browser.media.remove")
            : t("browser.media.added")
          : t("browser.media.add")
      }
    >
      {isAdded ? (
        isHovering && canShowRemoveButton ? (
          <X className={`${iconSize} text-black/50`} strokeWidth={3} />
        ) : (
          <Check
            className={iconSize}
            strokeWidth={2}
            style={{ color: "#ffffff" }}
          />
        )
      ) : (
        <Plus
          className={`${iconSize} transition-transform duration-150 hover:scale-110`}
          strokeWidth={2}
          style={{ color: "#ffffff" }}
        />
      )}
    </button>
  );
});

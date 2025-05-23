import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaFile } from "@/types/media";

import { MediaGroup } from "./media-group";
import { NoFiles } from "../../layout/no-files";

/**
 * Интерфейс свойств компонента MediaContent
 */
interface MediaContentProps {
  /** Сгруппированные файлы */
  groupedFiles: { title: string; files: MediaFile[] }[];
  /** Режим отображения */
  viewMode: "list" | "grid" | "thumbnails";
  /** Размер превью */
  previewSize: number;
  /** Флаг загрузки */
  isLoading: boolean;
  /** Сообщение об ошибке */
  error: string | null;
  /** Функция для добавления файлов на таймлайн */
  addFilesToTimeline: (files: MediaFile[]) => void;
  /** Функция для повторной загрузки при ошибке */
  onRetry: () => void;
}

/**
 * Компонент для отображения содержимого медиа-списка
 *
 * @param {MediaContentProps} props - Свойства компонента
 * @returns {JSX.Element} Компонент содержимого медиа-списка
 */
export const MediaContent: React.FC<MediaContentProps> = ({
  groupedFiles,
  viewMode,
  previewSize,
  isLoading,
  error,
  addFilesToTimeline,
  onRetry,
}) => {
  const { t } = useTranslation();

  // Если идет загрузка, показываем скелетон
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex w-full flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если есть ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium">{t("common.error")}</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {error}
          </p>
          <Button className="rounded-md px-4 py-2 text-white" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  // Если нет файлов, показываем сообщение об отсутствии файлов
  if (groupedFiles.length === 0 || groupedFiles[0].files.length === 0) {
    return <NoFiles />;
  }

  // Отображаем группы файлов
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-2">
      {groupedFiles.map((group, index) => (
        <MediaGroup
          key={group.title || `group-${index}`}
          title={group.title}
          files={group.files}
          viewMode={viewMode}
          previewSize={previewSize}
          addFilesToTimeline={addFilesToTimeline}
        />
      ))}
    </div>
  );
};

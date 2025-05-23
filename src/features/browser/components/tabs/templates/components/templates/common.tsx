import React from "react";

import { useTranslation } from "react-i18next";

import { MediaFile } from "@/types/media";

import { VideoPanelComponent } from "../video-panel-component";

interface VideoPanelProps {
  video: MediaFile;
  isActive: boolean;
  videoRefs?: Record<string, HTMLVideoElement>;
  index?: number; // Индекс видео в шаблоне
  hideLabel?: boolean; // Флаг для скрытия надписи с названием камеры
  labelPosition?: "left" | "right" | "center"; // Позиция надписи с названием камеры
}

/**
 * Компонент для отображения видео в панели
 * Используем React.memo для предотвращения лишних рендеров
 */
export function VideoPanel({
  video,
  isActive,
  videoRefs,
  index = 0,
  hideLabel = false,
  labelPosition = "center",
}: VideoPanelProps) {
  const { t } = useTranslation();

  // Если видео не существует или не имеет пути, показываем сообщение об ошибке
  // Для пустых видео с id, начинающимся с "empty-", показываем пустой черный экран
  if (!video?.path) {
    if (video?.id?.startsWith("empty-")) {
      return <div className="relative h-full w-full bg-black" />;
    }

    return (
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        <span className="text-white">
          {t("timeline.player.videoUnavailable", "Видео недоступно")}
        </span>
      </div>
    );
  }

  return (
    <VideoPanelComponent
      video={video}
      isActive={isActive}
      videoRefs={videoRefs}
      index={index}
      hideLabel={hideLabel}
      labelPosition={labelPosition}
    />
  );
}

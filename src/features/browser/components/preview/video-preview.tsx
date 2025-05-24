import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { convertFileSrc } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { Film } from "lucide-react";

import { formatDuration } from "@/lib/date";
import { cn, formatResolution } from "@/lib/utils";
import {
  calculateAdaptiveWidth,
  calculateWidth,
  parseRotation,
} from "@/lib/video";
import { FfprobeStream } from "@/types/ffprobe";
import { MediaFile } from "@/types/media";

import { AddMediaButton } from "../layout/add-media-button";
import { FavoriteButton } from "../layout/favorite-button";

interface VideoPreviewProps {
  file: MediaFile;
  onAddMedia?: (e: React.MouseEvent, file: MediaFile) => void;
  isAdded?: boolean;
  size?: number;
  showFileName?: boolean;
  dimensions?: [number, number];
  ignoreRatio?: boolean;
}

/**
 * Предварительный просмотр видеофайла
 *
 * Функционал:
 * - Отображает превью видеофайла с поддержкой ленивой загрузки
 * - Адаптивный размер контейнера с соотношением сторон 16:9
 * - Поддерживает два размера UI (стандартный и большой при size > 100)
 * - Опциональное отображение имени файла
 * - Кнопка добавления с состояниями (добавлено/не добавлено)
 * - Темная тема для UI элементов
 *
 * @param file - Объект файла с путем и метаданными
 * @param onAddMedia - Callback для добавления файла
 * @param isAdded - Флаг, показывающий добавлен ли файл
 * @param size - Размер превью в пикселях (по умолчанию 60)
 * @param showFileName - Флаг для отображения имени файла (по умолчанию false)
 * @param dimensions - Соотношение сторон контейнера [ширина, высота], по умолчанию [16, 9]
 * @param ignoreRatio - Флаг для игнорирования соотношения сторон (по умолчанию false)
 */
export const VideoPreview = memo(function VideoPreview({
  file,
  onAddMedia,
  isAdded,
  size = 60,
  showFileName = false,
  ignoreRatio = false,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Используем useRef для хранения времени последнего обновления
  const lastUpdateTimeRef = useRef(0);

  // Создаем стабильные ключи для рефов
  useEffect(() => {
    const videoStreams =
      file.probeData?.streams.filter((s) => s.codec_type === "video") ?? [];
    videoStreams.forEach((stream) => {
      const key = stream.streamKey ?? `stream-${stream.index}`;
      videoRefs.current[key] ??= null;
    });
  }, [file.probeData?.streams]);

  // Используем useRef для хранения hoverTime вместо useState
  // чтобы избежать ререндеров при движении мыши
  const hoverTimeRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, stream: FfprobeStream) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * (file.duration ?? 0);

      // Обновляем ref и состояние при каждом движении мыши
      hoverTimeRef.current = newTime;
      // Обновляем состояние без задержки
      setHoverTime(newTime);

      const key = stream.streamKey ?? `stream-${stream.index}`;
      const videoRef = videoRefs.current[key];
      if (videoRef) {
        // Устанавливаем время напрямую без лишних логов
        videoRef.currentTime = newTime;
      }
    },
    [file.duration], // Удалили hoverTime из зависимостей, так как он не используется для условной проверки
  );

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    // При уходе мыши останавливаем воспроизведение всех видео, кроме видео в шаблоне
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Функция handlePlayPause, которая управляет воспроизведением только в превью
  const handlePlayPause = useCallback(
    (e: React.MouseEvent, stream: FfprobeStream) => {
      e.preventDefault();
      const key = stream.streamKey ?? `stream-${stream.index}`;
      const videoRef = videoRefs.current[key];
      if (!videoRef) return;

      // Определяем новое состояние воспроизведения (противоположное текущему)
      const newPlayingState = !isPlaying;

      // Воспроизводим только в превью
      if (newPlayingState) {
        // Запускаем воспроизведение в превью
        if (hoverTime !== null) {
          videoRef.currentTime = hoverTime;
        }
        videoRef
          .play()
          .catch((err: unknown) =>
            console.error(
              "[VideoPreview] Ошибка воспроизведения в превью:",
              err,
            ),
          );
      } else {
        // Останавливаем воспроизведение в превью
        videoRef.pause();
      }

      // Обновляем локальное состояние воспроизведения
      setIsPlaying(newPlayingState);

      console.log(
        `[VideoPreview] Видео ${newPlayingState ? "запущено" : "остановлено"} в превью:`,
        file.name,
      );
    },
    [isPlaying, hoverTime, file],
  );

  // Состояние для хранения объекта URL
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Функция для чтения файла и создания объекта URL
  const loadVideoFile = useCallback(async (path: string) => {
    try {
      console.log("[VideoPreview] Чтение файла через readFile:", path);
      const fileData = await readFile(path);
      const blob = new Blob([fileData], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      console.log("[VideoPreview] Создан объект URL:", url);
      setVideoUrl(url);
      return url;
    } catch (error) {
      console.error("[VideoPreview] Ошибка при загрузке видео:", error);
      // В случае ошибки используем convertFileSrc
      const assetUrl = convertFileSrc(path);
      console.log("[VideoPreview] Используем asset URL:", assetUrl);
      setVideoUrl(assetUrl);
      return assetUrl;
    }
  }, []);

  // Эффект для загрузки видео при монтировании компонента
  useEffect(() => {
    let isMounted = true;

    void loadVideoFile(file.path).then((url) => {
      if (isMounted) {
        setVideoUrl(url);
      }
    });

    // Очистка объекта URL при размонтировании компонента
    return () => {
      isMounted = false;
      if (videoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [file.path, loadVideoFile]); // Убираем videoUrl из зависимостей

  // Оптимизируем вычисления с помощью useMemo
  const videoData = useMemo(() => {
    const videoStreams =
      file.probeData?.streams.filter((s) => s.codec_type === "video") ?? [];
    const isMultipleStreams = videoStreams.length > 1;

    return { videoStreams, isMultipleStreams };
  }, [file.probeData?.streams]);

  return (
    <div className={cn("flex h-full w-full items-center justify-center")}>
      {videoData.videoStreams.length === 0 ? (
        // Плейсхолдер с соотношением 16:9 пока метаданные не загрузились
        <div
          className="relative flex-shrink-0"
          style={{
            height: `${size}px`,
            width: `${size * (16 / 9)}px`,
          }}
        >
          <div className="group relative h-full w-full">
            <video
              src={videoUrl || convertFileSrc(file.path)}
              preload="auto"
              tabIndex={0}
              playsInline
              muted={false}
              className={cn(
                "absolute inset-0 h-full w-full focus:outline-none",
                isAdded ? "opacity-50" : "",
              )}
              style={{
                transition: "opacity 0.2s ease-in-out",
              }}
              onLoadedData={() => {
                console.log("Video loaded (placeholder)");
                setIsLoaded(true);
              }}
            />

            {/* Иконка видео для плейсхолдера */}
            <div
              className={cn(
                "pointer-events-none absolute rounded-xs bg-black/60 p-0.5",
                size > 100 ? "bottom-1 left-1" : "bottom-0.5 left-0.5",
              )}
              style={{
                color: "#ffffff",
              }}
            >
              <Film size={size > 100 ? 16 : 12} />
            </div>

            {/* Кнопка избранного для плейсхолдера */}
            <FavoriteButton file={file} size={size} type="media" />

            {/* Кнопка добавления для плейсхолдера */}
            {onAddMedia && (
              <AddMediaButton
                file={file}
                onAddMedia={onAddMedia}
                isAdded={isAdded}
                size={size}
              />
            )}
          </div>
        </div>
      ) : (
        videoData.videoStreams.map((stream: FfprobeStream) => {
          const key = stream.streamKey ?? `stream-${stream.index}`;
          const isMultipleStreams = videoData.isMultipleStreams;

          // Используем размеры из метаданных или значения по умолчанию для 16:9
          const videoWidth = stream.width || 1920;
          const videoHeight = stream.height || 1080;

          const width = calculateWidth(
            videoWidth,
            videoHeight,
            size,
            parseRotation(stream.rotation),
          );

          const adptivedWidth = calculateAdaptiveWidth(
            width,
            isMultipleStreams,
            stream.display_aspect_ratio || "16:9",
          );

          // Используем соотношение сторон из метаданных или 16:9 по умолчанию
          const aspectRatio = stream.display_aspect_ratio
            ?.split(":")
            .map(Number) ?? [16, 9];
          const ratio = aspectRatio[0] / aspectRatio[1];

          return (
            <div
              key={key}
              className="relative flex-shrink-0"
              style={{
                height: `${size}px`,
                width:
                  ratio > 1
                    ? ignoreRatio
                      ? width
                      : adptivedWidth
                    : isMultipleStreams && ignoreRatio
                      ? width
                      : adptivedWidth,
              }}
              onClick={(e) => handlePlayPause(e, stream)}
            >
              <div
                className="group relative h-full w-full"
                onMouseMove={(e) => handleMouseMove(e, stream)}
                onMouseLeave={handleMouseLeave}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[key] = el;
                  }}
                  src={videoUrl || convertFileSrc(file.path)}
                  preload="auto"
                  tabIndex={0}
                  playsInline
                  muted={false} // Включаем звук в превью по запросу пользователя
                  className={cn(
                    "absolute inset-0 h-full w-full focus:outline-none",
                    isAdded ? "opacity-50" : "",
                  )}
                  style={{
                    transition: "opacity 0.2s ease-in-out",
                  }}
                  onEnded={() => {
                    console.log("Video ended for stream:", stream.index);
                    setIsPlaying(false);
                  }}
                  onPlay={(e) => {
                    console.log("Video playing for stream:", stream.index);
                    const video = e.currentTarget;
                    const currentTime = hoverTime;
                    if (currentTime !== null) {
                      video.currentTime = currentTime;
                    }
                  }}
                  onTimeUpdate={(e) => {
                    // Обновляем только каждые 500 мс вместо случайного выбора
                    const now = Date.now();
                    if (now - lastUpdateTimeRef.current > 500) {
                      lastUpdateTimeRef.current = now;
                      console.log(
                        "Time update for stream:",
                        typeof stream.index !== "undefined"
                          ? stream.index
                          : key,
                        "current time:",
                        e.currentTarget.currentTime.toFixed(2),
                      );
                    }
                  }}
                  onError={(e) => {
                    console.log(
                      "Video error for stream:",
                      typeof stream.index !== "undefined" ? stream.index : key,
                      e,
                    );

                    // Получаем элемент видео
                    const video = e.currentTarget as HTMLVideoElement;

                    // Проверяем, какая ошибка произошла
                    if (video.error) {
                      console.error(
                        "[VideoPreview] Ошибка загрузки видео:",
                        video.error.code,
                        video.error.message,
                        "для файла:",
                        file.name,
                        "URL:",
                        video.src,
                      );
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.code === "Space") {
                      e.preventDefault();
                      handlePlayPause(e as unknown as React.MouseEvent, stream);
                    }
                  }}
                  onLoadedData={() => {
                    console.log(
                      "Video loaded for stream:",
                      typeof stream.index !== "undefined" ? stream.index : key,
                    );
                    setIsLoaded(true);

                    // Проверяем, есть ли у файла probeData и streams
                    if (
                      !file.probeData?.streams ||
                      file.probeData.streams.length === 0
                    ) {
                      console.log(
                        "No streams found in probeData for file:",
                        file.name,
                      );
                    }
                  }}
                />

                {/* Продолжительность видео */}
                {!(
                  isMultipleStreams &&
                  typeof stream.index !== "undefined" &&
                  stream.index === 0
                ) && (
                  <div
                    className={cn(
                      "pointer-events-none absolute rounded-xs bg-black/60 text-xs leading-[16px]",
                      size > 100
                        ? "top-1 right-1 px-[4px] py-[2px]"
                        : "top-0.5 right-0.5 px-0.5 py-0",
                    )}
                    style={{
                      fontSize: size > 100 ? "13px" : "11px",
                      color: "#ffffff", // Явно задаем чисто белый цвет для Tauri
                    }}
                  >
                    {formatDuration(file.duration ?? 0, 0, true)}
                  </div>
                )}

                {/* Иконка видео */}
                {!(
                  isMultipleStreams &&
                  typeof stream.index !== "undefined" &&
                  stream.index !== 0
                ) && (
                  <div
                    className={cn(
                      "pointer-events-none absolute rounded-xs bg-black/60 p-0.5",
                      size > 100 ? "bottom-1 left-1" : "bottom-0.5 left-0.5",
                    )}
                    style={{
                      color: "#ffffff", // Явно задаем чисто белый цвет для Tauri
                    }}
                  >
                    <Film size={size > 100 ? 16 : 12} />
                  </div>
                )}

                {/* Кнопка избранного */}
                {!(
                  isMultipleStreams &&
                  typeof stream.index !== "undefined" &&
                  stream.index !== 0
                ) && <FavoriteButton file={file} size={size} type="media" />}

                {/* Разрешение видео */}
                {isLoaded &&
                  !(
                    isMultipleStreams &&
                    typeof stream.index !== "undefined" &&
                    stream.index !== 0
                  ) && (
                    <div
                      className={`pointer-events-none absolute ${
                        size > 100 ? "left-[28px]" : "left-[22px]"
                      } rounded-xs bg-black/60 text-xs leading-[16px] ${size > 100 ? "bottom-1" : "bottom-0.5"} ${
                        size > 100 ? "px-[4px] py-[2px]" : "px-[2px] py-0"
                      }`}
                      style={{
                        fontSize: size > 100 ? "13px" : "11px",
                        color: "#ffffff", // Явно задаем чисто белый цвет для Tauri
                      }}
                    >
                      {formatResolution(stream.width ?? 0, stream.height ?? 0)}
                    </div>
                  )}

                {/* Имя файла */}
                {showFileName &&
                  !(
                    isMultipleStreams &&
                    typeof stream.index !== "undefined" &&
                    stream.index !== 0
                  ) && (
                    <div
                      className={`absolute font-medium ${size > 100 ? "top-1" : "top-0.5"} ${
                        size > 100 ? "left-1" : "left-0.5"
                      } ${
                        size > 100 ? "px-[4px] py-[2px]" : "px-[2px] py-0"
                      } line-clamp-1 rounded-xs bg-black/60 text-xs leading-[16px] ${isMultipleStreams ? "max-w-[100%]" : "max-w-[60%]"}`}
                      style={{
                        fontSize: size > 100 ? "13px" : "11px",
                        color: "#ffffff", // Явно задаем чисто белый цвет для Tauri
                      }}
                    >
                      {file.name}
                    </div>
                  )}

                {/* Кнопка добавления */}
                {onAddMedia &&
                  isLoaded &&
                  typeof stream.index !== "undefined" &&
                  stream.index ===
                    (file.probeData?.streams.filter(
                      (s) => s.codec_type === "video",
                    ).length ?? 0) -
                      1 && (
                    <AddMediaButton
                      file={file}
                      onAddMedia={onAddMedia}
                      isAdded={isAdded}
                      size={size}
                    />
                  )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});

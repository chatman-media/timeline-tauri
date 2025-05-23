import { memo, useCallback, useEffect, useRef, useState } from "react";

import { convertFileSrc } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { Music } from "lucide-react";
import { LiveAudioVisualizer } from "react-audio-visualize";

import { MediaFile } from "@/types/media";

import { AddMediaButton } from "../layout/add-media-button";
import { FavoriteButton } from "../layout/favorite-button";

interface AudioPreviewProps {
  file: MediaFile;
  onAddMedia?: (e: React.MouseEvent, file: MediaFile) => void;
  isAdded?: boolean;
  size?: number;
  showFileName?: boolean;
  dimensions?: [number, number];
}

/**
 * Предварительный просмотр аудиофайла
 *
 * Функционал:
 * - Отображает превью аудиофайла с поддержкой ленивой загрузки
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
 * @param showFileName - Флаг для отображения имени файла
 * @param dimensions - Соотношение сторон контейнера [ширина, высота], по умолчанию [16, 9]
 */
export const AudioPreview = memo(function AudioPreview({
  file,
  onAddMedia,
  isAdded,
  size = 60,
  showFileName = false,
  dimensions = [16, 9],
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * (file.duration ?? 0);
      setHoverTime(newTime);

      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    },
    [file.duration],
  );

  const handlePlayPause = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (hoverTime !== null) {
          audioRef.current.currentTime = hoverTime;
        }
        void audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    },
    [isPlaying, hoverTime],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Состояние для хранения объекта URL
  const [audioUrl, setAudioUrl] = useState<string>("");

  // Функция для чтения файла и создания объекта URL
  const loadAudioFile = useCallback(async (path: string) => {
    try {
      console.log("[AudioPreview] Чтение файла через readFile:", path);
      const fileData = await readFile(path);
      const blob = new Blob([fileData], { type: "audio/mp3" }); // Можно определить тип по расширению файла
      const url = URL.createObjectURL(blob);
      console.log("[AudioPreview] Создан объект URL:", url);
      return url;
    } catch (error) {
      console.error("[AudioPreview] Ошибка при загрузке аудио:", error);
      // В случае ошибки используем convertFileSrc
      const assetUrl = convertFileSrc(path);
      console.log("[AudioPreview] Используем asset URL:", assetUrl);
      return assetUrl;
    }
  }, []);

  // Эффект для загрузки аудио при монтировании компонента
  useEffect(() => {
    let isMounted = true;

    void loadAudioFile(file.path).then((url) => {
      if (isMounted) {
        setAudioUrl(url);
      }
    });

    // Очистка объекта URL при размонтировании компонента
    return () => {
      isMounted = false;
      if (audioUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [file.path, loadAudioFile, audioUrl]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const initAudioContext = () => {
      try {
        audioContextRef.current ??= new AudioContext();

        const audioContext = audioContextRef.current;

        sourceRef.current ??=
          audioContext.createMediaElementSource(audioElement);

        const destination = audioContext.createMediaStreamDestination();
        sourceRef.current.connect(destination);
        sourceRef.current.connect(audioContext.destination);

        const recorder = new MediaRecorder(destination.stream);
        setMediaRecorder(recorder);
        recorder.start();
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    };

    setTimeout(initAudioContext, 100);

    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, [mediaRecorder]);

  return (
    <div
      className={"group relative h-full flex-shrink-0"}
      style={{
        height: `${size}px`,
        width: `${(size * dimensions[0]) / dimensions[1]}px`,
      }}
      onMouseMove={handleMouseMove}
      onClick={handlePlayPause}
      onMouseLeave={handleMouseLeave}
    >
      <audio
        ref={audioRef}
        src={audioUrl || convertFileSrc(file.path)}
        preload="auto"
        tabIndex={0}
        className="pointer-events-none absolute inset-0 h-full w-full focus:outline-none"
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => setIsLoaded(true)}
        onError={(e) =>
          console.error("[AudioPreview] Ошибка загрузки аудио:", e)
        }
        onKeyDown={(e) => {
          if (e.code === "Space") {
            e.preventDefault();
            handlePlayPause(e as unknown as React.MouseEvent);
          }
        }}
      />

      {/* Иконка музыки */}
      <div
        className={`absolute ${size > 100 ? "bottom-1 left-1" : "bottom-0.5 left-0.5"} cursor-pointer rounded-xs bg-black/50 p-0.5 text-white`}
      >
        <Music size={size > 100 ? 16 : 12} />
      </div>

      {/* Имя файла */}
      {showFileName && (
        <div
          className={`absolute font-medium ${size > 100 ? "top-1" : "top-0.5"} ${size > 100 ? "left-1" : "left-0.5"} ${
            size > 100 ? "px-[4px] py-[2px]" : "px-[2px] py-0"
          } line-clamp-1 max-w-[calc(60%)] rounded-xs bg-black/50 text-xs leading-[16px] text-white`}
          style={{
            fontSize: size > 100 ? "13px" : "11px",
          }}
        >
          {file.name}
        </div>
      )}

      {/* Кнопка избранного */}
      <FavoriteButton file={file} size={size} type="audio" />

      {/* кнопка добавления */}
      {onAddMedia && isLoaded && (
        <AddMediaButton
          file={file}
          onAddMedia={onAddMedia}
          isAdded={isAdded}
          size={size}
        />
      )}

      {/* Аудио визуализация */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 select-none"
        style={{
          height: `${size}px`,
          width: `${(size * dimensions[0]) / dimensions[1]}px`,
        }}
      >
        {mediaRecorder && (
          <LiveAudioVisualizer
            mediaRecorder={mediaRecorder}
            width={(size * dimensions[0]) / dimensions[1]}
            height={size}
            barWidth={1}
            gap={0}
            barColor="#35d1c1"
            backgroundColor="transparent"
          />
        )}
      </div>
    </div>
  );
});

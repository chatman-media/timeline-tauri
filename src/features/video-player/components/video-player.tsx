import React from "react";

import { convertFileSrc } from "@tauri-apps/api/core";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useProjectSettings } from "@/features/modals/features/project-settings/project-settings-provider";

import { PlayerControls } from "./player-controls";
import { usePlayer } from "./player-provider";

/**
 * Компонент медиа-плеера для воспроизведения видео
 */
export function VideoPlayer() {
  const {
    settings: { aspectRatio },
  } = useProjectSettings();
  const { video } = usePlayer();

  // Вычисляем соотношение сторон для AspectRatio
  const aspectRatioValue = aspectRatio.value.width / aspectRatio.value.height;

  // Вычисляем стили для контейнера видео
  const containerStyle = {
    position: "relative" as const,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  };

  if (!video?.path) {
    return null;
  }

  return (
    <div className="media-player-container relative flex h-full flex-col">
      <div className="relative flex-1 bg-black" style={containerStyle}>
        <div className="flex h-full w-full items-center justify-center">
          <div className="max-h-[calc(100%-85px)] w-full max-w-[100%]">
            <AspectRatio ratio={aspectRatioValue} className="bg-black">
              <div className="relative h-full w-full">
                <video
                  key={video.id || "no-video"}
                  src={convertFileSrc(video.path)}
                  controls={false}
                  autoPlay={false}
                  loop={false}
                  disablePictureInPicture
                  preload="auto"
                  tabIndex={0}
                  playsInline
                  muted={false}
                  className="absolute inset-0 h-full w-full focus:outline-none"
                  style={{
                    position: "absolute" as const,
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                />
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
      <PlayerControls currentTime={0} file={video} />
    </div>
  );
}

VideoPlayer.displayName = "VideoPlayer";

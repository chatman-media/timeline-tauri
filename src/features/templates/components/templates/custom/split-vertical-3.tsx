import React from "react";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { VideoPanelComponent } from "../../video-panel-component";
import { TemplateProps } from "../types";

/**
 * Универсальный шаблон "3 экрана по вертикали"
 * Поддерживает все форматы: landscape, portrait, square
 */
export function SplitVertical3({
  videos,
  activeVideoId,
  videoRefs,
  isResizable = true,
  templateId,
}: TemplateProps & { templateId?: string }) {
  // Проверяем, что у нас есть видео с путями
  const validVideos = videos.filter((v) => v?.path);
  const videoCount = Math.min(validVideos.length, 3);

  // Определяем ориентацию на основе ID шаблона
  const isPortrait = templateId ? templateId.includes("portrait") : false;
  const isSquare = templateId ? templateId.includes("square") : false;
  const isLandscape = templateId
    ? templateId.includes("landscape") || (!isPortrait && !isSquare)
    : true;

  console.log(
    `[SplitVertical3] Рендеринг шаблона ${templateId} с параметрами:`,
    {
      isPortrait,
      isSquare,
      isLandscape,
      isResizable,
    },
  );

  // Если недостаточно видео, возвращаем пустой div
  if (videoCount < 3) {
    return <div className="h-full w-full bg-black" />;
  }

  // Рендеринг в режиме без возможности изменения размеров
  if (!isResizable) {
    // Ландшафтный или квадратный режим - вертикальные экраны (в ряд)
    return (
      <div
        className="flex h-full w-full"
        style={{ border: "1px solid #35d1c1" }}
      >
        {/* Первое видео */}
        <div className="h-full w-1/3">
          <VideoPanelComponent
            video={validVideos[0]}
            isActive={validVideos[0]?.id === activeVideoId}
            videoRefs={videoRefs}
            index={0}
          />
        </div>

        {/* Разделительная линия */}
        <div className="h-full w-[1px] bg-[#35d1c1]" />

        {/* Второе видео */}
        <div className="h-full w-1/3">
          <VideoPanelComponent
            video={validVideos[1]}
            isActive={validVideos[1]?.id === activeVideoId}
            videoRefs={videoRefs}
            index={1}
          />
        </div>

        {/* Разделительная линия */}
        <div className="h-full w-[1px] bg-[#35d1c1]" />

        {/* Третье видео */}
        <div className="h-full w-1/3">
          <VideoPanelComponent
            video={validVideos[2]}
            isActive={validVideos[2]?.id === activeVideoId}
            videoRefs={videoRefs}
            index={2}
          />
        </div>
      </div>
    );
  }

  // Ландшафтный или квадратный режим - вертикальные экраны (в ряд)
  return (
    <div
      className="h-full w-full"
      style={{ overflow: "visible", border: "1px solid #35d1c1" }}
    >
      <PanelGroup direction="horizontal">
        {/* Первая секция */}
        <Panel defaultSize={33.33} minSize={10}>
          <VideoPanelComponent
            video={validVideos[0]}
            isActive={validVideos[0]?.id === activeVideoId}
            videoRefs={videoRefs}
            index={0}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-[#35d1c1] hover:bg-[#35d1c1]" />
        {/* Вторая секция */}
        <Panel defaultSize={33.33} minSize={10}>
          <VideoPanelComponent
            video={validVideos[1]}
            isActive={validVideos[1]?.id === activeVideoId}
            videoRefs={videoRefs}
            index={1}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-[#35d1c1] hover:bg-[#35d1c1]" />
        {/* Третья секция */}
        <Panel defaultSize={33.34} minSize={10}>
          <VideoPanelComponent
            video={validVideos[2]}
            isActive={validVideos[2]?.id === activeVideoId}
            videoRefs={videoRefs}
            index={2}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

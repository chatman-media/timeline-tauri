import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MediaFile } from "@/types/media";

import { AudioPreview } from "./audio-preview";

// Мокаем компоненты, которые используются в AudioPreview
vi.mock("./preview-timeline", () => ({
  PreviewTimeline: ({ time, duration, videoRef }: any) => (
    <div
      data-testid="preview-timeline"
      data-time={time}
      data-duration={duration}
      data-video-ref={videoRef ? "exists" : "null"}
    >
      Timeline
    </div>
  ),
}));

vi.mock("../layout/add-media-button", () => ({
  AddMediaButton: ({ file, onAddMedia, isAdded, size }: any) => (
    <button
      data-testid="add-media-button"
      data-file={file.name}
      data-is-added={isAdded}
      data-size={size}
      onClick={(e) => onAddMedia(e, file)}
    >
      Add Media
    </button>
  ),
}));

vi.mock("../layout/favorite-button", () => ({
  FavoriteButton: ({ file, size, type }: any) => (
    <button
      data-testid="favorite-button"
      data-file={file.name}
      data-size={size}
      data-type={type}
    >
      Favorite
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Music: ({ size }: any) => (
    <div data-testid="music-icon" data-size={size}>
      Music Icon
    </div>
  ),
}));

vi.mock("react-audio-visualize", () => ({
  LiveAudioVisualizer: ({
    mediaRecorder,
    width,
    height,
    barWidth,
    gap,
    barColor,
    backgroundColor,
  }: any) => (
    <div
      data-testid="audio-visualizer"
      data-width={width}
      data-height={height}
      data-bar-width={barWidth}
      data-gap={gap}
      data-bar-color={barColor}
      data-background-color={backgroundColor}
    >
      Audio Visualizer
    </div>
  ),
}));

// Мокаем глобальные объекты
global.AudioContext = vi.fn().mockImplementation(() => ({
  createMediaElementSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  createMediaStreamDestination: vi.fn().mockReturnValue({
    stream: new MediaStream(),
  }),
  destination: {},
  close: vi.fn(),
}));

global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
}));

describe("AudioPreview", () => {
  const audioFile: MediaFile = {
    id: "audio1",
    name: "audio.mp3",
    path: "/path/to/audio.mp3",
    isVideo: false,
    isAudio: true,
    isImage: false,
    duration: 180, // 3 минуты
  };

  it("should render correctly with default props", () => {
    render(<AudioPreview file={audioFile} />);

    // Проверяем, что аудио элемент отображается
    const audioElement = document.querySelector("audio");
    expect(audioElement).not.toBeNull();
    expect(audioElement).toHaveAttribute("src", "converted-/path/to/audio.mp3");

    // Проверяем, что иконка музыки отображается
    const musicIcon = screen.getByTestId("music-icon");
    expect(musicIcon).toBeInTheDocument();
    expect(musicIcon).toHaveAttribute("data-size", "12"); // Маленький размер по умолчанию

    // Проверяем, что кнопка избранного отображается
    const favoriteButton = screen.getByTestId("favorite-button");
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton).toHaveAttribute("data-file", "audio.mp3");
    expect(favoriteButton).toHaveAttribute("data-size", "60");
    expect(favoriteButton).toHaveAttribute("data-type", "audio");

    // Проверяем, что имя файла не отображается
    expect(screen.queryByText("audio.mp3")).not.toBeInTheDocument();

    // Проверяем, что timeline не отображается
    expect(screen.queryByTestId("preview-timeline")).not.toBeInTheDocument();
  });

  it("should show filename when showFileName is true", () => {
    render(<AudioPreview file={audioFile} showFileName={true} />);

    // Проверяем, что имя файла отображается
    expect(screen.getByText("audio.mp3")).toBeInTheDocument();
  });

  it("should render with custom size and dimensions", () => {
    render(<AudioPreview file={audioFile} size={120} dimensions={[4, 3]} />);

    // Проверяем, что иконка музыки имеет больший размер
    const musicIcon = screen.getByTestId("music-icon");
    expect(musicIcon).toHaveAttribute("data-size", "16"); // Большой размер для size > 100

    // Проверяем, что кнопка избранного имеет правильный размер
    const favoriteButton = screen.getByTestId("favorite-button");
    expect(favoriteButton).toHaveAttribute("data-size", "120");
  });
});

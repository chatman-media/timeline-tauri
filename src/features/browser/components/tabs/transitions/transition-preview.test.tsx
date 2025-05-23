import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TransitionPreview } from "./transition-preview";

// Мокируем FavoriteButton и AddMediaButton
vi.mock("@/features/browser/components/layout/favorite-button", () => ({
  FavoriteButton: ({ file, type }: any) => (
    <div data-testid="favorite-button">
      Favorite Button for {file.name} ({type})
    </div>
  ),
}));

vi.mock("@/features/browser/components/layout/add-media-button", () => ({
  AddMediaButton: ({ file, onAddMedia, onRemoveMedia, isAdded, size }: any) => (
    <div>
      {isAdded ? (
        <button
          data-testid="remove-media-button"
          onClick={(e) => onRemoveMedia(e)}
        >
          Remove {file.name}
        </button>
      ) : (
        <button data-testid="add-media-button" onClick={(e) => onAddMedia(e)}>
          Add {file.name}
        </button>
      )}
    </div>
  ),
}));

// Мокируем useTranslation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Возвращаем ключ как значение для простоты тестирования
      return key;
    },
  }),
}));

// Мокируем useResources
const mockAddTransition = vi.fn();
const mockRemoveResource = vi.fn();
const mockIsTransitionAdded = vi.fn().mockReturnValue(false);

vi.mock("@/features/browser/resources", () => ({
  useResources: () => ({
    addTransition: mockAddTransition,
    removeResource: mockRemoveResource,
    isTransitionAdded: mockIsTransitionAdded,
    transitionResources: [
      { id: "transition-resource-1", resourceId: "fade", type: "transition" },
    ],
  }),
}));

// Мокируем HTMLVideoElement
Object.defineProperty(window.HTMLVideoElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockImplementation(() => {
    // Эмулируем успешное воспроизведение
    return Promise.resolve();
  }),
});

Object.defineProperty(window.HTMLVideoElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});

// Мокируем transitions из types/transitions
vi.mock("@/types/transitions", () => {
  return {
    transitionEffects: [
      {
        id: "fade",
        type: "fade",
        name: "Fade",
        duration: 1.5,
        ffmpegCommand: () => "",
        params: {},
        previewPath: "",
      },
      {
        id: "zoom",
        type: "zoom",
        name: "Zoom",
        duration: 1.5,
        ffmpegCommand: () => "",
        params: {},
        previewPath: "",
      },
    ],
    transitions: [
      {
        id: "fade",
        type: "fade",
        name: "Fade",
        duration: 1.5,
        ffmpegCommand: () => "",
        params: {},
        previewPath: "",
      },
      {
        id: "zoom",
        type: "zoom",
        name: "Zoom",
        duration: 1.5,
        ffmpegCommand: () => "",
        params: {},
        previewPath: "",
      },
    ],
  };
});

describe("TransitionPreview", () => {
  // Тестовые пропсы
  const mockProps = {
    sourceVideo: { path: "t1.mp4", id: "source", name: "Source Video" },
    targetVideo: { path: "t2.mp4", id: "target", name: "Target Video" },
    transitionType: "fade" as const,
    onClick: vi.fn(),
    size: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем состояние isTransitionAdded перед каждым тестом
    mockIsTransitionAdded.mockReturnValue(false);
  });

  it("renders correctly with all elements", () => {
    render(<TransitionPreview {...mockProps} />);

    // Проверяем, что видео элементы отрендерились
    const sourceVideo = screen.getByTestId("source-video");
    const targetVideo = screen.getByTestId("target-video");

    expect(sourceVideo).toBeInTheDocument();
    expect(targetVideo).toBeInTheDocument();

    expect(sourceVideo).toHaveAttribute("src", "t1.mp4");
    expect(targetVideo).toHaveAttribute("src", "t2.mp4");

    // Проверяем, что название перехода отображается
    expect(screen.getByText("transitions.types.fade")).toBeInTheDocument();

    // Проверяем, что кнопка добавления перехода отображается
    expect(screen.getByTestId("add-media-button")).toBeInTheDocument();

    // Проверяем, что кнопка избранного отображается
    expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
  });

  it("applies transition style when hovering", async () => {
    render(<TransitionPreview {...mockProps} />);

    const sourceVideo = screen.getByTestId("source-video");
    const targetVideo = screen.getByTestId("target-video");
    const container = sourceVideo.closest("div");

    // Симулируем наведение мыши
    fireEvent.mouseEnter(container!);

    // Проверяем, что видео начинает воспроизводиться
    await waitFor(() => {
      expect(sourceVideo.play).toHaveBeenCalled();
    });

    // Симулируем уход мыши
    fireEvent.mouseLeave(container!);

    // Проверяем, что видео останавливается
    await waitFor(() => {
      expect(sourceVideo.pause).toHaveBeenCalled();
      expect(targetVideo.pause).toHaveBeenCalled();
    });
  });

  it("calls onClick when clicked", () => {
    render(<TransitionPreview {...mockProps} />);

    const sourceVideo = screen.getByTestId("source-video");
    const container = sourceVideo.closest("div");
    fireEvent.click(container!);

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("calls addTransition when add button is clicked", () => {
    render(<TransitionPreview {...mockProps} />);

    const addButton = screen.getByTestId("add-media-button");
    fireEvent.click(addButton);

    expect(mockAddTransition).toHaveBeenCalledTimes(1);
    // Проверяем, что addTransition был вызван с правильным переходом
    expect(mockAddTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "fade",
        type: "fade",
      }),
    );
  });

  it("shows remove button when transition is already added", () => {
    // Меняем возвращаемое значение мока isTransitionAdded
    mockIsTransitionAdded.mockReturnValue(true);

    render(<TransitionPreview {...mockProps} />);

    // Проверяем, что кнопка удаления отображается
    expect(screen.getByTestId("remove-media-button")).toBeInTheDocument();
  });

  it("calls removeResource when remove button is clicked", () => {
    // Меняем возвращаемое значение мока isTransitionAdded
    mockIsTransitionAdded.mockReturnValue(true);

    render(<TransitionPreview {...mockProps} />);

    const removeButton = screen.getByTestId("remove-media-button");
    fireEvent.click(removeButton);

    // Проверяем, что removeResource был вызван
    expect(mockRemoveResource).toHaveBeenCalledTimes(1);
    expect(mockRemoveResource).toHaveBeenCalledWith("transition-resource-1");
  });

  it("applies different transitions for different transition types", async () => {
    // Рендерим с другим типом перехода
    render(<TransitionPreview {...mockProps} transitionType="zoom" />);

    const sourceVideo = screen.getByTestId("source-video");
    const container = sourceVideo.closest("div");

    // Симулируем наведение мыши
    fireEvent.mouseEnter(container!);

    // Проверяем, что видео начинает воспроизводиться
    await waitFor(() => {
      expect(sourceVideo.play).toHaveBeenCalled();
    });

    // Проверяем, что название перехода отображается правильно
    expect(screen.getByText("transitions.types.zoom")).toBeInTheDocument();
  });
});

import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MediaListProvider, useMediaList } from "./media-list-provider";

// Создаем моковый объект для send
const mockSend = vi.fn();

// Создаем моковый объект для состояния
const mockState = {
  context: {
    mediaFiles: [],
    filteredFiles: [],
    searchQuery: "",
    sortBy: "date",
    sortOrder: "desc",
    filterType: "all",
    viewMode: "list",
    groupBy: "none",
    availableExtensions: [],
    showFavoritesOnly: false,
    previewSize: 120,
    canIncreaseSize: true,
    canDecreaseSize: true,
    isLoading: false,
    error: null,
  },
  matches: (state: string) => state === "success",
  status: "active",
  value: "success",
};

// Мокаем useMachine из @xstate/react
vi.mock("@xstate/react", () => ({
  useMachine: vi.fn(() => [mockState, mockSend]),
}));

// Мокаем mediaListMachine
vi.mock("./media-list-machine", () => ({
  mediaListMachine: {
    createMachine: vi.fn(),
  },
  DEFAULT_PREVIEW_SIZE: 120,
  MIN_PREVIEW_SIZE: 80,
  MAX_PREVIEW_SIZE: 200,
}));

// Мокаем useMedia
vi.mock("@/features/browser/media", () => ({
  useMedia: vi.fn(() => ({
    allMediaFiles: [],
    includedFiles: [],
    favorites: {
      media: [],
      audio: [],
      transition: [],
      effect: [],
      template: [],
      filter: [],
    },
  })),
}));

// Мокаем console.log и console.error
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

// Компонент-обертка для тестирования хука useMediaList
function MediaListWrapper({ children }: { children: React.ReactNode }) {
  return <MediaListProvider>{children}</MediaListProvider>;
}

describe("MediaListProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <MediaListProvider>
        <div data-testid="test-child">Test Child</div>
      </MediaListProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("should provide MediaListContext", () => {
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Проверяем, что контекст содержит ожидаемые свойства
    expect(result.current).toBeDefined();
    expect(result.current.mediaFiles).toEqual([]);
    expect(result.current.filteredFiles).toEqual([]);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortBy).toBe("date");
    expect(result.current.sortOrder).toBe("desc");
    expect(result.current.filterType).toBe("all");
    expect(result.current.viewMode).toBe("list");
    expect(result.current.groupBy).toBe("none");
    expect(result.current.availableExtensions).toEqual([]);
    expect(result.current.showFavoritesOnly).toBe(false);
    expect(result.current.previewSize).toBe(120);
    expect(result.current.canIncreaseSize).toBe(true);
    expect(result.current.canDecreaseSize).toBe(true);
  });

  it("should provide methods for interacting with media list state", () => {
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Проверяем наличие всех методов
    expect(result.current.search).toBeDefined();
    expect(typeof result.current.search).toBe("function");

    expect(result.current.sort).toBeDefined();
    expect(typeof result.current.sort).toBe("function");

    expect(result.current.filter).toBeDefined();
    expect(typeof result.current.filter).toBe("function");

    expect(result.current.changeOrder).toBeDefined();
    expect(typeof result.current.changeOrder).toBe("function");

    expect(result.current.changeViewMode).toBeDefined();
    expect(typeof result.current.changeViewMode).toBe("function");

    expect(result.current.changeGroupBy).toBeDefined();
    expect(typeof result.current.changeGroupBy).toBe("function");

    expect(result.current.toggleFavorites).toBeDefined();
    expect(typeof result.current.toggleFavorites).toBe("function");

    expect(result.current.retry).toBeDefined();
    expect(typeof result.current.retry).toBe("function");

    expect(result.current.increasePreviewSize).toBeDefined();
    expect(typeof result.current.increasePreviewSize).toBe("function");

    expect(result.current.decreasePreviewSize).toBeDefined();
    expect(typeof result.current.decreasePreviewSize).toBe("function");

    expect(result.current.setPreviewSize).toBeDefined();
    expect(typeof result.current.setPreviewSize).toBe("function");

    expect(result.current.setSearchQuery).toBeDefined();
    expect(typeof result.current.setSearchQuery).toBe("function");

    expect(result.current.setShowFavoritesOnly).toBeDefined();
    expect(typeof result.current.setShowFavoritesOnly).toBe("function");
  });

  it("should throw error when useMediaList is used outside of MediaListProvider", () => {
    // Проверяем, что хук выбрасывает ошибку, если используется вне провайдера
    const consoleError = console.error;
    console.error = vi.fn(); // Подавляем ошибки в консоли во время теста

    expect(() => renderHook(() => useMediaList())).toThrow(
      "useMediaList must be used within a MediaListProvider",
    );

    console.error = consoleError; // Восстанавливаем console.error
  });

  it("should call send with correct parameters when sorting", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод сортировки
    act(() => {
      result.current.sort("name");
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "SORT",
      sortBy: "name",
    });
  });

  it("should not call send with SORT event when using invalid sort criteria", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Мокаем console.error для проверки ошибки
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод сортировки с недопустимым критерием
    act(() => {
      result.current.sort("invalid_criteria");
    });

    // Проверяем, что send не был вызван с событием SORT
    // Другие события, такие как UPDATE_MEDIA_FILES, могут вызываться из useEffect
    expect(mockSend).not.toHaveBeenCalledWith({
      type: "SORT",
      sortBy: "invalid_criteria",
    });

    // Проверяем, что была выведена ошибка
    expect(console.error).toHaveBeenCalledWith(
      "Invalid sort criteria:",
      "invalid_criteria",
    );

    // Восстанавливаем console.error
    console.error = originalConsoleError;
  });

  it("should call send with correct parameters when filtering", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Создаем моковый медиа-контекст
    const mockMediaContext = {
      allMediaFiles: [],
      includedFiles: [],
      favorites: {
        media: [],
        audio: [],
        transition: [],
        effect: [],
        template: [],
        filter: [],
      },
    };

    // Вызываем метод фильтрации
    act(() => {
      result.current.filter("video", mockMediaContext);
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "FILTER",
      filterType: "video",
      mediaContext: mockMediaContext,
    });
  });

  it("should call send with correct parameters when searching", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Создаем моковый медиа-контекст
    const mockMediaContext = {
      allMediaFiles: [],
      includedFiles: [],
      favorites: {
        media: [],
        audio: [],
        transition: [],
        effect: [],
        template: [],
        filter: [],
      },
    };

    // Вызываем метод поиска
    act(() => {
      result.current.search("test query", mockMediaContext);
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "SEARCH",
      query: "test query",
      mediaContext: mockMediaContext,
    });
  });

  it("should call send with correct parameters when changing view mode", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод изменения режима отображения
    act(() => {
      result.current.changeViewMode("grid");
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "CHANGE_VIEW_MODE",
      mode: "grid",
    });
  });

  it("should call send with correct parameters when changing group by", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод изменения группировки
    act(() => {
      result.current.changeGroupBy("type");
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "CHANGE_GROUP_BY",
      groupBy: "type",
    });
  });

  it("should call send with correct parameters when changing order", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод изменения порядка сортировки
    act(() => {
      result.current.changeOrder();
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "CHANGE_ORDER",
    });
  });

  it("should call send with correct parameters when toggling favorites", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Создаем моковый медиа-контекст
    const mockMediaContext = {
      allMediaFiles: [],
      includedFiles: [],
      favorites: {
        media: [],
        audio: [],
        transition: [],
        effect: [],
        template: [],
        filter: [],
      },
    };

    // Вызываем метод переключения избранных
    act(() => {
      result.current.toggleFavorites(mockMediaContext);
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "TOGGLE_FAVORITES",
      mediaContext: mockMediaContext,
    });
  });

  it("should call send with correct parameters when increasing preview size", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Устанавливаем возможность увеличения размера превью
    mockState.context.canIncreaseSize = true;

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод увеличения размера превью
    act(() => {
      result.current.increasePreviewSize();
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "INCREASE_PREVIEW_SIZE",
    });
  });

  it("should not call send with INCREASE_PREVIEW_SIZE when canIncreaseSize is false", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Устанавливаем невозможность увеличения размера превью
    mockState.context.canIncreaseSize = false;

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод увеличения размера превью
    act(() => {
      result.current.increasePreviewSize();
    });

    // Проверяем, что send не был вызван с событием INCREASE_PREVIEW_SIZE
    // Другие события, такие как UPDATE_MEDIA_FILES, могут вызываться из useEffect
    expect(mockSend).not.toHaveBeenCalledWith({
      type: "INCREASE_PREVIEW_SIZE",
    });
  });

  it("should call send with correct parameters when decreasing preview size", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Устанавливаем возможность уменьшения размера превью
    mockState.context.canDecreaseSize = true;

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод уменьшения размера превью
    act(() => {
      result.current.decreasePreviewSize();
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "DECREASE_PREVIEW_SIZE",
    });
  });

  it("should call send with correct parameters when setting preview size", () => {
    // Очищаем моковый объект перед тестом
    mockSend.mockClear();

    // Используем renderHook для тестирования хука useMediaList
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    // Вызываем метод установки размера превью
    act(() => {
      result.current.setPreviewSize(150);
    });

    // Проверяем, что send был вызван с правильными параметрами
    expect(mockSend).toHaveBeenCalledWith({
      type: "SET_PREVIEW_SIZE",
      size: 150,
    });
  });

  it("should update UI when state changes", () => {
    // Изменяем состояние в моке
    Object.assign(mockState.context, {
      mediaFiles: [
        { id: "test-file", name: "test.mp4", path: "/test/test.mp4" },
      ],
      filteredFiles: [
        { id: "test-file", name: "test.mp4", path: "/test/test.mp4" },
      ],
      searchQuery: "test",
      sortBy: "name",
      sortOrder: "asc",
      filterType: "video",
      viewMode: "grid",
      groupBy: "type",
      previewSize: 150,
    });

    // Рендерим компонент
    render(
      <MediaListProvider>
        <div data-testid="test-child">Test Child</div>
      </MediaListProvider>,
    );

    // Проверяем, что контекст обновился
    const { result } = renderHook(() => useMediaList(), {
      wrapper: MediaListWrapper,
    });

    expect(result.current.mediaFiles).toHaveLength(1);
    expect(result.current.filteredFiles).toHaveLength(1);
    expect(result.current.searchQuery).toBe("test");
    expect(result.current.sortBy).toBe("name");
    expect(result.current.sortOrder).toBe("asc");
    expect(result.current.filterType).toBe("video");
    expect(result.current.viewMode).toBe("grid");
    expect(result.current.groupBy).toBe("type");
    expect(result.current.previewSize).toBe(150);
  });
});

import React, { useEffect, useState } from "react"

import {
  ArrowDownUp,
  ArrowUpDown,
  Check,
  File,
  Filter,
  Folder,
  Grid,
  LayoutDashboard,
  LayoutList,
  ListFilterPlus,
  Mic,
  SortDesc,
  Star,
  Webcam,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModal } from "@/features/modals"
import { cn } from "@/lib/utils"

interface MediaToolbarProps {
  viewMode: "list" | "grid" | "thumbnails"
  onViewModeChange: (mode: "list" | "grid" | "thumbnails") => void
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  onSort: (sortBy: string) => void
  onFilter: (filterType: string) => void
  onGroupBy: (groupBy: string) => void
  onChangeOrder?: () => void
  sortOrder?: "asc" | "desc"
  currentSortBy?: string
  currentFilterType?: string
  currentGroupBy?: string
  onIncreaseSize?: () => void
  onDecreaseSize?: () => void
  canIncreaseSize?: boolean
  canDecreaseSize?: boolean
  showFavoritesOnly?: boolean
  onToggleFavorites?: () => void
}

/**
 * Компонент для управления медиа-инструментами
 *
 * @param viewMode - Режим просмотра (список, сетка, миниатюры)
 * @param onViewModeChange - Callback для изменения режима просмотра
 * @param searchQuery - Текущий запрос поиска
 * @param setSearchQuery - Callback для установки запроса поиска
 * @param onSort - Callback для сортировки
 * @param onFilter - Callback для фильтрации
 * @param onGroupBy - Callback для группировки
 * @param onChangeOrder - Callback для изменения порядка сортировки
 * @param sortOrder - Порядок сортировки (возрастание, убывание)
 * @param currentSortBy - Текущий параметр сортировки
 * @param currentFilterType - Текущий тип фильтра
 * @param currentGroupBy - Текущий параметр группировки
 * @param onIncreaseSize - Callback для увеличения размера превью
 * @param onDecreaseSize - Callback для уменьшения размера превью
 * @param canIncreaseSize - Флаг, указывающий на возможность увеличения размера превью
 * @param canDecreaseSize - Флаг, указывающий на возможность уменьшения размера превью
 */
export function MediaToolbar({
  viewMode = "thumbnails",
  onViewModeChange,
  searchQuery = "",
  setSearchQuery = () => {},
  onSort,
  onFilter,
  onGroupBy,
  onChangeOrder = () => {},
  sortOrder = "desc",
  currentSortBy = "date",
  currentFilterType = "all",
  currentGroupBy = "none",
  onIncreaseSize = () => {},
  onDecreaseSize = () => {},
  canIncreaseSize = true,
  canDecreaseSize = true,
  showFavoritesOnly = false,
  onToggleFavorites = () => {},
}: MediaToolbarProps) {
  const { t } = useTranslation()
  // Внутренний стейт для управления текущим выбором
  const [internalSortBy, setInternalSortBy] = useState(currentSortBy)
  const [internalFilterType, setInternalFilterType] =
    useState(currentFilterType)
  const [internalGroupBy, setInternalGroupBy] = useState(currentGroupBy)
  // Синхронизация внутреннего стейта с пропсами
  useEffect(() => {
    setInternalSortBy(currentSortBy)
  }, [currentSortBy])

  useEffect(() => {
    setInternalFilterType(currentFilterType)
  }, [currentFilterType])

  // Обработчики для обновления стейта и вызова колбэков
  const handleSort = (sortBy: string) => {
    setInternalSortBy(sortBy)
    onSort(sortBy)
  }

  const handleFilter = (filterType: string) => {
    setInternalFilterType(filterType)
    onFilter(filterType)
  }

  const handleGroupBy = (groupBy: string) => {
    setInternalGroupBy(groupBy)
    onGroupBy(groupBy)
  }

  const { openModal } = useModal()

  const handleImportFile = () => {
    console.log("Импорт файла")
    // Показываем диалог выбора файлов
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = "video/*,audio/*,image/*"

    input.onchange = () => {
      console.log("Файлы выбраны, закрываем диалог")
      // Тут просто закрываем диалог, не обрабатываем файлы
    }

    input.click()
  }

  const handleImportFolder = () => {
    console.log("Импорт папки")
    // Показываем диалог выбора папки
    const input = document.createElement("input")
    input.type = "file"
    // Используем setAttribute для webkitdirectory, так как это нестандартный атрибут
    input.setAttribute("webkitdirectory", "")
    input.setAttribute("directory", "")

    input.onchange = () => {
      console.log("Папка выбрана, закрываем диалог")
      // Тут просто закрываем диалог, не обрабатываем файлы
    }

    input.click()
  }

  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex w-[calc(100%-100px)] items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex cursor-pointer items-center gap-1 bg-[#dddbdd] px-1 text-xs hover:bg-[#d1d1d1] dark:bg-[#45444b] dark:hover:bg-[#dddbdd]/25"
          onClick={handleImportFile}
        >
          <span className="px-2 text-xs">{t("common.import")}</span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer rounded-sm p-1 hover:bg-[#efefef] dark:hover:bg-[#dddbdd]/25"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleImportFile()
                  }}
                >
                  <File size={12} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("browser.media.uploadMedia")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer rounded-sm p-1 hover:bg-[#efefef] dark:hover:bg-[#dddbdd]/25"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleImportFolder()
                  }}
                >
                  <Folder size={12} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("browser.media.addFolder")}</TooltipContent>
            </Tooltip>
          </div>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex cursor-pointer items-center gap-1 bg-[#dddbdd] px-1 text-xs hover:bg-[#d1d1d1] dark:bg-[#45444b] dark:hover:bg-[#dddbdd]/25"
          onClick={(e) => {
            e.stopPropagation()
            openModal("camera-capture")
          }}
        >
          <span className="px-2 text-xs">{t("common.record")}</span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer rounded-sm p-1 hover:bg-[#efefef] dark:hover:bg-[#dddbdd]/25"
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal("camera-capture")
                  }}
                >
                  <Webcam size={12} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("browser.media.recordVideo")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer rounded-sm p-1 hover:bg-[#efefef] dark:hover:bg-[#dddbdd]/25"
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal("voice-recording")
                  }}
                >
                  <Mic size={12} className="" />
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("browser.media.recordVoice")}</TooltipContent>
            </Tooltip>
          </div>
        </Button>

        <Input
          type="search"
          placeholder={t("common.search")}
          className="mr-5 h-7 w-full max-w-[400px] rounded-sm border border-gray-300 text-xs outline-none focus:border-gray-400 focus:ring-0 focus-visible:ring-0 dark:border-gray-600 dark:focus:border-gray-500"
          style={{
            backgroundColor: "transparent",
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        {/* Кнопки переключения режимов просмотра */}
        <TooltipProvider>
          <div className="mr-2 flex overflow-hidden rounded-md">
            {/* Кнопка избранного */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-0 ml-1 h-6 w-6 cursor-pointer",
                    showFavoritesOnly ? "bg-[#dddbdd] dark:bg-[#45444b]" : "",
                  )}
                  onClick={onToggleFavorites}
                >
                  <Star
                    size={16}
                    className={showFavoritesOnly ? "fill-current" : ""}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("browser.media.favorites")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-0 ml-2 h-6 w-6 cursor-pointer",
                    viewMode === "grid" ? "bg-[#dddbdd] dark:bg-[#45444b]" : "",
                  )}
                  onClick={() => onViewModeChange("grid")}
                >
                  <Grid size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.grid")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-0 h-6 w-6 cursor-pointer",
                    viewMode === "thumbnails"
                      ? "bg-[#dddbdd] dark:bg-[#45444b]"
                      : "",
                  )}
                  onClick={() => onViewModeChange("thumbnails")}
                >
                  <LayoutDashboard size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.thumbnails")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-1 h-6 w-6 cursor-pointer",
                    viewMode === "list" ? "bg-[#dddbdd] dark:bg-[#45444b]" : "",
                  )}
                  onClick={() => onViewModeChange("list")}
                >
                  <LayoutList size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.list")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Кнопки изменения размера
        TODO: Добавить анимацию при наведении
        */}
        <TooltipProvider>
          <div className="mr-2 flex overflow-hidden rounded-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-1 h-6 w-6 cursor-pointer",
                    !canDecreaseSize && "cursor-not-allowed opacity-50",
                  )}
                  onClick={onDecreaseSize}
                  disabled={!canDecreaseSize}
                >
                  <ZoomOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.zoomOut")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-1 h-6 w-6 cursor-pointer",
                    !canIncreaseSize && "cursor-not-allowed opacity-50",
                  )}
                  onClick={onIncreaseSize}
                  disabled={!canIncreaseSize}
                >
                  <ZoomIn size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.zoomIn")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Sort Dropdown */}
        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 cursor-pointer",
                      internalSortBy !== "name"
                        ? "bg-[#dddbdd] dark:bg-[#45444b]"
                        : "",
                    )}
                  >
                    <SortDesc size={16} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.sort")}</TooltipContent>
              <DropdownMenuContent className="space-y-1" align="end">
                <DropdownMenuItem
                  className="h-6 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    {internalSortBy === "name" && <Check className="h-4 w-4" />}
                    <span>{t("browser.toolbar.sortBy.name")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="h-6 cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-2">
                    {internalSortBy === "date" && <Check className="h-4 w-4" />}
                    <span>{t("browser.toolbar.sortBy.date")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="h-6 cursor-pointer"
                  onClick={() => handleSort("size")}
                >
                  <div className="flex items-center gap-2">
                    {internalSortBy === "size" && <Check className="h-4 w-4" />}
                    <span>{t("browser.toolbar.sortBy.size")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="h-6 cursor-pointer"
                  onClick={() => handleSort("duration")}
                >
                  <div className="flex items-center gap-2">
                    {internalSortBy === "duration" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.sortBy.duration")}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </TooltipProvider>

        {/* Filter Dropdown */}
        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 cursor-pointer",
                      internalFilterType !== "all"
                        ? "bg-[#dddbdd] dark:bg-[#45444b]"
                        : "",
                    )}
                  >
                    <Filter size={16} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.filter")}</TooltipContent>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilter("all")}>
                  <div className="flex items-center gap-2">
                    {internalFilterType === "all" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.filterBy.all")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilter("video")}>
                  <div className="flex items-center gap-2">
                    {internalFilterType === "video" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.filterBy.video")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilter("audio")}>
                  <div className="flex items-center gap-2">
                    {internalFilterType === "audio" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.filterBy.audio")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilter("image")}>
                  <div className="flex items-center gap-2">
                    {internalFilterType === "image" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.filterBy.image")}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </TooltipProvider>

        {/* Group Dropdown */}
        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 cursor-pointer",
                      internalGroupBy !== "none"
                        ? "bg-[#dddbdd] dark:bg-[#45444b]"
                        : "",
                    )}
                  >
                    <ListFilterPlus size={16} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("browser.toolbar.group")}</TooltipContent>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleGroupBy("none")}>
                  <div className="flex items-center gap-2">
                    {internalGroupBy === "none" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.groupBy.none")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleGroupBy("type")}>
                  <div className="flex items-center gap-2">
                    {internalGroupBy === "type" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.groupBy.type")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGroupBy("date")}>
                  <div className="flex items-center gap-2">
                    {internalGroupBy === "date" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.groupBy.date")}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGroupBy("duration")}>
                  <div className="flex items-center gap-2">
                    {internalGroupBy === "duration" && (
                      <Check className="h-4 w-4" />
                    )}
                    <span>{t("browser.toolbar.groupBy.duration")}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </TooltipProvider>

        {/* Кнопка изменения порядка сортировки */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer"
                onClick={onChangeOrder}
              >
                {sortOrder === "asc" ? (
                  <ArrowDownUp size={16} />
                ) : (
                  <ArrowUpDown size={16} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {sortOrder === "asc"
                ? t("browser.toolbar.sortOrder.desc")
                : t("browser.toolbar.sortOrder.asc")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from "react"

import { Star, ZoomIn, ZoomOut } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMedia } from "@/features/browser/media"
import { useResources } from "@/features/browser/resources"
import { cn } from "@/lib/utils"
import { FilterResource } from "@/types/resources"

import { VideoFilter, filters } from "./filters"
import { AddMediaButton } from "../../layout/add-media-button"
import { FavoriteButton } from "../../layout/favorite-button"
import { usePreviewSize } from "../media"

interface FilterPreviewProps {
  filter: VideoFilter
  onClick: () => void
  size: number
}

const FilterPreview = ({ filter, onClick, size }: FilterPreviewProps) => {
  const { t } = useTranslation()
  const { addFilter, isFilterAdded, removeResource, filterResources } =
    useResources()
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  // Проверяем, добавлен ли фильтр уже в хранилище
  const isAdded = isFilterAdded(filter)

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, gamma, temperature, tint } =
      filter.params
    const filters = []

    if (brightness !== undefined) filters.push(`brightness(${1 + brightness})`)
    if (contrast !== undefined) filters.push(`contrast(${contrast})`)
    if (saturation !== undefined) filters.push(`saturate(${saturation})`)
    if (gamma !== undefined) filters.push(`gamma(${gamma})`)
    if (temperature !== undefined) filters.push(`sepia(${temperature}%)`)
    if (tint !== undefined) filters.push(`hue-rotate(${tint}deg)`)

    return filters.join(" ")
  }

  useEffect(() => {
    if (!videoRef.current) return
    const videoElement = videoRef.current

    const applyFilter = () => {
      videoElement.currentTime = 0
      videoElement.style.filter = getFilterStyle()
      void videoElement.play()

      timeoutRef.current = setTimeout(() => {
        if (isHovering) {
          applyFilter()
        }
      }, 2000)
    }

    if (isHovering) {
      applyFilter()
    } else {
      videoElement.pause()
      videoElement.currentTime = 0
      videoElement.style.filter = ""
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isHovering, filter])

  return (
    <div className="flex flex-col items-center">
      <div
        className="group relative cursor-pointer rounded-xs bg-black"
        style={{ width: `${size}px`, height: `${size}px` }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onClick}
      >
        <video
          ref={videoRef}
          src="/t1.mp4"
          className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-xs object-cover"
          muted
          playsInline
          preload="auto"
        />

        {/* Кнопка избранного */}
        <FavoriteButton
          file={{ id: filter.id, path: "", name: filter.name }}
          size={size}
          type="filter"
        />

        <div
          className={`${isAdded ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`}
        >
          <AddMediaButton
            file={{ id: filter.id, path: "", name: filter.name }}
            onAddMedia={(e) => {
              e.stopPropagation()
              addFilter(filter)
            }}
            onRemoveMedia={(e) => {
              e.stopPropagation()
              // Находим ресурс с этим фильтром и удаляем его
              const resource = filterResources.find(
                (res: FilterResource) => res.resourceId === filter.id,
              )
              if (resource) {
                removeResource(resource.id)
              } else {
                console.warn(
                  `Не удалось найти ресурс фильтра с ID ${filter.id} для удаления`,
                )
              }
            }}
            isAdded={isAdded}
            size={size}
          />
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-300">
        {t(`filters.presets.${filter.id}`)}
      </div>
    </div>
  )
}

export function FilterList() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [, setActiveFilter] = useState<VideoFilter | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const media = useMedia()

  const {
    previewSize,
    isSizeLoaded,
    handleIncreaseSize,
    handleDecreaseSize,
    canIncreaseSize,
    canDecreaseSize,
  } = usePreviewSize("TRANSITIONS")

  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev)
  }, [])

  const filteredFilters = filters.filter((filter) => {
    // Фильтрация по поисковому запросу
    const searchLower = searchQuery.toLowerCase()
    const localizedName = t(`filters.presets.${filter.id}`).toLowerCase()
    const matchesSearch =
      localizedName.includes(searchLower) ||
      filter.name.toLowerCase().includes(searchLower)

    // Фильтрация по избранному
    const matchesFavorites =
      !showFavoritesOnly ||
      media.isItemFavorite(
        { id: filter.id, path: "", name: filter.name },
        "filter",
      )

    return matchesSearch && matchesFavorites
  })

  const handleFilterClick = (filter: VideoFilter) => {
    setActiveFilter(filter)
    console.log("Applying filter:", filter.name, filter.params)
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between p-1">
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
        <div className="flex items-center gap-1">
          {/* Кнопки изменения размера */}
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
                    onClick={handleToggleFavorites}
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
                      "mr-1 ml-2 h-6 w-6 cursor-pointer",
                      !canDecreaseSize && "cursor-not-allowed opacity-50",
                    )}
                    onClick={handleDecreaseSize}
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
                    onClick={handleIncreaseSize}
                    disabled={!canIncreaseSize}
                  >
                    <ZoomIn size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("browser.toolbar.zoomIn")}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="scrollbar-hide hover:scrollbar-default min-h-0 flex-1 overflow-y-auto p-1 py-3 dark:bg-[#1b1a1f]">
        {!isSizeLoaded ? (
          <div className="flex h-full items-center justify-center text-gray-500" />
        ) : filteredFilters.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            {t("browser.tabs.filters")} {t("common.notFound")}
          </div>
        ) : (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(0,calc(var(--preview-size)+12px)))] gap-2"
            style={
              { "--preview-size": `${previewSize}px` } as React.CSSProperties
            }
          >
            {filteredFilters.map((filter) => (
              <FilterPreview
                key={filter.id}
                filter={filter}
                onClick={() => handleFilterClick(filter)}
                size={previewSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

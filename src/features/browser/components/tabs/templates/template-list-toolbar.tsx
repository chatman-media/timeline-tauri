import type { ChangeEvent } from "react"

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
import { cn } from "@/lib/utils"

interface TemplateListToolbarProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  canDecreaseSize: boolean
  canIncreaseSize: boolean
  handleDecreaseSize: () => void
  handleIncreaseSize: () => void
  showFavoritesOnly?: boolean
  onToggleFavorites?: () => void
}

export function TemplateListToolbar({
  searchQuery,
  setSearchQuery,
  canDecreaseSize,
  canIncreaseSize,
  handleDecreaseSize,
  handleIncreaseSize,
  showFavoritesOnly = false,
  onToggleFavorites = () => {},
}: TemplateListToolbarProps) {
  const { t } = useTranslation()

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="flex items-center justify-between p-1">
      <Input
        type="search"
        placeholder={t("browser.toolbar.searchByName")}
        className="mr-5 h-7 w-full max-w-[400px] rounded-sm border border-gray-300 bg-transparent text-xs outline-none focus:border-gray-400 focus:ring-0 focus-visible:ring-0 dark:border-gray-600 dark:focus:border-gray-500"
        value={searchQuery}
        onChange={onSearchChange}
      />
      <div className="flex items-center gap-1">
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
  )
}

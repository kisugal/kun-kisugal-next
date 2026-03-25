import { Tooltip } from '@heroui/tooltip'
import { Download, Eye, Heart, MessageSquare, Puzzle } from 'lucide-react'
import { cn } from '~/utils/cn'
import { formatNumber } from '~/utils/formatNumber'

interface Props {
  patch: GalgameCard
  disableTooltip?: boolean
  className?: string
  isMobile?: boolean
}

export const KunCardStats = ({
  patch,
  disableTooltip = true,
  isMobile = false,
  className
}: Props) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-x-2 text-[13px] text-default-500 sm:gap-x-3 sm:text-sm',
        isMobile ? 'sm:justify-start' : '',
        className
      )}
    >
      <Tooltip isDisabled={disableTooltip} content="浏览数" placement="bottom">
        <div className="flex shrink-0 items-center gap-0.5 whitespace-nowrap sm:gap-1">
          <Eye className="size-3.5 sm:size-4" />
          <span className="tabular-nums">{formatNumber(patch.view)}</span>
        </div>
      </Tooltip>

      <Tooltip isDisabled={disableTooltip} content="下载数" placement="bottom">
        <div className="flex shrink-0 items-center gap-0.5 whitespace-nowrap sm:gap-1">
          <Download className="size-3.5 sm:size-4" />
          <span className="tabular-nums">{formatNumber(patch.download)}</span>
        </div>
      </Tooltip>

      <Tooltip isDisabled={disableTooltip} content="收藏数" placement="bottom">
        <div className="flex shrink-0 items-center gap-0.5 whitespace-nowrap sm:gap-1">
          <Heart className="size-3.5 sm:size-4" />
          <span className="tabular-nums">
            {formatNumber(patch._count.favorite_folder || 0)}
          </span>
        </div>
      </Tooltip>

      {!isMobile && (
        <Tooltip
          isDisabled={disableTooltip}
          content="下载资源数"
          placement="bottom"
        >
          <div className="flex shrink-0 items-center gap-0.5 whitespace-nowrap sm:gap-1">
            <Puzzle className="size-3.5 sm:size-4" />
            <span className="tabular-nums">
              {formatNumber(patch._count.resource || 0)}
            </span>
          </div>
        </Tooltip>
      )}

      <Tooltip isDisabled={disableTooltip} content="评论数" placement="bottom">
        <div
          className={cn(
            'flex shrink-0 items-center gap-0.5 whitespace-nowrap sm:gap-1',
            isMobile && 'sm:flex hidden'
          )}
        >
          <MessageSquare className="size-3.5 sm:size-4" />
          <span className="tabular-nums">
            {formatNumber(patch._count.comment || 0)}
          </span>
        </div>
      </Tooltip>
    </div>
  )
}

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import { Ban, CircleSlash, ShieldCheck } from 'lucide-react'
import { useSettingStore } from '~/store/settingStore'
import type { Selection } from '@heroui/react'

const nsfwToneMap: Record<
  string,
  {
    label: string
    buttonClassName: string
    iconClassName: string
    textClassName: string
  }
> = {
  sfw: {
    label: '全年龄',
    buttonClassName:
      'text-success-600 hover:text-success-700 data-[hover=true]:bg-success-50 dark:data-[hover=true]:bg-success-950/30',
    iconClassName: 'size-5 text-success-600',
    textClassName: 'font-semibold tracking-wide text-success-600'
  },
  nsfw: {
    label: '仅 R18',
    buttonClassName:
      'text-danger-600 hover:text-danger-700 data-[hover=true]:bg-danger-50 dark:data-[hover=true]:bg-danger-950/30',
    iconClassName: 'size-5 text-danger-600',
    textClassName: 'font-semibold tracking-wide text-danger-600'
  },
  all: {
    label: 'ALL',
    buttonClassName:
      'text-warning-600 hover:text-warning-700 data-[hover=true]:bg-warning-50 dark:data-[hover=true]:bg-warning-950/30',
    iconClassName: 'size-5 text-warning-600',
    textClassName: 'font-semibold tracking-wide text-warning-600'
  }
}

const renderModeIcon = (mode: string, className: string) => {
  if (mode === 'sfw') {
    return <ShieldCheck className={className} />
  }
  if (mode === 'nsfw') {
    return <Ban className={className} />
  }

  return <CircleSlash className={className} />
}

const nsfwTooltipMap: Record<string, string> = {
  sfw: '网站内容显示：仅显示 SFW',
  nsfw: '网站内容显示：仅显示 NSFW',
  all: '网站内容显示：显示全部内容'
}

export const NSFWSwitcher = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const settings = useSettingStore((state) => state.data)
  const setData = useSettingStore((state) => state.setData)

  const currentMode = settings.kunNsfwEnable || 'sfw'
  const currentTone = nsfwToneMap[currentMode] || nsfwToneMap.all
  const tooltipLabel = nsfwTooltipMap[currentMode] || nsfwTooltipMap.all

  const handleSelectionChange = (value: Selection) => {
    if (value === 'all') {
      return
    }

    const nextValue = Array.from(value)[0]?.toString() ?? 'sfw'
    if (nextValue === currentMode) {
      return
    }

    setData({ ...settings, kunNsfwEnable: nextValue })

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Dropdown placement="bottom-end" className="min-w-[260px]">
      <Tooltip disableAnimation showArrow closeDelay={0} content={tooltipLabel}>
        <div className="flex">
          <DropdownTrigger>
            <Button
              variant="light"
              aria-label="网站内容显示"
              isLoading={isPending}
              className={`h-10 w-10 min-w-0 px-0 lg:w-auto lg:px-3 ${currentTone.buttonClassName}`}
            >
              {renderModeIcon(currentMode, currentTone.iconClassName)}
              <span
                className={`hidden text-sm lg:inline ${currentTone.textClassName}`}
              >
                {currentTone.label}
              </span>
            </Button>
          </DropdownTrigger>
        </div>
      </Tooltip>

      <DropdownMenu
        disallowEmptySelection
        selectedKeys={new Set([currentMode])}
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
      >
        <DropdownItem
          startContent={renderModeIcon('sfw', nsfwToneMap.sfw.iconClassName)}
          textValue="sfw"
          key="sfw"
          className="text-success-700"
        >
          仅显示 SFW (内容安全) 的文章
        </DropdownItem>
        <DropdownItem
          startContent={renderModeIcon('nsfw', nsfwToneMap.nsfw.iconClassName)}
          textValue="nsfw"
          key="nsfw"
          className="text-danger-700"
        >
          仅显示 NSFW (可能含有 R18) 的文章
        </DropdownItem>
        <DropdownItem
          startContent={renderModeIcon('all', nsfwToneMap.all.iconClassName)}
          textValue="all"
          key="all"
          className="text-warning-700"
        >
          同时显示 SFW 和 NSFW 的文章
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

'use client'

import { useTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/button'
import { Ban, CircleSlash, ShieldCheck } from 'lucide-react'
import { useSettingStore } from '~/store/settingStore'

enum NSFWMode {
  sfw = 'sfw',
  nsfw = 'nsfw',
  all = 'all'
}

enum NSFWLabel {
  sfw = '全年龄',
  nsfw = '仅 R18',
  all = '全部'
}

const renderModeIcon = (mode: NSFWMode) => {
  if (mode === NSFWMode.sfw) {
    return <ShieldCheck className="size-5" />
  }
  if (mode === NSFWMode.nsfw) {
    return <Ban className="size-5" />
  }
  return <CircleSlash className="size-5" />
}

export const NSFWSwitcher = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const settings = useSettingStore((state) => state.data)
  const setData = useSettingStore((state) => state.setData)

  const [currentMode, setCurrentMode] = useState<NSFWMode>(NSFWMode.sfw)

  useEffect(() => {
    if (settings?.kunNsfwEnable) {
      setCurrentMode(settings.kunNsfwEnable as NSFWMode)
    }
  }, [settings])

  const handleChange = (value: NSFWMode) => {
    if (value === currentMode) return

    setCurrentMode(value)
    setData({ ...settings, kunNsfwEnable: value })

    startTransition(() => {
      router.refresh()
    })
  }

  const renderItem = (value: NSFWMode) => (
    <div className="justify-center">
      <div className="flex justify-center">
        <Button
          className="w-15 h-15"
          variant={currentMode === value ? 'solid' : 'light'}
          isLoading={isPending && currentMode === value}
          startContent={renderModeIcon(value)}
          onPress={() => handleChange(value)}
          isIconOnly
        />
      </div>
      <p className="text-sm text-center mt-2">{NSFWLabel[value]}</p>
    </div>
  )

  return (
    <div className="flex gap-2">
      {renderItem(NSFWMode.sfw)}
      {renderItem(NSFWMode.nsfw)}
      {renderItem(NSFWMode.all)}
    </div>
  )
}

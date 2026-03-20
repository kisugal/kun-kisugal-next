'use client'

import { useMemo, useState } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { useRouter } from '@bprogress/next'
import {
  GAME_DETAIL_DEMO_VARIANT_LABEL,
  GAME_DETAIL_PRIMARY_DEMO_VARIANT
} from './types'

export const GameDetailDemoJumpForm = () => {
  const router = useRouter()
  const [uniqueId, setUniqueId] = useState('')

  const normalizedId = useMemo(() => uniqueId.trim(), [uniqueId])

  const openSteamPreview = () => {
    if (!normalizedId) {
      return
    }

    router.push(
      `/design/game-detail/${normalizedId}/${GAME_DETAIL_PRIMARY_DEMO_VARIANT}`
    )
  }

  return (
    <div className="rounded-3xl border border-default-200 bg-content1/90 p-5 shadow-sm backdrop-blur">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">输入游戏 Unique ID</h2>
        <p className="text-sm text-default-500">
          使用已有游戏的 8 位 `uniqueId`，直接打开当前正在打磨的 Steam 方案。
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
        <Input
          value={uniqueId}
          onValueChange={setUniqueId}
          label="Unique ID"
          labelPlacement="outside"
          placeholder="例如 abc123ef"
          className="lg:max-w-sm"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              openSteamPreview()
            }
          }}
        />

        <Button
          color="primary"
          variant="solid"
          onPress={openSteamPreview}
          isDisabled={normalizedId.length !== 8}
        >
          打开 {GAME_DETAIL_DEMO_VARIANT_LABEL.steam}
        </Button>
      </div>
    </div>
  )
}

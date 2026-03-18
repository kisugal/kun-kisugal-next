'use client'

import { useEffect } from 'react'
import { kunUpdatePatchViewsActions } from '~/app/(main)/[id]/actions'
import { useRewritePatchStore } from '~/store/rewriteStore'
import type { PatchDetailData } from './types'

interface Props {
  data: PatchDetailData
}

export const PatchDetailClientEffects = ({ data }: Props) => {
  const setData = useRewritePatchStore((state) => state.setData)
  const isBlockedByNsfw = data.patch.contentLimit === 'nsfw' && !data.uid

  useEffect(() => {
    if (isBlockedByNsfw) {
      return
    }

    setData({
      id: data.patch.id,
      uniqueId: data.patch.uniqueId,
      vndbId: data.patch.vndbId ?? '',
      name: data.patch.name,
      introduction: data.patch.introduction,
      alias: data.patch.alias,
      tag: data.patch.tags,
      contentLimit: data.patch.contentLimit,
      released: data.intro.released
    })
  }, [
    data.intro.released,
    data.patch.alias,
    data.patch.contentLimit,
    data.patch.id,
    data.patch.introduction,
    data.patch.name,
    data.patch.tags,
    data.patch.uniqueId,
    data.patch.vndbId,
    isBlockedByNsfw,
    setData
  ])

  useEffect(() => {
    if (isBlockedByNsfw) {
      return
    }

    const timer = window.setTimeout(() => {
      void kunUpdatePatchViewsActions({ uniqueId: data.patch.uniqueId })
    }, 1200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [data.patch.uniqueId, isBlockedByNsfw])

  return null
}

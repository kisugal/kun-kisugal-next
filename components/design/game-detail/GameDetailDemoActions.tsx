'use client'

import { PatchHeaderActions } from '~/components/patch/header/Actions'
import type { Patch } from '~/types/api/patch'

interface Props {
  patch: Patch
  onDownload?: () => void
}

export const GameDetailDemoActions = ({ patch, onDownload }: Props) => {
  const handleClickDownloadNav = () => {
    if (onDownload) {
      onDownload()
      return
    }

    document
      .getElementById('demo-resources')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PatchHeaderActions
      patch={patch}
      handleClickDownloadNav={handleClickDownloadNav}
    />
  )
}

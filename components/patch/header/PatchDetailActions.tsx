'use client'

import { PatchHeaderActions } from '~/components/patch/header/Actions'
import type { Patch } from '~/types/api/patch'
import { PATCH_DETAIL_TAB_CHANGE_EVENT } from './events'

interface Props {
  patch: Patch
}

export const PatchDetailActions = ({ patch }: Props) => {
  const handleClickDownloadNav = () => {
    const nextUrl = new URL(window.location.href)
    nextUrl.hash = 'resources'
    window.history.replaceState(null, '', nextUrl)

    window.dispatchEvent(
      new CustomEvent(PATCH_DETAIL_TAB_CHANGE_EVENT, {
        detail: {
          tab: 'resources'
        }
      })
    )

    document.getElementById('patch-detail-tabs')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <PatchHeaderActions
      patch={patch}
      handleClickDownloadNav={handleClickDownloadNav}
    />
  )
}

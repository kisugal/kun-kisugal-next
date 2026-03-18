import type { PatchDetailTabKey } from './types'

export const PATCH_DETAIL_TAB_CHANGE_EVENT = 'patch-detail:tab-change'

export interface PatchDetailTabChangeDetail {
  tab: PatchDetailTabKey
}

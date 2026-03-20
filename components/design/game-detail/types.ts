import type { Patch, PatchIntroduction } from '~/types/api/patch'

export const GAME_DETAIL_DEMO_VARIANTS = [
  'steam',
  'dlsite',
  'library',
  'modern'
] as const

export type GameDetailDemoVariant =
  (typeof GAME_DETAIL_DEMO_VARIANTS)[number]

export const GAME_DETAIL_PRIMARY_DEMO_VARIANT = 'steam' as const
export const GAME_DETAIL_PUBLIC_DEMO_VARIANTS = [
  GAME_DETAIL_PRIMARY_DEMO_VARIANT
] as const

export const GAME_DETAIL_DEMO_VARIANT_LABEL: Record<
  GameDetailDemoVariant,
  string
> = {
  steam: 'Steam 风格',
  dlsite: 'DLsite 风格',
  library: '游戏库风格',
  modern: '现代专题风格'
}

export interface GameDetailDemoScreenshot {
  src: string
  alt: string
}

export interface GameDetailDemoLink {
  label: string
  href: string
}

export interface GameDetailDemoData {
  patch: Patch
  intro: PatchIntroduction
  dlsiteId: string | null
  bodyHtml: string
  fullHtml: string
  screenshots: GameDetailDemoScreenshot[]
  relatedLinks: GameDetailDemoLink[]
  uid?: number
}

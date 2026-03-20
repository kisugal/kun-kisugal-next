import { Prisma } from '@prisma/client'
export type PatchUniqueField = 'unique_id'

export const normalizePatchExternalId = (value?: string | null) => {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export const getPatchDuplicateErrorMessage = (
  field: PatchUniqueField,
  uniqueId?: string
) => {
  return uniqueId
    ? `Galgame 唯一标识与游戏 ID 为 ${uniqueId} 的游戏重复`
    : '游戏唯一标识重复'
}

export const getPatchUniqueConstraintErrorMessage = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code !== 'P2002') {
    return null
  }

  const rawTarget = error.meta?.target
  const targets = Array.isArray(rawTarget)
    ? rawTarget.map((target) => String(target))
    : typeof rawTarget === 'string'
      ? [rawTarget]
      : []

  if (targets.includes('unique_id')) {
    return getPatchDuplicateErrorMessage('unique_id')
  }

  return '游戏唯一标识重复'
}

export const isPatchDuplicateErrorMessage = (message: string) =>
  message.includes('唯一标识')

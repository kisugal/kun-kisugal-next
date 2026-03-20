import { Prisma } from '@prisma/client'
import { prisma } from '~/prisma'

export type PatchUniqueField = 'vndb_id' | 'dlsite_id'

export interface PatchDuplicateSummary {
  hasBanner: boolean
  aliasCount: number
  tagCount: number
  companyCount: number
  resourceCount: number
  commentCount: number
  favoriteCount: number
}

export interface PatchDuplicateInfo {
  field: PatchUniqueField
  patch: {
    id: number
    uniqueId: string
    name: string
    created: string
    updated: string
  }
  summary: PatchDuplicateSummary
  canOverwrite: boolean
  overwriteReason?: string
}

export interface PatchDuplicateConflict {
  error: string
  duplicate: PatchDuplicateInfo
}

const buildPatchDuplicateWhere = (field: PatchUniqueField, value: string) => {
  return field === 'vndb_id' ? { vndb_id: value } : { dlsite_id: value }
}

export const normalizePatchExternalId = (value?: string | null) => {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export const getPatchDuplicateErrorMessage = (
  field: PatchUniqueField,
  uniqueId?: string
) => {
  if (field === 'vndb_id') {
    return uniqueId
      ? `Galgame VNDB ID 与游戏 ID 为 ${uniqueId} 的游戏重复`
      : 'Galgame VNDB ID 重复'
  }

  return uniqueId
    ? `Galgame DLsite ID 与游戏 ID 为 ${uniqueId} 的游戏重复`
    : 'Galgame DLsite ID 重复'
}

export const findPatchDuplicateConflict = async (
  field: PatchUniqueField,
  value: string
): Promise<PatchDuplicateConflict | null> => {
  const patch = await prisma.patch.findUnique({
    where: buildPatchDuplicateWhere(field, value),
    select: {
      id: true,
      unique_id: true,
      name: true,
      banner: true,
      created: true,
      updated: true,
      _count: {
        select: {
          alias: true,
          tag: true,
          company: true,
          resource: true,
          comment: true,
          favorite_folder: true
        }
      }
    }
  })

  if (!patch) {
    return null
  }

  const summary: PatchDuplicateSummary = {
    hasBanner: patch.banner.trim().length > 0,
    aliasCount: patch._count.alias,
    tagCount: patch._count.tag,
    companyCount: patch._count.company,
    resourceCount: patch._count.resource,
    commentCount: patch._count.comment,
    favoriteCount: patch._count.favorite_folder
  }

  const hasStructuredData =
    summary.aliasCount > 0 || summary.tagCount > 0 || summary.companyCount > 0
  const hasCommunityData =
    summary.resourceCount > 0 ||
    summary.commentCount > 0 ||
    summary.favoriteCount > 0
  const canOverwrite =
    !summary.hasBanner && !hasStructuredData && !hasCommunityData

  return {
    error: getPatchDuplicateErrorMessage(field, patch.unique_id),
    duplicate: {
      field,
      patch: {
        id: patch.id,
        uniqueId: patch.unique_id,
        name: patch.name,
        created: String(patch.created),
        updated: String(patch.updated)
      },
      summary,
      canOverwrite,
      overwriteReason: canOverwrite
        ? '这条记录缺少封面，且没有别名、标签、会社、资源、评论或收藏，看起来像一次失败创建留下的残留记录。'
        : undefined
    }
  }
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

  if (targets.includes('vndb_id')) {
    return getPatchDuplicateErrorMessage('vndb_id')
  }

  if (targets.includes('dlsite_id')) {
    return getPatchDuplicateErrorMessage('dlsite_id')
  }

  return '游戏唯一标识重复'
}

export const isPatchDuplicateErrorMessage = (message: string) =>
  message.includes('VNDB ID') || message.includes('DLsite ID')

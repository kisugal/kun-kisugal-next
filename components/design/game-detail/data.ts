import { cache } from 'react'
import { prisma } from '~/prisma/index'
import { getPatchById } from '~/app/api/patch/get'
import { getPatchIntroduction } from '~/app/api/patch/introduction/route'
import { markdownToHtmlExtend } from '~/app/api/utils/render/markdownToHtmlExtend'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { kunGetActions as getGalgameList } from '~/app/(main)/galgame/actions'
import type {
  GameDetailDemoData,
  GameDetailDemoLink,
  GameDetailDemoScreenshot
} from './types'

const normalizeMarkdown = (markdown: string) => markdown.replace(/\r\n/g, '\n')

const escapeForRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const extractSectionBlock = (markdown: string, heading: string) => {
  const pattern = new RegExp(
    `(^|\\n)##\\s*${escapeForRegex(heading)}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
    'm'
  )

  const match = markdown.match(pattern)
  if (!match) {
    return null
  }

  return {
    block: match[0],
    content: match[2].trim()
  }
}

const parseMarkdownImages = (
  section: string
): GameDetailDemoScreenshot[] => {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (!line.startsWith('![')) {
        return null
      }

      const altEndIndex = line.indexOf('](')
      const urlEndIndex = line.lastIndexOf(')')
      if (altEndIndex < 0 || urlEndIndex < 0) {
        return null
      }

      const alt = line.slice(2, altEndIndex).trim() || '游戏截图'
      const rawUrl = line.slice(altEndIndex + 2, urlEndIndex).trim()
      if (!rawUrl) {
        return null
      }

      const url = rawUrl.split(/\s+"/)[0].trim()
      if (!url) {
        return null
      }

      return {
        src: url,
        alt
      }
    })
    .filter((item): item is GameDetailDemoScreenshot => Boolean(item))
}

const parseKunLinks = (section: string): GameDetailDemoLink[] => {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/::kun-link\{text="([^"]+)" href="([^"]+)"\}/)
      if (!match) {
        return null
      }

      return {
        label: match[1].trim(),
        href: match[2].trim()
      }
    })
    .filter((item): item is GameDetailDemoLink => Boolean(item))
}

const cleanupBodyMarkdown = (markdown: string) =>
  markdown.replace(/\n{3,}/g, '\n\n').trim()

const parseStructuredContent = (markdown: string) => {
  let nextBody = normalizeMarkdown(markdown)

  const screenshotSection = extractSectionBlock(nextBody, '游戏截图')
  const screenshots = screenshotSection
    ? parseMarkdownImages(screenshotSection.content)
    : []
  if (screenshotSection && screenshots.length > 0) {
    nextBody = nextBody.replace(screenshotSection.block, '\n')
  }

  const linkSection = extractSectionBlock(nextBody, '相关链接')
  const relatedLinks = linkSection ? parseKunLinks(linkSection.content) : []
  if (linkSection && relatedLinks.length > 0) {
    nextBody = nextBody.replace(linkSection.block, '\n')
  }

  return {
    screenshots,
    relatedLinks,
    bodyMarkdown: cleanupBodyMarkdown(nextBody)
  }
}

const getPatchDemoExtra = cache(async (uniqueId: string) => {
  return prisma.patch.findUnique({
    where: { unique_id: uniqueId },
    select: {
      dlsite_id: true
    }
  })
})

export const getGameDetailDemoData = cache(async (uniqueId: string) => {
  const payload = await verifyHeaderCookie()

  const [patch, intro, extra] = await Promise.all([
    getPatchById({ uniqueId }, payload?.uid ?? 0),
    getPatchIntroduction({ uniqueId }),
    getPatchDemoExtra(uniqueId)
  ])

  if (typeof patch === 'string') {
    return patch
  }

  if (typeof intro === 'string') {
    return intro
  }

  if (!extra) {
    return '未找到对应 Galgame'
  }

  const structured = parseStructuredContent(patch.introduction)
  const shouldUseStructuredBody =
    structured.screenshots.length > 0 || structured.relatedLinks.length > 0

  const bodyHtml = shouldUseStructuredBody
    ? structured.bodyMarkdown
      ? await markdownToHtmlExtend(structured.bodyMarkdown)
      : ''
    : intro.introduction

  const response: GameDetailDemoData = {
    patch,
    intro,
    dlsiteId: extra.dlsite_id,
    bodyHtml,
    fullHtml: intro.introduction,
    screenshots: structured.screenshots,
    relatedLinks: structured.relatedLinks,
    uid: payload?.uid
  }

  return response
})

export const getGameDetailDemoIndexGames = async () => {
  const response = await getGalgameList({
    selectedType: 'all',
    selectedLanguage: 'all',
    selectedPlatform: 'all',
    sortField: 'created',
    sortOrder: 'desc',
    page: 1,
    limit: 8,
    yearString: JSON.stringify(['all']),
    monthString: JSON.stringify(['all'])
  })

  if (typeof response === 'string') {
    return []
  }

  return response.galgames
}

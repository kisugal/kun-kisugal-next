'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Tab, Tabs } from '@heroui/tabs'
import {
  Boxes,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FolderOpenDot,
  Link2,
  MessageSquare,
  Sparkles,
  Tags as TagsIcon
} from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { KunCardStats } from '~/components/kun/CardStats'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { KunNull } from '~/components/kun/Null'
import { Resources } from '~/components/patch/resource/Resource'
import { Comments } from '~/components/patch/comment/Comments'
import { EditBanner } from '~/components/patch/header/EditBanner'
import { GALGAME_AGE_LIMIT_MAP } from '~/constants/galgame'
import { useRewritePatchStore } from '~/store/rewriteStore'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { formatDate } from '~/utils/time'
import { cn } from '~/utils/cn'
import { kunUpdatePatchViewsActions } from '~/app/(main)/[id]/actions'
import { GameDetailDemoActions } from './GameDetailDemoActions'
import { GameDetailDemoHtml } from './GameDetailDemoHtml'
import { type GameDetailDemoData } from './types'
import styles from './game-detail-demo.module.css'

interface Props {
  data: GameDetailDemoData
  showDesignBreadcrumb?: boolean
  isDesignPreview?: boolean
}

type DemoTabKey = 'info' | 'resources' | 'comments'

const getSteamSummary = (data: GameDetailDemoData) => {
  const html = (data.bodyHtml || data.fullHtml || '').trim()
  if (!html) {
    return '当前条目暂无正文简介，已保留完整资料信息和资源评论分区。'
  }

  const plainText = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plainText) {
    return '当前条目暂无正文简介，已保留完整资料信息和资源评论分区。'
  }

  return plainText.slice(0, 160)
}

interface OverviewPreviewImage {
  src: string
  alt: string
}

const parseImagesFromHtml = (html: string): OverviewPreviewImage[] => {
  if (!html) {
    return []
  }

  const images: OverviewPreviewImage[] = []
  const imageRegex =
    /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>|<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>|<img[^>]*src=["']([^"']+)["'][^>]*>/gi

  let match: RegExpExecArray | null = imageRegex.exec(html)
  while (match) {
    const src = (match[1] || match[4] || match[5] || '').trim()
    const alt = (match[2] || match[3] || '').trim()

    if (src) {
      images.push({ src, alt })
    }

    match = imageRegex.exec(html)
  }

  return images
}

const getOverviewPreviewImages = (
  data: GameDetailDemoData
): OverviewPreviewImage[] => {
  const map = new Map<string, OverviewPreviewImage>()
  const push = (image: OverviewPreviewImage) => {
    if (!image.src || map.has(image.src)) {
      return
    }
    map.set(image.src, image)
  }

  parseImagesFromHtml(data.bodyHtml).forEach(push)
  parseImagesFromHtml(data.fullHtml).forEach(push)
  data.screenshots.forEach((item) => push({ src: item.src, alt: item.alt }))

  if (map.size === 0 && data.patch.banner?.trim()) {
    push({ src: data.patch.banner, alt: `${data.patch.name} 封面` })
  }

  return Array.from(map.values())
}

const stripImagesFromOverviewHtml = (html: string) => {
  if (!html) {
    return ''
  }

  return html
    .replace(/<img[^>]*>/gi, '')
    .replace(/<figure[^>]*>\s*<\/figure>/gi, '')
    .replace(/<p>\s*(?:<a[^>]*>\s*<\/a>)?\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
}

const PortraitCover = ({
  banner,
  name,
  patch,
  className
}: {
  banner: string
  name: string
  patch?: GameDetailDemoData['patch']
  className?: string
}) => {
  return (
    <div
      className={cn(
        styles.coverFrame,
        'w-[180px] sm:w-[220px] shrink-0',
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-default-100/50 shadow-md">
        {banner?.trim() ? (
          <img src={banner} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-default-200 text-default-500">
            暂无封面
          </div>
        )}
        {patch && <EditBanner patch={patch} />}
        <div className={styles.coverReflection} />
      </div>
    </div>
  )
}

const SectionCard = ({
  title,
  icon,
  description,
  className,
  bodyClassName,
  children
}: {
  title: string
  icon?: ReactNode
  description?: string
  className?: string
  bodyClassName?: string
  children: ReactNode
}) => {
  return (
    <Card
      className={cn(
        styles.sectionCard,
        'overflow-hidden rounded-large border border-default-100 bg-content1/95 shadow-sm',
        className
      )}
    >
      <CardBody className={cn('gap-4 p-4 sm:gap-5 sm:p-5', bodyClassName)}>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h2>
          </div>
          {description && (
            <p className="text-sm leading-6 text-default-500">{description}</p>
          )}
        </div>
        {children}
      </CardBody>
    </Card>
  )
}

const StatLine = ({
  icon,
  label,
  value
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) => {
  return (
    <div className="min-w-0 rounded-xl border border-default-100 bg-default-50/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-default-500">
        <span className="text-default-400">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="min-w-0 break-words text-sm font-semibold leading-6 text-foreground">
        {value}
      </div>
    </div>
  )
}

const OverviewBlock = ({ data }: { data: GameDetailDemoData }) => {
  const bodyWithoutImages = stripImagesFromOverviewHtml(data.bodyHtml).trim()
  const fullWithoutImages = stripImagesFromOverviewHtml(data.fullHtml).trim()
  const shouldShowBody = Boolean(bodyWithoutImages)
  const extractedEverything =
    !shouldShowBody &&
    (data.screenshots.length > 0 || data.relatedLinks.length > 0)

  if (shouldShowBody) {
    return (
      <GameDetailDemoHtml
        html={bodyWithoutImages}
        className="break-words [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
      />
    )
  }

  if (extractedEverything) {
    return (
      <div className="rounded-xl border border-dashed border-default-200 p-5 text-sm leading-7 text-default-500">
        这条目当前的正文主体已经被拆分到媒体和外部链接区块中了。
      </div>
    )
  }

  return (
    <GameDetailDemoHtml
      html={fullWithoutImages}
      className="break-words [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
    />
  )
}

const SteamOverviewPreview = ({ data }: { data: GameDetailDemoData }) => {
  const images = useMemo(() => getOverviewPreviewImages(data), [data])
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  if (!images.length) {
    return (
      <div className="rounded-xl border border-dashed border-default-200 p-5 text-sm text-default-500">
        当前条目暂无可预览图片。
      </div>
    )
  }

  const safeActiveIndex = Math.min(activeIndex, images.length - 1)
  const activeImage = images[safeActiveIndex]

  const goPrev = () => {
    setActiveIndex((prev) => {
      if (prev <= 0) {
        return images.length - 1
      }
      return prev - 1
    })
  }

  const goNext = () => {
    setActiveIndex((prev) => {
      if (prev >= images.length - 1) {
        return 0
      }
      return prev + 1
    })
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-large border border-default-200 bg-default-100/80">
        <div
          className="aspect-[16/9] cursor-zoom-in overflow-hidden"
          onClick={() => setLightboxIndex(safeActiveIndex)}
        >
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className="h-full w-full object-cover"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="查看上一张"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-black/45 p-1.5 text-white backdrop-blur transition hover:bg-black/60 sm:left-3 sm:p-2"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="查看下一张"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-black/45 p-1.5 text-white backdrop-blur transition hover:bg-black/60 sm:right-3 sm:p-2"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setLightboxIndex(safeActiveIndex)}
          className="absolute bottom-2 right-2 rounded-md border border-white/30 bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/60 sm:bottom-3 sm:right-3 sm:px-2.5"
        >
          放大查看
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-default-600">
          {activeImage.alt || ''}
        </p>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-default-400">
          {safeActiveIndex + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 && (
        <div className="pb-1 sm:overflow-x-auto">
          <div className={cn(styles.anchorNav, 'grid grid-cols-4 gap-2 sm:flex sm:min-w-max')}>
            {images.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-14 w-full overflow-hidden rounded-lg border transition sm:h-16 sm:w-28 sm:shrink-0',
                  index === safeActiveIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-default-200 hover:border-default-300'
                )}
                aria-label={`预览图片 ${index + 1}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Lightbox
        index={lightboxIndex}
        slides={images.map((item) => ({ src: item.src }))}
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        plugins={[Zoom, Download]}
        animation={{ fade: 300 }}
        carousel={{
          finite: true,
          preload: 2
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true
        }}
        controller={{
          closeOnBackdropClick: true
        }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .72)' } }}
      />
    </div>
  )
}

const AliasBlock = ({ data }: { data: GameDetailDemoData }) => {
  if (!data.intro.alias.length) {
    return <p className="text-sm text-default-500">这个游戏暂无别名。</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.intro.alias.map((alias) => (
        <span
          key={alias}
          className="max-w-full rounded-full border border-default-100 bg-default-50/80 px-3 py-1.5 text-sm break-words text-default-700"
        >
          {alias}
        </span>
      ))}
    </div>
  )
}

const RelatedLinksBlock = ({ data }: { data: GameDetailDemoData }) => {
  if (!data.relatedLinks.length) {
    return <p className="text-sm text-default-500">暂无外部链接。</p>
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {data.relatedLinks.map((item) => (
        <div
          key={`${item.label}-${item.href}`}
          className="min-w-0 w-full rounded-large border border-default-100 bg-default-50/70 p-4"
        >
          <div className="mb-2 flex items-center gap-2 text-sm text-default-500">
            <ExternalLink className="size-4" />
            <span className="truncate">{item.label}</span>
          </div>
          <KunExternalLink link={item.href} className="max-w-full break-all text-sm">
            {item.href}
          </KunExternalLink>
        </div>
      ))}
    </div>
  )
}

const TaxonomyBlock = ({ data }: { data: GameDetailDemoData }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-default-600">
          <TagsIcon className="size-4" />
          <span>游戏标签</span>
        </div>
        {data.intro.tag.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.intro.tag.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="inline-flex transition-opacity hover:opacity-80"
              >
                <Chip
                  color="secondary"
                  variant="flat"
                  className="max-w-full break-words"
                >
                  {tag.name}
                  <span className="ml-1 opacity-80">+{tag.count}</span>
                </Chip>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-500">这个游戏暂时没有标签。</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-default-600">
          <Boxes className="size-4" />
          <span>制作会社 / 开发者</span>
        </div>
        {data.patch.companies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.patch.companies.map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.id}`}
                className="inline-flex transition-opacity hover:opacity-80"
              >
                <Chip
                  color="warning"
                  variant="flat"
                  className="max-w-full break-words"
                >
                  {company.name}
                </Chip>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-500">这个游戏暂无会社信息。</p>
        )}
      </div>
    </div>
  )
}

const MetaBlock = ({
  data,
  className = 'grid gap-3 sm:grid-cols-2'
}: {
  data: GameDetailDemoData
  className?: string
}) => {
  return (
    <div className={className}>
      <StatLine
        icon={<Calendar className="size-4" />}
        label="发售时间"
        value={data.intro.released || '未知'}
      />
      <StatLine
        icon={<Clock3 className="size-4" />}
        label="发布时间"
        value={formatDate(data.patch.created, { isShowYear: true })}
      />
      <StatLine
        icon={<Sparkles className="size-4" />}
        label="更新时间"
        value={formatDate(data.patch.updated, { isShowYear: true })}
      />
      <StatLine
        icon={<FolderOpenDot className="size-4" />}
        label="唯一 ID"
        value={<span className="break-all">{data.patch.uniqueId}</span>}
      />

      {data.patch.vndbId && (
        <StatLine
          icon={<ExternalLink className="size-4" />}
          label="VNDB"
          value={
            <KunExternalLink
              link={`https://vndb.org/${data.patch.vndbId}`}
              className="inline break-all text-sm"
            >
              {data.patch.vndbId}
            </KunExternalLink>
          }
        />
      )}

      {data.dlsiteId && (
        <StatLine
          icon={<ExternalLink className="size-4" />}
          label="DLsite"
          value={
            <KunExternalLink
              link={`https://www.dlsite.com/home/work/=/product_id/${data.dlsiteId}.html`}
              className="inline break-all text-sm"
            >
              {data.dlsiteId}
            </KunExternalLink>
          }
        />
      )}
    </div>
  )
}

const SteamHero = ({
  data,
  onDownload
}: {
  data: GameDetailDemoData
  onDownload: () => void
}) => {
  const backgroundStyle = data.patch.banner?.trim()
    ? {
      backgroundImage: `url(${data.patch.banner})`,
      backgroundSize: 'cover',
      backgroundPosition: 'top center'
    }
    : undefined
  const summary = getSteamSummary(data)

  return (
    <section
      className={cn(
        styles.heroShell,
        'relative rounded-[24px] border border-default-200/50 bg-content1/80 shadow-xl backdrop-blur-xl'
      )}
    >
      {backgroundStyle && (
        <div
          className="absolute inset-0 opacity-[0.25] blur-3xl saturate-150 mix-blend-overlay"
          style={backgroundStyle}
        />
      )}

      <div className="relative flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
        {/* Top: Header */}
        <div className="min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Standard Galgame Library
            </span>
            <Chip
              variant="flat"
              size="sm"
              color={data.patch.contentLimit === 'sfw' ? 'success' : 'danger'}
            >
              {GALGAME_AGE_LIMIT_MAP[data.patch.contentLimit]}
            </Chip>
          </div>
          <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl text-foreground drop-shadow-md">
            {data.patch.name}
          </h1>
        </div>

        {/* Main Grid Split */}
        <div className="grid items-stretch gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          {/* Left: Media Carousel (Centered vertically to absorb any extra height gracefully) */}
          <div className="order-2 h-full min-w-0 flex flex-col justify-center rounded-[24px] bg-content2/40 p-2 shadow-sm ring-1 ring-default-200/50 backdrop-blur-md sm:p-3 lg:order-1">
            <SteamOverviewPreview data={data} />
          </div>

          {/* Right: Info Sidebar - Matches Left Padding and Background */}
          <div className="order-1 h-full min-w-0 flex flex-col rounded-[24px] bg-content2/40 p-3 shadow-sm ring-1 ring-default-200/50 backdrop-blur-md sm:p-4 lg:order-2 xl:p-5">

            {/* Meta details & Large Cover */}
            <div className="flex flex-row gap-4 xl:gap-5 mb-4">
              <PortraitCover
                banner={data.patch.banner}
                name={data.patch.name}
                patch={data.patch}
                className="w-[120px] sm:w-[150px] md:w-[170px] lg:w-[140px] xl:w-[190px] shrink-0"
              />
              <div className="flex-1 min-w-0 relative">
                <div className="absolute inset-0 flex flex-col py-1">
                  <div className="space-y-3 shrink-0">
                    <div className="space-y-0.5 mt-1">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-default-500">发行日期</div>
                      <div className="text-sm font-bold text-foreground drop-shadow-sm">{data.intro.released || '未知'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-default-500">制作会社</div>
                      <div className="text-sm font-bold text-foreground drop-shadow-sm truncate hover:text-primary transition-colors cursor-pointer">
                        {data.patch.companies[0]?.name || '未知'}
                      </div>
                    </div>
                  </div>

                  {/* Tags section safely bounded to never exceed cover height */}
                  <div className="mt-2 flex-1 flex flex-col min-h-0 justify-end overflow-hidden">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-default-500 mb-1.5 shrink-0">游戏标签</div>
                    <div className="flex flex-wrap gap-1.5 overflow-hidden content-start">
                      {data.intro.tag && data.intro.tag.length > 0 ? (
                        data.intro.tag.map((tag) => (
                          <Chip key={tag.id} size="sm" variant="flat" color="default" className="bg-default-200/50">
                            {tag.name}
                          </Chip>
                        ))
                      ) : (
                        <span className="text-xs text-default-500">暂无标签</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Box with strict truncation to lock maximum height */}
            <div className="flex-1 min-h-0 bg-default-100/40 rounded-xl p-3 sm:p-4 border border-default-200/50 mb-3 sm:mb-4 transition-all">
              <p className="text-sm leading-6 sm:leading-7 text-default-700/90 font-medium line-clamp-3 lg:line-clamp-2 xl:line-clamp-4 drop-shadow-sm">
                {summary}
              </p>
            </div>

            {/* Bottom Card for actions anchored properly */}
            <Card className="shrink-0 mt-auto w-full border border-default-200/50 bg-content1/60 shadow-none backdrop-blur-md overflow-visible relative z-10">
              <CardBody className="gap-3 p-3 lg:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <KunUser
                    user={data.patch.user}
                    userProps={{
                      name: data.patch.user.name,
                      description: `${formatDistanceToNow(data.patch.created)} 发布`,
                      avatarProps: {
                        showFallback: true,
                        name: data.patch.user.name.charAt(0).toUpperCase(),
                        src: data.patch.user.avatar,
                        className: 'border border-default-200'
                      }
                    }}
                  />

                  <div className="min-w-0">
                    <KunCardStats
                      patch={data.patch}
                      disableTooltip={false}
                      className="flex-wrap justify-start gap-x-3 gap-y-2 lg:justify-end"
                    />
                  </div>
                </div>

                <GameDetailDemoActions patch={data.patch} onDownload={onDownload} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

const InfoTabContent = ({ data }: { data: GameDetailDemoData }) => {
  return (
    <div className="pt-5">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard
            title="游戏简介"
            icon={<Sparkles className="size-5 text-default-500" />}
          >
            <OverviewBlock data={data} />
          </SectionCard>
        </div>

        <div className="space-y-6 xl:self-start">
          <SectionCard
            title="资料卡"
            icon={<Boxes className="size-5 text-default-500" />}
          >
            <MetaBlock data={data} />
          </SectionCard>

          <SectionCard
            title="外部链接"
            icon={<Link2 className="size-5 text-default-500" />}
          >
            <RelatedLinksBlock data={data} />
          </SectionCard>

          <SectionCard
            title="标签与会社"
            icon={<TagsIcon className="size-5 text-default-500" />}
          >
            <TaxonomyBlock data={data} />
          </SectionCard>

          <SectionCard
            title="别名"
            icon={<Sparkles className="size-5 text-default-500" />}
          >
            <AliasBlock data={data} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export const GameDetailDemoPage = ({
  data,
  showDesignBreadcrumb = false,
  isDesignPreview = false
}: Props) => {
  const [selectedTab, setSelectedTab] = useState<DemoTabKey>('info')
  const setData = useRewritePatchStore((state) => state.setData)
  const isBlockedByNsfw = data.patch.contentLimit === 'nsfw' && !data.uid

  useEffect(() => {
    if (isDesignPreview || isBlockedByNsfw) {
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
  }, [data, isBlockedByNsfw, isDesignPreview, setData])

  useEffect(() => {
    if (isDesignPreview || isBlockedByNsfw) {
      return
    }

    void kunUpdatePatchViewsActions({ uniqueId: data.patch.uniqueId })
  }, [data.patch.uniqueId, isBlockedByNsfw, isDesignPreview])

  if (isBlockedByNsfw) {
    return <KunNull message="请登录后查看 NSFW 游戏" />
  }

  return (
    <div className={cn(styles.page, 'py-6')}>
      <div className="mx-auto max-w-7xl space-y-6">
        {showDesignBreadcrumb && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-default-600">
            <Link href="/design/game-detail" className="transition-colors hover:text-primary">
              设计演示
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">Steam 风格</span>
          </div>
        )}

        <SteamHero
          data={data}
          onDownload={() => setSelectedTab('resources')}
        />

        <Card className="overflow-hidden rounded-large border border-default-100 bg-content1/90 shadow-sm backdrop-blur">
          <CardBody className="p-2 sm:p-3">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as DemoTabKey)}
              fullWidth
              variant="solid"
              aria-label="游戏详情分区"
              classNames={{
                base: 'w-full',
                tabList:
                  'grid w-full grid-cols-3 gap-1 rounded-large bg-default-100/80 p-1',
                panel: 'px-2 pb-2 pt-0 sm:px-3 sm:pb-3',
                cursor: 'w-full rounded-lg bg-content1 shadow-sm',
                tab: 'h-11 min-w-0 px-1.5 sm:h-14 sm:px-3',
                tabContent:
                  'truncate text-xs font-semibold text-default-600 group-data-[selected=true]:text-foreground sm:text-sm'
              }}
            >
              <Tab
                key="info"
                title={
                  <div className="flex items-center gap-2">
                    <Sparkles className="hidden size-4 sm:block" />
                    <span>游戏信息</span>
                  </div>
                }
                className="p-0"
              >
                <InfoTabContent data={data} />
              </Tab>

              <Tab
                key="resources"
                title={
                  <div className="flex items-center gap-2">
                    <FolderOpenDot className="hidden size-4 sm:block" />
                    <span>资源链接</span>
                  </div>
                }
                className="p-0"
              >
                <div id="demo-resources" className="pt-5">
                  <SectionCard
                    title="资源链接"
                    icon={<FolderOpenDot className="size-5 text-default-500" />}
                  >
                    <Resources id={data.patch.id} vndbId={data.patch.vndbId || ''} />
                  </SectionCard>
                </div>
              </Tab>

              <Tab
                key="comments"
                title={
                  <div className="flex items-center gap-2">
                    <MessageSquare className="hidden size-4 sm:block" />
                    <span>游戏评论</span>
                  </div>
                }
                className="p-0"
              >
                <div className="pt-5">
                  <SectionCard
                    title="游戏评论"
                    icon={<MessageSquare className="size-5 text-default-500" />}
                  >
                    <Comments id={data.patch.id} />
                  </SectionCard>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

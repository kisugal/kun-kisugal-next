import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import {
  Boxes,
  Calendar,
  Clock3,
  ExternalLink,
  FolderOpenDot,
  Link2,
  Sparkles,
  Tags as TagsIcon
} from 'lucide-react'
import { KunCardStats } from '~/components/kun/CardStats'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { KunNull } from '~/components/kun/Null'
import { EditBanner } from '~/components/patch/header/EditBanner'
import { GALGAME_AGE_LIMIT_MAP } from '~/constants/galgame'
import { cn } from '~/utils/cn'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { formatDate } from '~/utils/time'
import { PatchDetailActions } from './PatchDetailActions'
import { PatchDetailClientEffects } from './PatchDetailClientEffects'
import { PatchDetailHtml } from './PatchDetailHtml'
import { PatchDetailMediaCarousel } from './PatchDetailMediaCarousel'
import { PatchDetailTabs } from './PatchDetailTabs'
import type { PatchDetailData, PatchDetailPreviewImage } from './types'
import styles from './patch-detail.module.css'

interface Props {
  data: PatchDetailData
}

const getSteamSummary = (data: PatchDetailData) => {
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

const parseImagesFromHtml = (html: string): PatchDetailPreviewImage[] => {
  if (!html) {
    return []
  }

  const images: PatchDetailPreviewImage[] = []
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
  data: PatchDetailData
): PatchDetailPreviewImage[] => {
  const map = new Map<string, PatchDetailPreviewImage>()

  const push = (image: PatchDetailPreviewImage) => {
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
  patch?: PatchDetailData['patch']
  className?: string
}) => {
  return (
    <div
      className={cn(
        styles.coverFrame,
        'w-[180px] shrink-0 sm:w-[220px]',
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-default-100/50 shadow-md">
        {banner?.trim() ? (
          <img
            src={banner}
            alt={name}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
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

const OverviewBlock = ({ data }: { data: PatchDetailData }) => {
  const bodyWithoutImages = stripImagesFromOverviewHtml(data.bodyHtml).trim()
  const fullWithoutImages = stripImagesFromOverviewHtml(data.fullHtml).trim()
  const shouldShowBody = Boolean(bodyWithoutImages)
  const extractedEverything =
    !shouldShowBody &&
    (data.screenshots.length > 0 || data.relatedLinks.length > 0)

  if (shouldShowBody) {
    return (
      <PatchDetailHtml
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
    <PatchDetailHtml
      html={fullWithoutImages}
      className="break-words [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
    />
  )
}

const AliasBlock = ({ data }: { data: PatchDetailData }) => {
  if (!data.intro.alias.length) {
    return <p className="text-sm text-default-500">这个游戏暂无别名。</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.intro.alias.map((alias) => (
        <span
          key={alias}
          className="max-w-full break-words rounded-full border border-default-100 bg-default-50/80 px-3 py-1.5 text-sm text-default-700"
        >
          {alias}
        </span>
      ))}
    </div>
  )
}

const RelatedLinksBlock = ({ data }: { data: PatchDetailData }) => {
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
          <KunExternalLink
            link={item.href}
            className="max-w-full break-all text-sm"
          >
            {item.href}
          </KunExternalLink>
        </div>
      ))}
    </div>
  )
}

const TaxonomyBlock = ({ data }: { data: PatchDetailData }) => {
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
  data: PatchDetailData
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
  overviewImages
}: {
  data: PatchDetailData
  overviewImages: PatchDetailPreviewImage[]
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
        <div className="min-w-0 flex flex-col gap-2">
          <div className="mb-1 flex flex-wrap items-center gap-2">
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
          <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight text-foreground drop-shadow-md sm:text-4xl xl:text-5xl">
            {data.patch.name}
          </h1>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(380px,1.35fr)] lg:gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(430px,1.25fr)]">
          <div className="order-2 flex h-full min-w-0 flex-col justify-center rounded-[24px] bg-content2/40 p-2 shadow-sm ring-1 ring-default-200/50 backdrop-blur-md sm:p-3 lg:order-1">
            <PatchDetailMediaCarousel
              images={overviewImages}
              name={data.patch.name}
            />
          </div>

          <div className="order-1 flex h-full min-w-0 flex-col rounded-[24px] bg-content2/40 p-3 shadow-sm ring-1 ring-default-200/50 backdrop-blur-md sm:p-4 lg:order-2 xl:p-5">
            <div className="mb-4 flex flex-row gap-4 xl:gap-5">
              <PortraitCover
                banner={data.patch.banner}
                name={data.patch.name}
                patch={data.patch}
                className="w-[120px] shrink-0 sm:w-[150px] md:w-[170px] lg:w-[140px] xl:w-[190px]"
              />
              <div className="relative min-w-0 flex-1">
                <div className="absolute inset-0 flex flex-col py-1">
                  <div className="shrink-0 space-y-3">
                    <div className="mt-1 space-y-0.5">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-default-500">
                        发行日期
                      </div>
                      <div className="text-sm font-bold text-foreground drop-shadow-sm">
                        {data.intro.released || '未知'}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-default-500">
                        制作会社
                      </div>
                      <div className="cursor-pointer truncate text-sm font-bold text-foreground drop-shadow-sm transition-colors hover:text-primary">
                        {data.patch.companies[0]?.name || '未知'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
                    <div className="mb-1.5 shrink-0 text-[11px] font-bold uppercase tracking-widest text-default-500">
                      游戏标签
                    </div>
                    <div className="flex flex-wrap content-start gap-1.5 overflow-hidden">
                      {data.intro.tag && data.intro.tag.length > 0 ? (
                        data.intro.tag.map((tag) => (
                          <Chip
                            key={tag.id}
                            size="sm"
                            variant="flat"
                            color="default"
                            className="bg-default-200/50"
                          >
                            {tag.name}
                          </Chip>
                        ))
                      ) : (
                        <span className="text-xs text-default-500">
                          暂无标签
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 flex-1 min-h-0 rounded-xl border border-default-200/50 bg-default-100/40 p-3 transition-all sm:mb-4 sm:p-4">
              <p className="line-clamp-3 text-sm font-medium leading-6 text-default-700/90 drop-shadow-sm sm:leading-7 lg:line-clamp-2 xl:line-clamp-4">
                {summary}
              </p>
            </div>

            <Card className="relative z-10 mt-auto w-full shrink-0 overflow-visible border border-default-200/50 bg-content1/60 shadow-none backdrop-blur-md">
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

                  <div className="min-w-0 lg:ml-auto">
                    <KunCardStats
                      patch={data.patch}
                      disableTooltip={false}
                      className="justify-start gap-x-2.5 sm:gap-x-3 lg:justify-end"
                    />
                  </div>
                </div>

                <PatchDetailActions patch={data.patch} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

const InfoTabContent = ({ data }: { data: PatchDetailData }) => {
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

export const PatchDetailPage = ({ data }: Props) => {
  const isBlockedByNsfw = data.patch.contentLimit === 'nsfw' && !data.uid

  if (isBlockedByNsfw) {
    return <KunNull message="请登录后查看 NSFW 游戏" />
  }

  const overviewImages = getOverviewPreviewImages(data)

  return (
    <>
      <PatchDetailClientEffects data={data} />
      <div className={cn(styles.page, 'py-6')}>
        <div className="mx-auto max-w-7xl space-y-6">
          <SteamHero data={data} overviewImages={overviewImages} />

          <PatchDetailTabs data={data}>
            <InfoTabContent data={data} />
          </PatchDetailTabs>
        </div>
      </div>
    </>
  )
}

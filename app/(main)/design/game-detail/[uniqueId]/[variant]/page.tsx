import Link from 'next/link'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { notFound } from 'next/navigation'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { GameDetailDemoPage } from '~/components/design/game-detail/GameDetailDemoPage'
import { getGameDetailDemoData } from '~/components/design/game-detail/data'
import {
  GAME_DETAIL_DEMO_VARIANT_LABEL,
  GAME_DETAIL_DEMO_VARIANTS,
  GAME_DETAIL_PRIMARY_DEMO_VARIANT,
  type GameDetailDemoVariant
} from '~/components/design/game-detail/types'

interface Props {
  params: Promise<{
    uniqueId: string
    variant: string
  }>
}

export default async function GameDetailDesignVariantPage({ params }: Props) {
  const { uniqueId, variant } = await params

  if (!GAME_DETAIL_DEMO_VARIANTS.includes(variant as GameDetailDemoVariant)) {
    notFound()
  }

  const response = await getGameDetailDemoData(uniqueId)
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  if (variant !== GAME_DETAIL_PRIMARY_DEMO_VARIANT) {
    const label =
      GAME_DETAIL_DEMO_VARIANT_LABEL[variant as GameDetailDemoVariant]

    return (
      <div className="mx-auto max-w-4xl py-8">
        <Card className="rounded-[32px] border border-default-200 bg-content1/90 shadow-sm backdrop-blur">
          <CardBody className="gap-5 p-8 sm:p-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-default-500">
                Design Sandbox
              </p>
              <h1 className="text-3xl font-black tracking-tight">
                {label} 暂时隐藏
              </h1>
              <p className="text-sm leading-7 text-default-600 sm:text-base">
                这套方案的代码仍然保留在 `design` 目录里，
                但当前预览入口只开放了更贴近正式站点风格的 Steam 方案，
                方便我们先集中把这一版打磨稳定。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                as={Link}
                href={`/design/game-detail/${uniqueId}/${GAME_DETAIL_PRIMARY_DEMO_VARIANT}`}
                color="primary"
              >
                查看 Steam 方案
              </Button>
              <Button as={Link} href="/design/game-detail" variant="flat">
                返回设计入口
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <GameDetailDemoPage data={response} showDesignBreadcrumb isDesignPreview />
  )
}

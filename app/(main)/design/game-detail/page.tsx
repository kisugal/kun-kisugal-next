import Link from 'next/link'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { ArrowRight, LayoutTemplate } from 'lucide-react'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { GameDetailDemoJumpForm } from '~/components/design/game-detail/GameDetailDemoJumpForm'
import { getGameDetailDemoIndexGames } from '~/components/design/game-detail/data'
import {
  GAME_DETAIL_DEMO_VARIANT_LABEL,
  GAME_DETAIL_PRIMARY_DEMO_VARIANT
} from '~/components/design/game-detail/types'

export default async function GameDetailDesignIndexPage() {
  const games = await getGameDetailDemoIndexGames()

  if (!Array.isArray(games)) {
    return <ErrorComponent error="获取演示游戏列表失败" />
  }

  return (
    <div className="mx-auto max-w-7xl py-6">
      <section className="rounded-[32px] border border-default-200 bg-content1/90 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-default-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-default-600">
              <LayoutTemplate className="size-4" />
              <span>Game Detail UI Demo</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              游戏详细页 UI 重构演示
            </h1>
            <p className="text-sm leading-7 text-default-600 sm:text-base">
              当前开放预览的是 Steam 方案。其余方案的代码仍保留在
              `design` 目录中，等待下一轮继续修改，不会影响原来的游戏详情页。
            </p>
          </div>

          <Button
            as={Link}
            href="/galgame"
            color="primary"
            variant="flat"
            endContent={<ArrowRight className="size-4" />}
          >
            返回游戏列表
          </Button>
        </div>

        <div className="mt-6">
          <GameDetailDemoJumpForm />
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">最新游戏样本</h2>
          <p className="text-sm text-default-500">
            下面的卡片直接使用站内现有游戏，点击即可查看当前 Steam 演示页。
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {games.map((game) => (
            <Card
              key={game.uniqueId}
              className="overflow-hidden rounded-[28px] border border-default-200 bg-content1/95 shadow-sm"
            >
              <div className="aspect-[3/4] overflow-hidden bg-default-100">
                {game.banner?.trim() ? (
                  <img
                    src={game.banner}
                    alt={game.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-default-500">
                    暂无封面
                  </div>
                )}
              </div>

              <CardBody className="gap-4 p-5">
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-lg font-semibold">
                    {game.name}
                  </h3>
                  <p className="text-xs text-default-500">
                    Unique ID: {game.uniqueId}
                  </p>
                </div>

                <Button
                  as={Link}
                  href={`/design/game-detail/${game.uniqueId}/${GAME_DETAIL_PRIMARY_DEMO_VARIANT}`}
                  color="primary"
                  variant="flat"
                  endContent={<ArrowRight className="size-4" />}
                >
                  查看 {GAME_DETAIL_DEMO_VARIANT_LABEL.steam}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

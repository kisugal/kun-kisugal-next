import { Suspense } from 'react'
import { TopicListPage } from '~/components/topic/TopicListPage'
import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

export const metadata: Metadata = {
  metadataBase: new URL(kunMoyuMoe.domain.main),
  title: {
    default: kunMoyuMoe.title,
    template: kunMoyuMoe.template
  },
  description: kunMoyuMoe.description,
  keywords: kunMoyuMoe.keywords,
  authors: kunMoyuMoe.author
}

function TopicListLoading() {
  return (
    <div className="container mx-auto my-4">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          {/* 标签页骨架 */}
          <div className="bg-content1 rounded-large shadow-small p-4">
            <div className="flex gap-4">
              <div className="h-8 w-20 rounded-lg bg-default-200 animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-default-200 animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-default-200 animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-default-200 animate-pulse" />
            </div>
          </div>

          {/* 筛选骨架 */}
          <div className="bg-content1 rounded-large shadow-small p-4">
            <div className="flex gap-4">
              <div className="h-10 w-32 rounded-lg bg-default-200 animate-pulse" />
              <div className="h-10 w-24 rounded-lg bg-default-200 animate-pulse" />
            </div>
          </div>

          {/* 话题列表骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-content1 rounded-large shadow-small p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-default-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded-lg bg-default-200 animate-pulse" />
                    <div className="h-3 w-32 rounded-lg bg-default-200 animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-3/4 rounded-lg bg-default-200 animate-pulse" />
                <div className="h-20 w-full rounded-lg bg-default-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* 右侧边栏骨架 */}
        <div className="hidden lg:block w-80 space-y-4">
          <div className="bg-content1 rounded-large shadow-small p-4 space-y-3">
            <div className="h-6 w-32 rounded-lg bg-default-200 animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-default-200 animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-default-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Kun() {
  return (
    <Suspense fallback={<TopicListLoading />}>
      <TopicListPage />
    </Suspense>
  )
}
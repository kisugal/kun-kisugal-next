import TopicListLoading from '~/components/home/Container'
import type { Metadata } from 'next'
import { kunGetActions } from '../actions'
import { kunMoyuMoe } from '~/config/moyu-moe'

export const metadata: Metadata = {
  metadataBase: new URL(kunMoyuMoe.domain.main),
  title: {
    default: kunMoyuMoe.title,
    template: kunMoyuMoe.template
  },

  // ✅ SEO保留，但不会显示在页面
  description: kunMoyuMoe.description,

  keywords: kunMoyuMoe.keywords,
  authors: kunMoyuMoe.author,
  robots: {
    index: true,
    follow: true
  }
}

export const revalidate = 3

export default async function Kun() {
  const response = await kunGetActions()

  const list = Array.isArray(response) ? response : []

  return (
    <div className="container mx-auto my-4 space-y-6">
      {/* ❗只保留H1，不显示任何介绍文字 */}
      <h1 className="text-2xl font-bold">{kunMoyuMoe.title}</h1>

      {/* 内容 */}
      {list.length > 0 ? (
        <div className="space-y-4">
          {list.map((item: any, index: number) => (
            <article key={index}>
              <h2 className="text-lg font-semibold">
                {item?.title || 'Untitled'}
              </h2>
              <p className="text-sm text-gray-600">{item?.description || ''}</p>
            </article>
          ))}
        </div>
      ) : (
        <TopicListLoading />
      )}
    </div>
  )
}

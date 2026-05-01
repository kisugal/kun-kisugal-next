import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '教程 & 模拟器文档 | 网站博客',
  description: `教程 & 模拟器文章`,
  openGraph: {
    title: '教程 & 模拟器文档 | 网站博客',
    description: `教程 & 模拟器文章`,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '教程 & 模拟器文档 | 网站博客',
    description: `教程 & 模拟器文章`
  }
}

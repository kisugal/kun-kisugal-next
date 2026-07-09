'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardBody, CardFooter } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Eye, Heart, ImageIcon, MessageSquare, Pin } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/formatNumber'
import { formatDistanceToNow } from '@/utils/formatDistanceToNow'
import {
  extractImagesFromMarkdown,
  markdownToText
} from '@/utils/markdownToText'
import type { TopicCard as TopicCardType } from '@/types/api/topic'
import { Avatar, ScrollShadow } from '@heroui/react'
import { category } from './CreateTopic'

interface Props {
  topic: TopicCardType
  className?: string
}

const MAX_IMAGES = 5

export const TopicCard = ({ topic, className }: Props) => {
  const [isHovered, setIsHovered] = useState(false)

  // 从内容中提取图片
  const images = useMemo(
    () => extractImagesFromMarkdown(topic.content),
    [topic.content]
  )
  const displayImages = images.slice(0, MAX_IMAGES)
  const hasOverflow = images.length > MAX_IMAGES
  const overflowImage = hasOverflow ? images[MAX_IMAGES] : null
  return (
    <div className="border-b border-divider hover:shadow-lg hover:rounded-xl">
      <Link
        // isPressable
        // as={Link}
        href={`/topic/${topic.id}`}
        className={cn(
          'flex flex-col gap-2 p-2 transition-all duration-200 hover:rounded-xl group hover:border-primary-200',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* <CardBody className="p-0"> */}
        {/* 话题头部信息 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar
              src={
                topic.user.avatar && topic.user.avatar.trim() !== ''
                  ? topic.user.avatar
                  : undefined
              }
              alt={topic.user.name}
              size="sm"
              className="flex-shrink-0 opacity-100"
              name={topic.user.name.charAt(0).toUpperCase()}
              showFallback
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground/90 truncate">
                  {topic.user.name}
                </span>
                {topic.is_pinned && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="warning"
                    startContent={<Pin className="size-3" />}
                    className="text-xs"
                  >
                    置顶
                  </Chip>
                )}
              </div>
              <span className="text-xs text-foreground/60">
                {formatDistanceToNow(new Date(topic.created))}
              </span>
            </div>
          </div>
        </div>

        {/* 话题标题 */}
        <h2
          className={cn(
            'text-lg font-semibold mb-3 transition-colors line-clamp-2 text-foreground/90',
            isHovered ? 'text-primary' : ''
          )}
          title={topic.title}
        >
          {topic.title}
        </h2>

        {/* 话题内容预览 */}
        <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">
          {markdownToText(topic.content)}
        </p>
        <ScrollShadow
          className="max-w-[700px] max-h-[300px]"
          orientation="horizontal"
        >
          <div>
            {/* 图片缩略图横向展示 */}
            {images.length > 0 && (
              <div className="flex gap-1.5 mt-3 mb-4">
                {displayImages.map((imgUrl, index) => (
                  <div
                    key={imgUrl}
                    className="relative flex-shrink-0 w-[100px] h-[72px] rounded-lg overflow-hidden bg-muted"
                  >
                    <Image
                      src={imgUrl}
                      alt={`图片 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                      unoptimized
                    />
                  </div>
                ))}
                {/* 溢出图片：显示半张 + 后半张模糊 */}
                {hasOverflow && overflowImage && (
                  <div className="relative flex-shrink-0 w-[100px] h-[72px] rounded-lg overflow-hidden bg-muted">
                    {/* 前半张清晰 */}
                    <div className="absolute top-0 left-0 bottom-0 w-1/2 overflow-hidden">
                      <div className="relative w-[100px] h-[72px]">
                        <Image
                          src={overflowImage}
                          alt="图片 6"
                          fill
                          className="object-cover"
                          sizes="100px"
                          unoptimized
                        />
                      </div>
                    </div>
                    {/* 后半张模糊 */}
                    <div className="absolute top-0 right-0 bottom-0 w-1/2 overflow-hidden">
                      <div className="relative w-[100px] h-[72px]">
                        <Image
                          src={overflowImage}
                          alt="图片 6"
                          fill
                          className="object-cover blur-sm"
                          sizes="100px"
                          unoptimized
                        />
                      </div>
                      {/* 模糊遮罩 */}
                      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
                    </div>
                    {/* 数量提示 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-white text-xs font-medium">
                        +{images.length - MAX_IMAGES}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollShadow>
        {topic.topicCategory && (
          <div className="flex items-center gap-2 mt-3">
            <Chip>
              {category.find((c) => c.key === topic.topicCategory)?.label}
            </Chip>
          </div>
        )}
        {/* </CardBody> */}

        {/* <CardFooter className="p-0 pt-3 border-t border-divider/50"> */}
        {/* 统计信息 */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 text-sm text-foreground/60">
            <div className="flex items-center gap-1">
              <Eye className="size-4" />
              <span>{formatNumber(topic.view_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="size-4" />
              <span>{formatNumber(topic.like_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="size-4" />
              <span>{topic.comment_count}</span>
            </div>
          </div>

          {/* 更新时间 */}
          <span className="text-xs text-foreground/50">
            更新于 {formatDistanceToNow(new Date(topic.updated))}
          </span>
        </div>
        {/* </CardFooter> */}
      </Link>
    </div>
  )
}

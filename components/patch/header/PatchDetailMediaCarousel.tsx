'use client'

import dynamic from 'next/dynamic'
import { startTransition, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '~/utils/cn'
import type { PatchDetailPreviewImage } from './types'
import styles from './patch-detail.module.css'

const PatchDetailLightbox = dynamic(
  () => import('./PatchDetailLightbox').then((mod) => mod.PatchDetailLightbox),
  { ssr: false }
)

interface Props {
  images: PatchDetailPreviewImage[]
  name: string
}

export const PatchDetailMediaCarousel = ({ images, name }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [hasOpenedLightbox, setHasOpenedLightbox] = useState(false)

  if (!images.length) {
    return (
      <div className="rounded-xl border border-dashed border-default-200 p-5 text-sm text-default-500">
        当前条目暂无可预览图片。
      </div>
    )
  }

  const safeActiveIndex = Math.min(activeIndex, images.length - 1)
  const activeImage = images[safeActiveIndex]

  const openLightbox = (index: number) => {
    startTransition(() => {
      setHasOpenedLightbox(true)
      setLightboxIndex(index)
    })
  }

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
          onClick={() => openLightbox(safeActiveIndex)}
        >
          <img
            src={activeImage.src}
            alt={activeImage.alt || `${name} 预览图 ${safeActiveIndex + 1}`}
            className="h-full w-full object-cover"
            loading={safeActiveIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={safeActiveIndex === 0 ? 'high' : 'auto'}
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
          onClick={() => openLightbox(safeActiveIndex)}
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
          <div
            className={cn(
              styles.anchorNav,
              'grid grid-cols-4 gap-2 sm:flex sm:min-w-max'
            )}
          >
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
                  alt={item.alt || `${name} 缩略图 ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {hasOpenedLightbox && (
        <PatchDetailLightbox
          images={images}
          index={lightboxIndex}
          open={lightboxIndex >= 0}
          onClose={() => setLightboxIndex(-1)}
        />
      )}
    </div>
  )
}

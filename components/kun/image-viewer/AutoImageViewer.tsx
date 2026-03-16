'use client'

import { RefObject, useEffect, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import { useMounted } from '~/hooks/useMounted'

interface AutoImageViewerProps {
  scopeRef: RefObject<HTMLElement | null>
}

export const KunAutoImageViewer = ({ scopeRef }: AutoImageViewerProps) => {
  const [openImage, setOpenImage] = useState<string | null>(null)
  const [images, setImages] = useState<
    { src: string; width: number; height: number }[]
  >([])
  const isMounted = useMounted()

  useEffect(() => {
    if (!isMounted || !scopeRef.current) {
      return
    }

    const scopeElement = scopeRef.current
    const cleanupMap = new Map<HTMLImageElement, () => void>()

    const registerImage = (img: HTMLImageElement) => {
      if (img.width >= 200 && img.height >= 200) {
        setImages((prev) => {
          const exists = prev.some((image) => image.src === img.src)
          if (!exists) {
            return [
              ...prev,
              { src: img.src, width: img.width, height: img.height }
            ]
          }
          return prev
        })

        img.style.cursor = 'pointer'
        if (!cleanupMap.has(img)) {
          const handleClick = () => setOpenImage(img.src)
          img.addEventListener('click', handleClick)
          cleanupMap.set(img, () => img.removeEventListener('click', handleClick))
        }
      }
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            if (node.complete) {
              registerImage(node)
            } else {
              node.onload = () => registerImage(node)
            }
          }
        })
      })
    })

    scopeElement.querySelectorAll('img').forEach((img) => {
      if (img.complete) {
        registerImage(img)
      } else {
        img.onload = () => registerImage(img)
      }
    })

    observer.observe(scopeElement, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
      cleanupMap.forEach((cleanup) => cleanup())
    }
  }, [isMounted, scopeRef])

  const currentImageIndex = openImage
    ? images.findIndex((img) => img.src === openImage)
    : -1

  return (
    <Lightbox
      index={currentImageIndex}
      slides={images}
      open={currentImageIndex >= 0}
      close={() => setOpenImage(null)}
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
      styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .7)' } }}
    />
  )
}

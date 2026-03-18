'use client'

import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'
import type { PatchDetailPreviewImage } from './types'

interface Props {
  images: PatchDetailPreviewImage[]
  index: number
  open: boolean
  onClose: () => void
}

export const PatchDetailLightbox = ({
  images,
  index,
  open,
  onClose
}: Props) => {
  return (
    <Lightbox
      index={index}
      slides={images.map((item) => ({ src: item.src, alt: item.alt }))}
      open={open}
      close={onClose}
      plugins={[Zoom, Download]}
      animation={{ fade: 240 }}
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
  )
}

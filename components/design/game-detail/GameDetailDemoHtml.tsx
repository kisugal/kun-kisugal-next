'use client'

import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import DOMPurify from 'isomorphic-dompurify'
import dynamic from 'next/dynamic'
import { useMounted } from '~/hooks/useMounted'
import { KunAutoImageViewer } from '~/components/kun/image-viewer/AutoImageViewer'
import { KunLink } from '~/components/kun/milkdown/plugins/components/link/KunLink'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { cn } from '~/utils/cn'

const KunPlyr = dynamic(
  () =>
    import('~/components/kun/milkdown/plugins/components/video/Plyr').then(
      (mod) => mod.KunPlyr
    ),
  { ssr: false }
)

interface Props {
  html: string
  className?: string
}

export const GameDetailDemoHtml = ({ html, className }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const isMounted = useMounted()

  useEffect(() => {
    if (!contentRef.current || !isMounted) {
      return
    }

    const externalLinkElements = contentRef.current.querySelectorAll(
      '[data-kun-external-link]'
    )
    externalLinkElements.forEach((element) => {
      const text = element.getAttribute('data-text')
      const href = element.getAttribute('data-href')
      if (!text || !href) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)

      const linkRoot = createRoot(root)
      linkRoot.render(<KunExternalLink link={href}>{text}</KunExternalLink>)
    })

    const videoElements = contentRef.current.querySelectorAll(
      '[data-video-player]'
    )
    videoElements.forEach((element) => {
      const src = element.getAttribute('data-src')
      if (!src) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)

      const videoRoot = createRoot(root)
      videoRoot.render(<KunPlyr src={src} />)
    })

    const linkElements = contentRef.current.querySelectorAll('[data-kun-link]')
    linkElements.forEach((element) => {
      const href = element.getAttribute('data-href')
      const text = element.getAttribute('data-text')
      if (!href || !text) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)

      const linkRoot = ReactDOM.createRoot(root)
      linkRoot.render(<KunLink href={href} text={text} />)
    })
  }, [html, isMounted])

  return (
    <>
      <div
        ref={contentRef}
        className={cn('kun-prose max-w-none', className)}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(html)
        }}
      />
      <KunAutoImageViewer scopeRef={contentRef} />
    </>
  )
}

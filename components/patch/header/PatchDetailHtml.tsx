'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import DOMPurify from 'isomorphic-dompurify'
import dynamic from 'next/dynamic'
import { useMounted } from '~/hooks/useMounted'
import { KunLink } from '~/components/kun/milkdown/plugins/components/link/KunLink'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { cn } from '~/utils/cn'

const KunAutoImageViewer = dynamic(
  () =>
    import('~/components/kun/image-viewer/AutoImageViewer').then(
      (mod) => mod.KunAutoImageViewer
    ),
  { ssr: false }
)

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

export const PatchDetailHtml = ({ html, className }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const isMounted = useMounted()
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(html), [html])

  useEffect(() => {
    if (!contentRef.current || !isMounted) {
      return
    }

    const mountedRoots: Root[] = []

    const mountElement = (element: Element, node: ReactNode) => {
      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)

      const mountedRoot = createRoot(root)
      mountedRoot.render(node)
      mountedRoots.push(mountedRoot)
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

      mountElement(
        element,
        <KunExternalLink link={href}>{text}</KunExternalLink>
      )
    })

    const videoElements = contentRef.current.querySelectorAll(
      '[data-video-player]'
    )
    videoElements.forEach((element) => {
      const src = element.getAttribute('data-src')
      if (!src) {
        return
      }

      mountElement(element, <KunPlyr src={src} />)
    })

    const linkElements = contentRef.current.querySelectorAll('[data-kun-link]')
    linkElements.forEach((element) => {
      const href = element.getAttribute('data-href')
      const text = element.getAttribute('data-text')
      if (!href || !text) {
        return
      }

      mountElement(element, <KunLink href={href} text={text} />)
    })

    return () => {
      mountedRoots.forEach((root) => root.unmount())
    }
  }, [isMounted, sanitizedHtml])

  return (
    <>
      <div
        ref={contentRef}
        className={cn('kun-prose max-w-none', className)}
        dangerouslySetInnerHTML={{
          __html: sanitizedHtml
        }}
      />
      <KunAutoImageViewer scopeRef={contentRef} />
    </>
  )
}

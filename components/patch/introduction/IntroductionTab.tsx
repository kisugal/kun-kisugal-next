'use client'

import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/react'
import { Divider } from '@heroui/divider'
import Link from 'next/link'
import { Info } from './Info'
import { PatchTag } from './Tag'
import dynamic from 'next/dynamic'
import { useMounted } from '~/hooks/useMounted'
import { KunLink } from '~/components/kun/milkdown/plugins/components/link/KunLink'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { kunUpdatePatchViewsActions } from '~/app/(main)/[id]/actions'
import type { PatchIntroduction } from '~/types/api/patch'
import type DOMPurifyType from 'dompurify'

import './_adjust.scss'

const KunPlyr = dynamic(
  () =>
    import('~/components/kun/milkdown/plugins/components/video/Plyr').then(
      (mod) => mod.KunPlyr
    ),
  { ssr: false }
)

interface Props {
  intro: PatchIntroduction
  patchId: number
  uniqueId: string
  uid?: number
  companies?: { id: number; name: string }[]
}

export const IntroductionTab = ({ intro, patchId, uniqueId, uid, companies }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const isMounted = useMounted()
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('')
  const [DOMPurify, setDOMPurify] = useState<typeof DOMPurifyType | null>(null)

  // 客户端动态加载 DOMPurify
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('dompurify').then((mod) => {
        setDOMPurify(() => mod.default)
      })
    }
  }, [])

  // 当 DOMPurify 加载完成后清理 HTML
  useEffect(() => {
    if (DOMPurify && intro.introduction) {
      setSanitizedHtml(DOMPurify.sanitize(intro.introduction))
    }
  }, [DOMPurify, intro.introduction])

  // 更新浏览量
  useEffect(() => {
    if (isMounted) {
      kunUpdatePatchViewsActions({ uniqueId })
    }
  }, [uniqueId, isMounted])

  useEffect(() => {
    if (!contentRef.current || !sanitizedHtml) {
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
      const videoRoot = createRoot(root)
      videoRoot.render(<KunExternalLink link={href}>{text}</KunExternalLink>)
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
      if (!href || !text) return

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)

      const linkRoot = ReactDOM.createRoot(root)
      linkRoot.render(<KunLink href={href} text={text} />)
    })
  }, [sanitizedHtml])

  return (
    <Card className="p-1 sm:p-8">
      <CardBody className="p-4 space-y-6">
        <h2 className="text-2xl font-medium" style={{ color: '#11181C' }}>游戏介绍</h2>

        {sanitizedHtml ? (
          <div
            ref={contentRef}
            dangerouslySetInnerHTML={{
              __html: sanitizedHtml
            }}
            className="kun-prose max-w-none"
          />
        ) : (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-default-200 rounded w-3/4"></div>
            <div className="h-4 bg-default-200 rounded w-full"></div>
            <div className="h-4 bg-default-200 rounded w-5/6"></div>
          </div>
        )}

        {companies && companies.length > 0 && (
          <>
            <Divider className="my-4" />
            <div className="flex flex-col gap-4">
              <span className="text-xl">所属开发商</span>
              <div className="flex flex-wrap gap-2">
                {companies.map((company) => (
                  <Chip
                    key={company.id}
                    variant="flat"
                    color="warning"
                    size="lg"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Link href={`/company/${company.id}`}>{company.name}</Link>
                  </Chip>
                ))}
              </div>
            </div>
          </>
        )}

        {uid && <PatchTag patchId={patchId} initialTags={intro.tag} />}

        <Info intro={intro} />
      </CardBody>
    </Card>
  )
}

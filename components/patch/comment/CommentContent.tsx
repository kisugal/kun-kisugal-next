'use client'

import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useMounted } from '~/hooks/useMounted'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { Code } from '@heroui/code'
import { Chip } from '@heroui/chip'
import { Quote } from 'lucide-react'
import { scrollIntoComment } from './_scrollIntoComment'
import type { PatchComment } from '~/types/api/patch'

interface Props {
  comment: PatchComment
}

export const CommentContent = ({ comment }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const isMounted = useMounted()
  const [sanitizedContent, setSanitizedContent] = useState('')

  // 客户端动态加载 DOMPurify
  useEffect(() => {
    if (typeof window !== 'undefined' && comment.content) {
      import('dompurify').then((mod) => {
        setSanitizedContent(mod.default.sanitize(comment.content))
      })
    }
  }, [comment.content])

  useEffect(() => {
    if (!contentRef.current || !sanitizedContent) {
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
  }, [sanitizedContent])

  return (
    <>
      {comment.quotedContent && (
        <Code
          color="primary"
          onClick={() => scrollIntoComment(comment.parentId)}
          className="cursor-pointer"
        >
          <span>{comment.quotedUsername}</span>
          <Chip
            endContent={<Quote className="text-primary-500 size-4" />}
            variant="light"
          >
            {comment.quotedContent}
          </Chip>
        </Code>
      )}
      {sanitizedContent ? (
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{
            __html: sanitizedContent
          }}
          className="kun-prose max-w-none"
        />
      ) : (
        <div className="animate-pulse h-4 bg-default-200 rounded w-3/4"></div>
      )}
    </>
  )
}

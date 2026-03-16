'use client'

import { Button } from '@heroui/react'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export const KunBackToTop = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let frameId = 0

    const handleScroll = () => {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        setShow(window.scrollY > 400)
        frameId = 0
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!show) {
    return null
  }

  return (
    <Button
      isIconOnly
      color="primary"
      className="fixed z-50 bottom-12 right-6"
      onPress={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6" />
    </Button>
  )
}

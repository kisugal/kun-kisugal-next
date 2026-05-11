'use client'

import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure
} from '@heroui/react'
import { Settings } from 'lucide-react'
import { ThemeSwitcher } from './top-bar/ThemeSwitcher'
import { NSFWSwitcher } from './top-bar/NSFWSwitcher'

const SettingsDrop = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button variant="light" onPress={onOpen} isIconOnly>
        <Settings className=" w-6 h-6 text-default-500" />
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="opaque"
        classNames={{
          // 轻量遮罩（不透明计算更简单）
          backdrop: 'bg-black/30',

          // 去掉透明叠加，减少 GPU 压力
          base: `
            bg-background
            border border-divider
            shadow-lg
          `
        }}
        motionProps={{
          // 👉 kungal 核心：只用 y + opacity
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 10 },

          // 👉 快速、干脆的曲线（接近 kungal / vercel）
          transition: {
            duration: 0.16,
            ease: [0.25, 1, 0.3, 1]
          }
        }}
      >
        <ModalContent className="w-auto will-change-transform">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                网站设置
              </ModalHeader>

              <ModalBody className="flex flex-col items-center gap-4 pb-6">
                <p className="text-sm text-default-500">主题切换</p>
                <ThemeSwitcher />

                <p className="text-sm text-default-500">内容过滤</p>
                <NSFWSwitcher />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default SettingsDrop

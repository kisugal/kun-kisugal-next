'use client'
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
        <Settings className="w-6 h-6" />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        className="bg-white/50 dark:bg-black/60 backdrop-blur-md"
      >
        <ModalContent className="w-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                网站设置
              </ModalHeader>
              <ModalBody className="flex justify-center flex-col items-center gap-4">
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

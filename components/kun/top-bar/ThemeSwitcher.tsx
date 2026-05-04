'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@heroui/button'
import { Moon, Sun, SunMoon } from 'lucide-react'

enum Theme {
  dark = 'dark',
  light = 'light',
  system = 'system'
}

enum ThemeLabel {
  dark = '深色',
  light = '浅色',
  system = '系统'
}

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<Theme>(Theme.system)

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme as Theme)
    }
  }, [theme])

  const renderItem = (value: Theme, icon: React.ReactNode) => (
    <>
      <div className="justify-center">
        <div className="flex justify-center">
          <Button
            className="w-15 h-15"
            variant={currentTheme === value ? 'solid' : 'light'}
            startContent={icon}
            onPress={() => {
              setTheme(value)
              setCurrentTheme(value)
            }}
            isIconOnly
          />
        </div>
        <p className="text-sm text-center mt-2">{ThemeLabel[value]}</p>
      </div>
    </>
  )

  return (
    <>
      <div className="flex gap-2">
        {renderItem(Theme.light, <Sun className="size-5" />)}
        {renderItem(Theme.dark, <Moon className="size-5" />)}
        {renderItem(Theme.system, <SunMoon className="size-5" />)}
      </div>
    </>
  )
}

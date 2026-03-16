'use client'

import { useState } from 'react'
import { Sidebar } from '~/components/layout/Sidebar'

export const SidebarShell = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
}

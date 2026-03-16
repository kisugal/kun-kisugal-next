import { KunFooter } from '~/components/kun/Footer'
import { SidebarShell } from './SidebarShell'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <SidebarShell />
      <div className="flex flex-col flex-1 w-0 overflow-y-auto">
        <div className="flex-grow px-4 sm:px-6 lg:px-8">{children}</div>
        <KunFooter />
      </div>
    </div>
  )
}

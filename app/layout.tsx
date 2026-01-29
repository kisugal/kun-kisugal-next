import '~/styles/index.css'
import { Providers } from '~/app/providers'
import { Toaster } from 'react-hot-toast'
import { cn } from '~/utils/cn'
import { KunTopBar } from '~/components/kun/top-bar/TopBar'
import { KunBackToTop } from '~/components/kun/BackToTop'
import { AppShell } from '~/components/layout/AppShell'
import { SnowWrapper } from '~/components/ui/SnowWrapper'
import { ENABLE_SNOW } from '~/config/featureFlags'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="U_BmJbgXvmhmO7Zf5_6b0Aiy60_Nh3sTycpHDp5loYw" />
        {/* 预连接到外部域名 */}
        <link rel="preconnect" href="https://cloud.umami.is" />
        <link rel="preconnect" href="https://was.arisumika.top" />
        <link rel="dns-prefetch" href="https://cloud.umami.is" />
        <link rel="dns-prefetch" href="https://was.arisumika.top" />
      </head>
      <body className={cn('min-h-screen bg-background antialiased')}>
        <Providers>
          <div className="relative flex flex-col h-screen">
            <KunTopBar />
            <Toaster />
            <AppShell>{children}</AppShell>
            <KunBackToTop />
          </div>
          <SnowWrapper enabled={ENABLE_SNOW} />
        </Providers>
      </body>
    </html>
  )
}
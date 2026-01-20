import '~/styles/index.css'
import Script from 'next/script'
import { Providers } from '~/app/providers'
import { Toaster } from 'react-hot-toast'
import { cn } from '~/utils/cn'
import { KunTopBar } from '~/components/kun/top-bar/TopBar'
import { KunBackToTop } from '~/components/kun/BackToTop'
import { AppShell } from '~/components/layout/AppShell'
import Snow from '~/components/ui/Snow'
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
          {ENABLE_SNOW && <Snow enabled={ENABLE_SNOW} />}
        </Providers>
        {/* 延迟加载统计脚本 */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="e9ab7228-7489-4a5f-841d-bf643f09e517"
          strategy="lazyOnload"
        />
        <Script
          src="https://was.arisumika.top/script.js"
          data-website-id="a7f17bf9-67ae-4dc9-b273-5bc1144d6039"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
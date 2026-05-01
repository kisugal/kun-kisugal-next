import '~/styles/index.css'
import { Providers } from '~/app/providers'
import { Toaster } from 'react-hot-toast'
import { KunNavigationBreadcrumb } from '~/components/kun/NavigationBreadcrumb'
import { cn } from '~/utils/cn'
import { KunTopBar } from '~/components/kun/top-bar/TopBar'
import { KunBackToTop } from '~/components/kun/BackToTop'
import { AppShell } from '~/components/layout/AppShell'
import { LazySnow } from '~/components/ui/LazySnow'
import { ENABLE_SNOW } from '~/config/featureFlags'

// export default function RootLayout({
//   children
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         {/* <meta name="google-site-verification" content="U_BmJbgXvmhmO7Zf5_6b0Aiy60_Nh3sTycpHDp5loYw" /> */}
//         <script
//           defer
//           src="https://umami.acgll.com/script.js"
//           data-website-id="64cac2dd-0bca-4041-907d-18eef228439c"
//         ></script>
//         {/* <script defer src="https://was.arisumika.top/script.js" data-website-id="a7f17bf9-67ae-4dc9-b273-5bc1144d6039"></script> */}
//       </head>
//       <body className={cn('min-h-screen bg-background antialiased')}>
//         <Providers>
//           <div className="relative flex flex-col h-screen">
//             <KunTopBar />
//             <Toaster />
//             <AppShell>{children}</AppShell>
//             <KunBackToTop />
//           </div>
//           <LazySnow enabled={ENABLE_SNOW} />
//         </Providers>
//       </body>
//     </html>
//   )
// }

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <meta name="google-site-verification" content="U_BmJbgXvmhmO7Zf5_6b0Aiy60_Nh3sTycpHDp5loYw" /> */}
        <script
          defer
          src="https://umami.acgll.com/script.js"
          data-website-id="64cac2dd-0bca-4041-907d-18eef228439c"
        ></script>
        {/* <script defer src="https://was.arisumika.top/script.js" data-website-id="a7f17bf9-67ae-4dc9-b273-5bc1144d6039"></script> */}
      </head>
      <body className={cn('min-h-screen bg-background antialiased')}>
        {children}
      </body>
    </html>
  )
}

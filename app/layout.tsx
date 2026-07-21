import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'
import ClientLanguageProvider from '@/components/i18n/ClientLanguageProvider'
import ClientThemeProvider from '@/components/theme/ClientThemeProvider'
import ClientAuthProvider from '@/providers/ClientAuthProvider'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://independence-club.vercel.app'

export const metadata: Metadata = {
  title: {
    template: '%s | نادي الاستقلالية',
    default: 'نادي الاستقلالية | Independence Club',
  },
  description: 'منصة تعليمية تفاعلية لاستراتيجيات إدارة الفصل الدراسي',
  icons: {
    icon: '/hp.jpg',
  },
  openGraph: {
    title: 'نادي الاستقلالية | Independence Club',
    description: 'منصة تعليمية تفاعلية لاستراتيجيات إدارة الفصل الدراسي',
    url: siteUrl,
    siteName: 'Independence Club',
    locale: 'ar_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نادي الاستقلالية | Independence Club',
    description: 'منصة تعليمية تفاعلية لاستراتيجيات إدارة الفصل الدراسي',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <ClientAuthProvider>
          <ClientThemeProvider>
            <ClientLanguageProvider>
              {children}
            </ClientLanguageProvider>
          </ClientThemeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  )
}

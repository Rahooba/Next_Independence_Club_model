import type { Metadata } from 'next'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: {
    template: '%s | نادي الاستقلالية',
    default: 'نادي الاستقلالية | Independence Club',
  },
  description: 'منصة تعليمية تفاعلية لاستراتيجيات إدارة الفصل الدراسي',
  openGraph: {
    title: 'نادي الاستقلالية | Independence Club',
    description: 'منصة تعليمية تفاعلية لاستراتيجيات إدارة الفصل الدراسي',
    type: 'website',
    locale: 'ar_AR',
    siteName: 'Independence Club',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نادي الاستقلالية | Independence Club',
    description: 'منصة تعليمية تفاعلية لاستراتيجيات إدارة الفصل الدراسي',
  },
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout>{children}</Layout>
}

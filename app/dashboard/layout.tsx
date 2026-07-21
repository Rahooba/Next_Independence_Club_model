'use client'

import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@/hooks/useUser';
import { DashboardProvider } from '@/providers/DashboardProvider';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import FloatingToggle from '@/components/dashboard/FloatingToggle';
import GlobalLoading from '@/components/ui/GlobalLoading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
  const { loading } = useUser();

  return (
    <DashboardProvider>
      {loading ? (
        <GlobalLoading />
      ) : (
        <div className="db-root" style={{ minHeight: '100vh', background: tokens.bg, fontFamily: "'Tajawal', sans-serif", transition: 'background 0.2s' }}>
          <Sidebar />
          <div className="db-main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopBar />
            <main style={{ flex: 1, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
              <div className="db-content" style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 4vw, 32px)' }}>
                {children}
              </div>
            </main>
          </div>
          <FloatingToggle />
          <style>{`
            .db-main { transition: margin-right 0.25s cubic-bezier(0.25,0.1,0.25,1); }
            @media (min-width: 1024px) {
              .db-main { margin-right: 276px; }
            }
            @media (max-width: 1023px) {
              .db-main { margin-right: 0 !important; }
            }
          `}</style>
        </div>
      )}
    </DashboardProvider>
  );
}

'use client'

import { AuthProvider } from '@/providers/AuthProvider';

export default function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

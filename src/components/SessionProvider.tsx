"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardStore } from '@/store/useDashboardStore';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setSession } = useDashboardStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // We intentionally disable strict server-side session syncing here.
    // In cross-origin deployments (Vercel Frontend -> Render Backend),
    // modern browsers (Safari, Brave, Chrome Incognito) block third-party cookies.
    // If we rely on /api/auth/me to validate the session, it will fail and wipe
    // the user's local state, trapping them in an infinite login loop.
  useEffect(() => {
    // Avoid synchronous setState in effect, wrap in microtask or timeout
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Don't render children until we've at least checked the session
  // to avoid flash of content before redirect
  if (isChecking) {
    return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading Session...</div>;
  }

  return <>{children}</>;
}

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
    const checkSession = async () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const apiHost = process.env.NEXT_PUBLIC_WS_URL 
          ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
          : `${protocol}//${window.location.hostname}:8000`;

        const res = await fetch(`${apiHost}/api/auth/me`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          // Update local store with authenticated name
          setSession(data.name, data.user_id);

          // Redirection Logic
          if (data.current_meeting && pathname !== '/meeting') {
             // User is IN a meeting, but navigating away. Pull them back.
             router.push(`/meeting?meetingId=${data.current_meeting}`);
          }
        } else {
          // Not logged in. 
          // Clear local state to force the login screen on the dashboard!
          setUser('');
          
          if (pathname !== '/' && pathname !== '/launch' && pathname !== '/join') {
             router.push('/'); // Force them out to login screen!
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
        setUser('');
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [pathname, router, setSession, setUser]);

  // Don't render children until we've at least checked the session
  // to avoid flash of content before redirect
  if (isChecking) {
    return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading Session...</div>;
  }

  return <>{children}</>;
}

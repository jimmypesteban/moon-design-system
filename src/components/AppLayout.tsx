'use client';

import React from 'react';
import { TopNav } from './TopNav';

interface AppLayoutProps {
  appName: string;
  dashboardUrl?: string;
  children: React.ReactNode;
  user?: {
    name?: string;
    email: string;
  } | null;
  onLogout?: () => void;
}

export function AppLayout({ appName, dashboardUrl, children, user, onLogout }: AppLayoutProps) {
  return (
    <>
      <TopNav
        appName={appName}
        dashboardUrl={dashboardUrl}
        user={user}
        onLogout={onLogout}
      />
      {/* `id` so a skip link has somewhere to land. Without a target, a skip
          link is decoration. */}
      <main id="main-content">
        {children}
      </main>
    </>
  );
}

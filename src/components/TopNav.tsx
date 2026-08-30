'use client';

import React from 'react';
import { getDashboardUrl } from '../utils/getDashboardUrl';
import { fontFamily } from '../../tokens.mjs';

const BODY_FONT = fontFamily.body.join(', ');

interface TopNavProps {
  appName: string;
  dashboardUrl?: string;
  user?: {
    name?: string;
    email: string;
  } | null;
  onLogout?: () => void;
  /** Logo asset for the top-left slot. Defaults to the root-relative public
   * path consuming apps serve; Storybook passes a bundled import so the
   * demo works when the site is hosted under a subpath. */
  logoSrc?: string;
}

// Default logo asset path — consuming apps serve their own copy from
// /public (.storybook/public/ holds the Storybook demo's copy).
const MOON_LOGO = '/moon-logo-black.svg';

export function TopNav({ appName, dashboardUrl, user, onLogout, logoSrc = MOON_LOGO }: TopNavProps) {
  const defaultDashboardUrl = getDashboardUrl(dashboardUrl);

  return (
    // Labelled because it is not the only <nav> on a page: Breadcrumb,
    // Pagination and StepperNav each render one too, and a screen reader
    // lists landmarks by role — so without this the PRIMARY navigation is
    // the one announced as just "navigation" while the others say what
    // they are.
    <nav aria-label="Main" style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: BODY_FONT
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        {/* Left side: Logo/Brand and App Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Home button - links to dashboard */}
          <a
            href={defaultDashboardUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#1f2937',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#1f2937'}
          >
            <img
              src={logoSrc}
              alt="Moon"
              style={{
                height: '32px',
                width: 'auto'
              }}
            />
          </a>

          {/* Separator */}
          <div style={{
            height: '24px',
            width: '1px',
            background: '#e5e7eb'
          }} />

          {/* Current App Name */}
          <span style={{
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {appName}
          </span>
        </div>

        {/* Right side: User info and actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              {/* User info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '2px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {user.name || 'User'}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {user.email}
                </span>
              </div>

              {/* Logout button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  Logout
                </button>
              )}
            </>
          ) : (
            /* Not logged in state */
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Not logged in
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

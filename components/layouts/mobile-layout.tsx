'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DashboardOutlined,
  FileTextOutlined,
  SnippetsOutlined,
  CalendarOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const tabs = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/articles', icon: <FileTextOutlined />, label: '文章' },
  { key: '/templates', icon: <SnippetsOutlined />, label: '模板' },
  { key: '/calendar', icon: <CalendarOutlined />, label: '日历' },
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
];

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const activeKey = tabs.find(
    (t) => pathname === t.key || (t.key !== '/dashboard' && pathname.startsWith(t.key))
  )?.key || '/dashboard';

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}>
      <main style={{ padding: '0 12px' }}>{children}</main>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(15, 13, 21, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212, 165, 116, 0.15)',
        padding: '6px 8px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                minHeight: 44,
                minWidth: 64,
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#FF2442' : '#7A6F8A',
                background: isActive ? 'rgba(255, 36, 66, 0.1)' : 'transparent',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  background: '#FF2442',
                }} />
              )}
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

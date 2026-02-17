'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, Button, Typography, App } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { AppLayout } from '@/components/app-layout';
import { PageHeader } from '@/components/mobile-page-header';
import { useIsMobile } from '@/components/hooks/use-breakpoint';

const { Text } = Typography;

export default function SettingsPage() {
  const router = useRouter();
  const { token, clearToken } = useAuthStore();
  const isMobile = useIsMobile();
  const { modal } = App.useApp();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleLogout = () => {
    modal.confirm({
      title: '确定退出登录吗？',
      onOk: () => {
        clearToken();
        router.push('/login');
      },
    });
  };

  return (
    <AppLayout>
      <div>
        <PageHeader
          title="设置"
          subtitle="管理你的账户和偏好设置"
        />

        <Card
          title={
            <span>
              <SettingOutlined style={{ marginRight: 8, color: '#7A6F8A' }} />
              系统设置
            </span>
          }
        >
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#7A6F8A' }}>
            设置功能即将推出...
          </div>
        </Card>

        {isMobile && (
          <Button
            block
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              marginTop: 24,
              minHeight: 44,
              color: '#DC2626',
              borderColor: 'rgba(220, 38, 38, 0.3)',
            }}
          >
            退出登录
          </Button>
        )}
      </div>
    </AppLayout>
  );
}

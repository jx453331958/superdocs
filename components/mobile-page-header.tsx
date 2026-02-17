'use client';

import { Typography } from 'antd';
import { useIsMobile } from '@/components/hooks/use-breakpoint';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
        marginBottom: 12,
      }}>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        {extra}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 16,
    }}>
      <div>
        <Title level={3} style={{ marginBottom: 4 }}>{title}</Title>
        {subtitle && <Text type="secondary">{subtitle}</Text>}
      </div>
      {extra}
    </div>
  );
}

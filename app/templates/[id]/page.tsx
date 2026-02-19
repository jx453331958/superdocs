'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/use-auth';
import { apiRequest } from '@/lib/api-client';
import { ArticleTemplate } from '@/types/article-template';
import { Button, Input, Card, Space, Spin, Typography, App } from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { AppLayout } from '@/components/app-layout';
import { useIsMobile } from '@/components/hooks/use-breakpoint';

const { Text } = Typography;

export default function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ready } = useAuth();
  const { message, modal } = App.useApp();
  const isMobile = useIsMobile();

  const [template, setTemplate] = useState<ArticleTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    loadTemplate();
  }, [id, ready]);

  const loadTemplate = async () => {
    try {
      const data = await apiRequest<ArticleTemplate>(`/api/templates/${id}`);
      setTemplate(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setContent(data.content || '');
      setTags(data.tags.join(', '));
      setCategory(data.category || '');
    } catch (error: any) {
      message.error(error.message || '加载模板失败');
      router.push('/templates');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const updated = await apiRequest<ArticleTemplate>(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description: description || null, content, tags: tagArray, category: category || null }),
      });
      setTemplate(updated);
      message.success('保存成功');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    modal.confirm({
      title: '确定删除此模板吗？',
      content: '删除后无法恢复。',
      okButtonProps: { danger: true },
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiRequest(`/api/templates/${id}`, { method: 'DELETE' });
          message.success('模板已删除');
          router.push('/templates');
        } catch (error: any) {
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  if (!template) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ paddingBottom: isMobile ? 24 : 0 }}>
        {/* 顶部操作栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 8,
        }}>
          <Space>
            <Link href="/templates">
              <Button icon={<ArrowLeftOutlined />} type="text" style={{ minWidth: 44, minHeight: 44 }} />
            </Link>
            {!isMobile && <Text strong ellipsis style={{ maxWidth: 300 }}>{title}</Text>}
          </Space>
          <Space>
            <Button
              icon={<CopyOutlined />}
              type="text"
              style={{ minWidth: 44, minHeight: 44 }}
              onClick={() => {
                navigator.clipboard.writeText(content).then(
                  () => message.success('内容已复制'),
                  () => message.error('复制失败'),
                );
              }}
            >
              {!isMobile && '复制内容'}
            </Button>
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
              style={{ minWidth: 44, minHeight: 44 }}
              onClick={handleDelete}
            >
              {!isMobile && '删除'}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              style={{ minHeight: 44 }}
            >
              保存
            </Button>
          </Space>
        </div>

        {/* 基本信息 */}
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>标题</Text>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="模板标题" />
            </div>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>描述</Text>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="模板描述" />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>分类</Text>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如 css_theme, content_type" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>标签（逗号分隔）</Text>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="dark, 科技风" />
              </div>
            </div>
          </Space>
        </Card>

        {/* 内容编辑 */}
        <Card title="模板内容">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: isMobile ? 400 : 600,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
              fontSize: 13,
              lineHeight: 1.6,
              background: '#1a1625',
              color: '#e0d8ec',
              border: '1px solid #3d3552',
              borderRadius: 6,
              padding: 16,
              resize: 'vertical',
              tabSize: 2,
            }}
            spellCheck={false}
          />
        </Card>
      </div>
    </AppLayout>
  );
}

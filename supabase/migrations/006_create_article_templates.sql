-- 文章模板表
CREATE TABLE IF NOT EXISTS article_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_templates_category ON article_templates(category);
CREATE INDEX IF NOT EXISTS idx_article_templates_created_at ON article_templates(created_at DESC);

-- 复用已有的 updated_at trigger 函数
DROP TRIGGER IF EXISTS update_article_templates_updated_at ON article_templates;
CREATE TRIGGER update_article_templates_updated_at BEFORE UPDATE ON article_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 通知 PostgREST 刷新 schema cache
NOTIFY pgrst, 'reload schema';

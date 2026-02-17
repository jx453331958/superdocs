-- 002_enable_rls.sql
-- 启用 Row Level Security，阻止 anon/authenticated 角色直接通过 Supabase REST API 操作数据
-- service_role 拥有 BYPASSRLS 权限，Next.js API Routes 和 Studio 不受影响
--
-- 使用方式: psql -U supabase_admin -d postgres < 002_enable_rls.sql

-- 启用 RLS（无策略 = 默认拒绝所有非 BYPASSRLS 角色的访问）
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_stats ENABLE ROW LEVEL SECURITY;

-- 撤销 anon 和 authenticated 角色对这些表的所有权限
REVOKE ALL ON articles FROM anon, authenticated;
REVOKE ALL ON article_versions FROM anon, authenticated;
REVOKE ALL ON article_images FROM anon, authenticated;
REVOKE ALL ON article_stats FROM anon, authenticated;

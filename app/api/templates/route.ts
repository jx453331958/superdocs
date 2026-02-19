import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { withAuth, errorResponse, successResponse } from '@/lib/auth';
import { ArticleTemplate } from '@/types/article-template';

/**
 * GET /api/templates - 获取模板列表
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getServiceSupabase();
    let query = supabase
      .from('article_templates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return successResponse({
      templates: data as ArticleTemplate[],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('获取模板列表失败:', error);
    return errorResponse(error.message || '获取模板列表失败', 500);
  }
});

/**
 * POST /api/templates - 创建模板
 */
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { title, description, content, tags, category } = body;

    if (!title) {
      return errorResponse('标题不能为空');
    }

    const supabase = getServiceSupabase();

    const { data: template, error } = await supabase
      .from('article_templates')
      .insert({
        title,
        description: description || null,
        content: content || null,
        tags: tags || [],
        category: category || null,
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(template as ArticleTemplate, 201);
  } catch (error: any) {
    console.error('创建模板失败:', error);
    return errorResponse(error.message || '创建模板失败', 500);
  }
});

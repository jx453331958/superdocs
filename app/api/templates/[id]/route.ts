import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { withAuth, errorResponse, successResponse } from '@/lib/auth';
import { ArticleTemplate } from '@/types/article-template';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/templates/:id - 获取模板详情
 */
export const GET = withAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const supabase = getServiceSupabase();

    const { data: template, error } = await supabase
      .from('article_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('模板不存在', 404);
      }
      throw error;
    }

    return successResponse(template as ArticleTemplate);
  } catch (error: any) {
    console.error('获取模板详情失败:', error);
    return errorResponse(error.message || '获取模板详情失败', 500);
  }
});

/**
 * PUT /api/templates/:id - 更新模板
 */
export const PUT = withAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { title, description, content, tags, category } = body;

    const supabase = getServiceSupabase();

    const { data: current, error: fetchError } = await supabase
      .from('article_templates')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('模板不存在', 404);
      }
      throw fetchError;
    }

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    if (category !== undefined) updates.category = category;

    const { data: updated, error: updateError } = await supabase
      .from('article_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return successResponse(updated as ArticleTemplate);
  } catch (error: any) {
    console.error('更新模板失败:', error);
    return errorResponse(error.message || '更新模板失败', 500);
  }
});

/**
 * DELETE /api/templates/:id - 删除模板
 */
export const DELETE = withAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('article_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return successResponse({ message: '模板已删除' });
  } catch (error: any) {
    console.error('删除模板失败:', error);
    return errorResponse(error.message || '删除模板失败', 500);
  }
});

export interface ArticleTemplate {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
}

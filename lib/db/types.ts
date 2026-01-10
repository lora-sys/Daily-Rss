/**
 * 业务层类型定义（与数据库类型分离）
 */

// 新闻源
export interface NewsSource {
  id: string;
  name: string;
  type: "direct_feed" | "rsshub";
  feed_url?: string | null;
  rsshub_route?: string | null;
  rsshub_params?: Record<string, any> | null;
  category: string[];
  priority: number;
  is_active: boolean;
}

// 新闻文章
export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  description?: string | null;
  content: string;
  source_name: string;
  source_id?: string | null;
  category: string[];
  pub_date: string;
  created_at: string;
}

// 抓取结果
export interface FetchResult {
  source: NewsSource;
  articles: Array<{
    title: string;
    link: string;
    description?: string;
    content: string;
    pubDate?: string;
  }>;
  success: boolean;
  error?: string;
  duration: number;
}

// 抓取统计
export interface FetchStats {
  totalSources: number;
  successCount: number;
  failureCount: number;
  totalArticles: number;
  totalNewArticles: number;
  totalDuplicates: number;
  duration: number;
}

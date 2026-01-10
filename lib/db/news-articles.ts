import { supabase } from "@/lib/supabase";
import { NewsArticle } from "./types";

/**
 * 手写分块工具函数
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 批量保存文章（upsert）- 支持分块处理大量数据
 */
export async function saveArticeles(
  articles: Array<{
    link: string;
    title: string;
    description?: string;
    content: string;
    source_id?: string;
    source_name: string;
    category: string[];
    pub_date: string;
  }>,
): Promise<{ saved: number; duplicates: number }> {
  try {
    if (articles.length === 0) {
      return { saved: 0, duplicates: 0 };
    }

    const formattedArticles = articles.map((item) => ({
      link: item.link,
      title: item.title,
      description: item.description || null,
      content: item.content,
      source_id: item.source_id || null,
      source_name: item.source_name,
      category: item.category,
      pub_date: item.pub_date,
      metadata: {},
    }));

    // 分块处理：每次最多 100 条
    const chunks = chunkArray(formattedArticles, 100);
    let totalSaved = 0;
    let totalDuplicates = 0;

    console.log(
      `📦 开始分块保存: 共 ${formattedArticles.length} 条文章, 分为 ${chunks.length} 块`,
    );

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `⏳ 处理第 ${i + 1}/${chunks.length} 块 (${chunk.length} 条)...`,
      );

      const { data, error } = await supabase
        .from("news_articles")
        .upsert(chunk, { onConflict: "link" })
        .select("id");

      if (error) throw error;

      const savedCount = data?.length || 0;
      const duplicatesCount = chunk.length - savedCount;

      totalSaved += savedCount;
      totalDuplicates += duplicatesCount;

      console.log(
        `✅ 第 ${i + 1} 块完成: ${savedCount} 新增, ${duplicatesCount} 重复`,
      );
    }

    console.log(
      `✅ 全部文章保存完成: ${totalSaved} 新增, ${totalDuplicates} 重复`,
    );

    return {
      saved: totalSaved,
      duplicates: totalDuplicates,
    };
  } catch (error) {
    console.error("❌ 保存文章失败:", error);
    throw error;
  }
}

/**
 * 获取指定日期的文章
 */
export async function getArticlesByDate(
  date: string,
  categories?: string[],
): Promise<NewsArticle[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from("news_articles")
      .select("*")
      .gte("pub_date", `${date}T00:00:00Z`)
      .lt("pub_date", `${date}T23:59:59Z`);

    if (categories && categories.length > 0) {
      query = query.overlaps("category", categories);
    }

    const { data, error } = await query.order("pub_date", {
      ascending: false,
    });

    if (error) throw error;
    return (data || []) as NewsArticle[];
  } catch (error) {
    console.error("❌ 获取文章失败:", error);
    throw error;
  }
}

/**
 * 检查文章是否存在
 */
export async function articleExists(link: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from("news_articles")
      .select("id", { count: "exact", head: true })
      .eq("link", link);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error) {
    console.error("❌ 检查文章失败:", error);
    return false;
  }
}

/**
 * 获取最近 N 天的热门文章
 */
export async function getTrendingArticles(
  days: number = 7,
  limit: number = 10,
): Promise<NewsArticle[]> {
  try {
     
    const { data, error } = await (
      supabase
        .from("news_articles")
        .select("*")
        .gte(
          "pub_date",
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        ) as any
    )
      .order("pub_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as NewsArticle[];
  } catch (error) {
    console.error("❌ 获取热门文章失败:", error);
    return [];
  }
}

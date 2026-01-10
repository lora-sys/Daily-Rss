import { supabase } from "@/lib/supabase";
import { NewsSource } from "./types";

/**
 * 获取所有激活的新闻源
 */
export async function getActiveSources(): Promise<NewsSource[]> {
  try {
    const { data, error } = await supabase
      .from("news_sources")
      .select(
        "id, name, type, feed_url, rsshub_route, rsshub_params, category, priority, is_active"
      )
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (error) throw error;

    console.log(`✅ 获取 ${data?.length || 0} 个激活的新闻源`);
    return (data || []) as NewsSource[];
  } catch (error) {
    console.error("❌ 获取新闻源失败:", error);
    throw error;
  }
}

/**
 * 更新源的抓取状态
 */
export async function updateSourceStats(
  sourceId: string,
  status: "success" | "failed",
  articlesCount: number = 0,
  errorMessage?: string,
): Promise<void> {
  try {
    const now = new Date().toISOString();

    const { data: currentStats } = await supabase
      .from("news_sources")
      .select("success_count, failure_count")
      .eq("id", sourceId)
      .single();

    if (!currentStats) {
      console.warn(`⚠️  未找到源: ${sourceId}`);
      return;
    }

    if (status === "success") {
      const { error } = await supabase
        .from("news_sources")
        .update({
          success_count: currentStats.success_count + 1,
          last_fetched_at: now,
          last_success_at: now,
          last_error: null,
        })
        .eq("id", sourceId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("news_sources")
        .update({
          failure_count: currentStats.failure_count + 1,
          last_fetched_at: now,
          last_error: errorMessage || "Unknown error",
        })
        .eq("id", sourceId);

      if (error) throw error;
    }

    console.log(`✅ 更新源状态: ${sourceId} - ${status}`);
  } catch (error) {
    console.error(`❌ 更新源状态失败:`, error);
    throw error;
  }
}

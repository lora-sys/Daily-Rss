import Parser from "rss-parser";
import { getActiveSources, updateSourceStats, saveArticeles } from "@/lib/db";
import type { NewsSource, FetchStats } from "@/lib/db/types";

const parser = new Parser({
  timeout: 15000, // 15秒超时
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

/**
 * 导出接口 - 格式化用的新闻项
 */
export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string | null;
  source: string;
}

/**
 * 从单个 RSS 源抓取文章
 */
async function fetchRSSFeed(source: NewsSource): Promise<{
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
}> {
  const startTime = Date.now();

  try {
    let feedUrl = source.feed_url;

    if (source.type === "rsshub") {
      if (!source.rsshub_route) {
        throw new Error("RSSHub route is missing");
      }
      const rsshubBaseUrl =
        process.env.RSSHUB_BASE_URL || "https://rss.appree.com";
      feedUrl = `${rsshubBaseUrl}${source.rsshub_route}`;
    }

    if (!feedUrl) {
      throw new Error("Feed URL is empty");
    }

    console.log(`🔄 抓取源: ${source.name} (${feedUrl})`);

    const feed = await parser.parseURL(feedUrl);
    const items = (feed.items || []).slice(0, 10); // 取前 10 条

    const articles = items
      .map((item) => ({
        title: item.title || "Untitled",
        link: item.link || "",
        description: item.contentSnippet || "",
        content: item.content || item.contentSnippet || item.description || "",
        pubDate: item.pubDate || new Date().toISOString(),
      }))
      .filter((a) => a.link); // 过滤掉没有链接的

    const duration = Date.now() - startTime;

    console.log(
      `✅ ${source.name}: 获取 ${articles.length} 篇文章 (${duration}ms)`,
    );

    return {
      articles,
      success: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    console.error(`❌ ${source.name} 抓取失败: ${errorMsg} (${duration}ms)`);

    return {
      articles: [],
      success: false,
      error: errorMsg,
      duration,
    };
  }
}

/**
 * 核心函数：从数据库读取源并抓取
 */
export async function fetchAllNewsFromDB(): Promise<{
  stats: FetchStats;
  articles: NewsItem[];
}> {
  const startTime = Date.now();

  try {
    console.log("\n========== 📡 开始每日新闻抓取 ==========\n");

    // 1️⃣ 从数据库获取激活的源
    console.log("📋 步骤 1: 从数据库读取激活源...");
    const sources = await getActiveSources();
    console.log(`✅ 获取到 ${sources.length} 个激活源\n`);

    if (sources.length === 0) {
      console.warn("⚠️  没有激活的新闻源，跳过抓取");
      return {
        stats: {
          totalSources: 0,
          successCount: 0,
          failureCount: 0,
          totalArticles: 0,
          totalNewArticles: 0,
          totalDuplicates: 0,
          duration: Date.now() - startTime,
        },
        articles: [],
      };
    }

    // 2️⃣ 并行抓取所有源
    console.log("🔄 步骤 2: 并行抓取所有源...");
    const fetchResults = await Promise.all(
      sources.map((source) => fetchRSSFeed(source)),
    );

    // 3️⃣ 处理抓取结果
    console.log("\n💾 步骤 3: 处理并保存结果...");

    let totalNewArticles = 0;
    let totalDuplicates = 0;
    let successCount = 0;
    let failureCount = 0;
    const allArticles: NewsItem[] = [];

    for (let i = 0; i < fetchResults.length; i++) {
      const result = fetchResults[i];
      const source = sources[i];

      if (result.success) {
        successCount++;

        // 准备数据格式用于保存
        const articlesForSave = result.articles.map((article) => ({
          link: article.link,
          title: article.title,
          description: article.description,
          content: article.content,
          source_id: source.id,
          source_name: source.name,
          category: source.category,
          pub_date: article.pubDate || new Date().toISOString(),
        }));

        // 保存到数据库
        const { saved, duplicates } = await saveArticeles(articlesForSave);

        totalNewArticles += saved;
        totalDuplicates += duplicates;

        // 更新源的成功状态
        await updateSourceStats(source.id, "success", result.articles.length);

        // 收集文章用于返回
        result.articles.forEach((article) => {
          allArticles.push({
            title: article.title,
            link: article.link,
            pubDate: article.pubDate,
            description: article.description,
            source: source.name,
          });
        });
      } else {
        failureCount++;
        console.log(`⚠️  ${source.name} 失败，更新失败状态...`);
        await updateSourceStats(source.id, "failed", 0, result.error);
      }
    }

    const duration = Date.now() - startTime;

    const stats: FetchStats = {
      totalSources: sources.length,
      successCount,
      failureCount,
      totalArticles: allArticles.length,
      totalNewArticles,
      totalDuplicates,
      duration,
    };

    // 打印总结
    console.log("\n========== 📊 抓取完成 ==========");
    console.log(`总源数: ${stats.totalSources}`);
    console.log(`成功: ${stats.successCount} | 失败: ${stats.failureCount}`);
    console.log(
      `文章: 新增 ${stats.totalNewArticles} | 重复 ${stats.totalDuplicates}`,
    );
    console.log(
      `总耗时: ${stats.duration}ms (${(stats.duration / 1000).toFixed(2)}s)`,
    );
    console.log("=====================================\n");

    // 排序
    allArticles.sort((a, b) => {
      if (!a.pubDate || !b.pubDate) return 0;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    return {
      stats,
      articles: allArticles,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ 抓取流程失败:", errorMsg);
    throw error;
  }
}

/**
 * 旧接口保留用于兼容 - 直接从硬编码源抓取（不存数据库）
 * @deprecated 建议使用 fetchAllNewsFromDB 替代
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  console.warn("⚠️  警告: fetchAllNews 已弃用，建议使用 fetchAllNewsFromDB");
  const { articles } = await fetchAllNewsFromDB();
  return articles;
}

/**
 * 整理新闻为每日摘要格式
 */
export function formatNewsSummary(newsItems: NewsItem[]): {
  summary: string;
  html: string;
} {
  // 选择前 15 条最重要的新闻
  const topNews = newsItems.slice(0, 15);

  // 按来源分组
  const newsBySource = topNews.reduce(
    (acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = [];
      }
      acc[item.source].push(item);
      return acc;
    },
    {} as Record<string, NewsItem[]>,
  );

  // 生成纯文本摘要
  let summaryText = "📰 每日新闻摘要\n\n";
  Object.entries(newsBySource).forEach(([source, items]) => {
    summaryText += `\n【${source}】\n`;
    items.forEach((item, index) => {
      summaryText += `${index + 1}. ${item.title}\n`;
      if (item.description) {
        const shortDesc = item.description.substring(0, 100);
        summaryText += `   ${shortDesc}${item.description.length > 100 ? "..." : ""}\n`;
      }
      summaryText += `   链接: ${item.link}\n\n`;
    });
  });

  // 生成 HTML 格式
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">
        📰 每日新闻摘要
      </h1>
      <p style="color: #666; font-size: 14px;">
        ${new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>
  `;

  Object.entries(newsBySource).forEach(([source, items]) => {
    htmlContent += `
      <div style="margin: 30px 0;">
        <h2 style="color: #007bff; border-left: 4px solid #007bff; padding-left: 10px;">
          ${source}
        </h2>
    `;

    items.forEach((item) => {
      htmlContent += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">
            <a href="${item.link}" style="color: #007bff; text-decoration: none;">
              ${item.title}
            </a>
          </h3>
          ${
            item.description
              ? `
            <p style="color: #666; line-height: 1.6; margin: 10px 0;">
              ${item.description.substring(0, 200)}${item.description.length > 200 ? "..." : ""}
            </p>
          `
              : ""
          }
          ${
            item.pubDate
              ? `
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              📅 ${new Date(item.pubDate).toLocaleString("zh-CN")}
            </p>
          `
              : ""
          }
          <a href="${item.link}" style="color: #007bff; text-decoration: none; font-size: 14px;">
            阅读更多 →
          </a>
        </div>
      `;
    });

    htmlContent += `</div>`;
  });

  htmlContent += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
        <p>感谢订阅每日新闻摘要</p>
        <p>本摘要由多个新闻源自动整理生成</p>
      </div>
    </div>
  `;

  return {
    summary: summaryText,
    html: htmlContent,
  };
}

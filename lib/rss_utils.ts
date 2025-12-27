import Parser from "rss-parser";

const parser = new Parser();

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  source: string;
}

// 定义多个新闻 RSS 源
const RSS_FEEDS = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
  },
  {
    name: "The Decision Lab",
    url: "https://www.thedecisionlab.com/feed/",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/full.xml",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss/",
  },
  {
    name: "DeepMind",
    url: "https://deepmind.com/blog/feed/basic/",
  },
  {
    name: "Stripe Blog",
    url: "https://stripe.com/blog/feed.rss",
  },
  {
    name: "First Round Review",
    url: "https://firstround.com/review/feed.xml",
  },
  {
    name: "The Pragmatic Engineer",
    url: "https://blog.pragmaticengineer.com/rss/",
  },
  {
    name: "MIT News - AI",
    url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
  },
];

/**
 * 从单个 RSS 源获取新闻
 */
async function fetchRSSFeed(
  feedUrl: string,
  sourceName: string,
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: NewsItem[] = (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || undefined,
      description: item.contentSnippet || item.content || "",
      source: sourceName,
    }));
    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${sourceName}:`, error);
    return [];
  }
}

/**
 * 从所有 RSS 源获取新闻并整理
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  const allNewsPromises = RSS_FEEDS.map((feed) =>
    fetchRSSFeed(feed.url, feed.name),
  );

  const allNewsArrays = await Promise.all(allNewsPromises);
  const allNews = allNewsArrays.flat();

  // 按发布时间排序（最新的在前）
  return allNews.sort((a, b) => {
    if (!a.pubDate || !b.pubDate) return 0;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
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
            Read More →
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

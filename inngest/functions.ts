import { fetchAllNewsFromDB, formatNewsSummary } from "@/lib/rss_utils";
import { getArticlesByDate } from "@/lib/db";
import { inngest } from "./client";
import { Resend } from "resend";

/**
 * 测试函数 - 简单的 Hello World
 */
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { message: `Hello ${(event.data as any).email}!` };
  }
);

/**
 * 核心函数：每日新闻抓取 + 邮件发送
 *
 * 执行流程：
 * 1. 从数据库抓取所有激活源的新闻
 * 2. 格式化为 HTML 摘要
 * 3. 通过 Resend 发送邮件给订阅者
 * 4. 记录发送结果
 */
export const sendDailyNews = inngest.createFunction(
  { id: "send-daily-news" },
  { cron: "15 4 * * *" }, // 北京时间 12:15 执行
  async ({ step }) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // ========== Step 1: 抓取新闻 ==========
      const fetchResult = await step.run("fetch-news", async () => {
        console.log("🔄 开始抓取新闻...");
        try {
          const { stats, articles } = await fetchAllNewsFromDB();

          console.log("✅ 新闻抓取完成");
          console.log(`   - 成功源: ${stats.successCount}/${stats.totalSources}`);
          console.log(`   - 新增文章: ${stats.totalNewArticles}`);
          console.log(`   - 重复文章: ${stats.totalDuplicates}`);
          console.log(`   - 总耗时: ${(stats.duration / 1000).toFixed(2)}s`);

          return {
            stats,
            articles,
          };
        } catch (error) {
          console.error("❌ 新闻抓取失败:", error);
          throw error;
        }
      });

      // ========== Step 2: 从数据库获取今天的文章用于邮件 ==========
      const todayArticles = await step.run("get-today-articles", async () => {
        console.log("📰 获取今天的文章...");
        try {
          const articles = await getArticlesByDate(today);
          console.log(`✅ 获取到 ${articles.length} 篇文章`);
          return articles;
        } catch (error) {
          console.error("❌ 获取文章失败:", error);
          throw error;
        }
      });

      // ========== Step 3: 格式化新闻摘要 ==========
      const summary = await step.run("format-news", async () => {
        console.log("📝 格式化新闻摘要...");
        try {
          // 转换为 NewsItem 格式
          const newsItems = todayArticles.map((article) => ({
            title: article.title,
            link: article.link,
            pubDate: article.pub_date,
            description: article.description || undefined,
            source: article.source_name,
          }));

          const formatted = formatNewsSummary(newsItems);
          console.log("✅ 摘要格式化完成");
          return formatted;
        } catch (error) {
          console.error("❌ 格式化失败:", error);
          throw error;
        }
      });

      // ========== Step 4: 创建邮件 ==========
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailResult = await step.run("create-email", async () => {
        console.log("✉️ 创建邮件广播...");
        try {
          const result = await resend.broadcasts.create({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            subject:
              "Daily Briefs of AI - " +
              new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            segmentId: process.env.RESEND_SEGMENT_ID || "",
            html: summary.html,
          });

          if (result.error) {
            console.error("❌ 邮件创建失败:", result.error);
            throw new Error(result.error.message);
          }

          console.log(`✅ 邮件创建成功, ID: ${result.data?.id}`);
          return result;
        } catch (error) {
          console.error("❌ 创建邮件失败:", error);
          throw error;
        }
      });

      // 检查邮件创建是否成功
      if (!emailResult.data?.id) {
        throw new Error("Email creation failed: No broadcast ID returned");
      }

      // ========== Step 5: 发送邮件 ==========
      const sendResult = await step.run("send-email", async () => {
        console.log(`📤 发送邮件广播 (ID: ${emailResult.data!.id})...`);
        try {
          const result = await resend.broadcasts.send(emailResult.data!.id);

          if (result.error) {
            console.error("❌ 邮件发送失败:", result.error);
            throw new Error(result.error.message);
          }

          console.log("✅ 邮件发送成功");
          return result;
        } catch (error) {
          console.error("❌ 发送邮件失败:", error);
          throw error;
        }
      });

      // ========== 成功返回 ==========
      console.log("\n========== ✅ 每日新闻任务完成 ==========\n");

      return {
        success: true,
        timestamp: new Date().toISOString(),
        stats: fetchResult.stats,
        broadcastId: emailResult.data?.id,
        message: "Daily news sent successfully",
      };
    } catch (error) {
      // ========== 错误处理 ==========
      const errorMsg = error instanceof Error ? error.message : String(error);

      console.error("\n========== ❌ 每日新闻任务失败 ==========");
      console.error("错误信息:", errorMsg);
      console.error("时间:", new Date().toISOString());
      console.error("================================================\n");

      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: errorMsg,
        message: "Daily news task failed",
      };
    }
  }
);

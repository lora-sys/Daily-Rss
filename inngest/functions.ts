import { fetchAllNews, formatNewsSummary } from "@lib/rss_utils";
import { inngest } from "./client";
import { Resend } from "resend";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const sendDailyNews = inngest.createFunction(
  { id: "send-daily-news" },
  // { event: "daily/news" },
  { cron: "15 4 * * *" }, // 定时任务，北京时间12点15执行
  async ({ event, step }) => {
    //TODO
    // 从多个RSS 源获取新闻
    const newItems = await step.run("fetch-news", async () => {
      console.log("Fetching news...");
      const news = await fetchAllNews();
      console.log(news.length);
      return news;
    });

    // 整理新闻为每日摘要
    const newSummary = await step.run("format-news", async () => {
      console.log("Formatting news...");
      const summary = formatNewsSummary(newItems);
      console.log(summary);
      return summary;
    });

    // 生成邮件内容
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("Sending email...");
    const { data, error } = await step.run("create-email", async () => {
      const result = await resend.broadcasts.create({
        from: "onboarding@resend.dev",
        subject:
          "Daily Briefs - " +
          new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        segmentId: "d7d093bd-99af-4ef9-b076-15b9999d105c",
        html: newSummary.html,
      });
      return result;
    });

    // 发送邮件到订阅者
    const { error: sendError } = await step.run("send-email", async () => {
      console.log("send email error...");
      const result = await resend.broadcasts.send(data?.id || "");
      return result;
    });

    if (sendError) {
      console.error("sendEmail error:", sendError);
      return { message: sendError.message };
    }
    return { message: "Email sent successfully!" };
  },
);

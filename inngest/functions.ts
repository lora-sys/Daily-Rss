import { inngest } from "./client";

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
  { event: "daily/news" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Daily news sent to ${event.data.email}!` };
  },
);

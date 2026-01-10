/**
 * 环境配置验证脚本
 * 检查所有必要的环境变量和数据库连接
 */

async function verifySetup() {
  console.log("🔍 开始验证 AI Daily News 配置...\n");

  const checks = [
    {
      name: "Supabase URL",
      envVar: "NEXT_PUBLIC_SUPABASE_URL",
      check: () => !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    {
      name: "Supabase Service Role Key",
      envVar: "SUPABASE_SERVICE_ROLE_KEY",
      check: () => !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    {
      name: "Resend API Key",
      envVar: "RESEND_API_KEY",
      check: () => !!process.env.RESEND_API_KEY,
    },
    {
      name: "Resend Segment ID",
      envVar: "RESEND_SEGMENT_ID",
      check: () => !!process.env.RESEND_SEGMENT_ID,
    },
  ];

  let allPassed = true;

  for (const item of checks) {
    const passed = item.check();
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${item.name} (${item.envVar})`);
    if (!passed) allPassed = false;
  }

  console.log("\n");

  if (!allPassed) {
    console.error(
      "❌ 配置不完整，请检查 .env.local 文件\n"
    );
    console.log("需要配置的环境变量：");
    console.log("  NEXT_PUBLIC_SUPABASE_URL=...");
    console.log("  SUPABASE_SERVICE_ROLE_KEY=...");
    console.log("  RESEND_API_KEY=...");
    console.log("  RESEND_SEGMENT_ID=...");
    process.exit(1);
  }

  // 尝试连接到 Supabase
  try {
    console.log("🔗 测试 Supabase 连接...");
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase
      .from("news_sources")
      .select("count")
      .limit(1);

    if (error) throw error;
    console.log("✅ Supabase 连接成功\n");
  } catch (error) {
    console.error("❌ Supabase 连接失败:", error);
    process.exit(1);
  }

  console.log("✅ 所有必要的配置验证通过！");
}

verifySetup().catch((error) => {
  console.error("验证失败:", error);
  process.exit(1);
});

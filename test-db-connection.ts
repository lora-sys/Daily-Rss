import { createClient } from "@supabase/supabase-js";

async function testDatabaseConnection() {
  console.log("🔍 测试数据库连接...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("1️⃣ 检查环境变量...");
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ 已配置" : "❌ 未配置"}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✅ 已配置" : "❌ 未配置"}\n`);

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ 环境变量缺失，请检查 .env.local 文件");
    process.exit(1);
  }

  console.log("2️⃣ 创建 Supabase 客户端...");
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
  console.log("✅ 客户端创建成功\n");

  console.log("3️⃣ 测试数据库连接...");
  try {
    const { data: testData, error: testError } = await supabase
      .from("news_sources")
      .select("count", { head: true, count: "exact" });

    if (testError) {
      console.error("❌ 数据库连接失败:", testError);
      process.exit(1);
    }
    console.log("✅ 数据库连接成功\n");
  } catch (error) {
    console.error("❌ 数据库连接异常:", error);
    process.exit(1);
  }

  console.log("4️⃣ 检查新闻源总数...");
  const { data: allSources, error: allError } = await supabase
    .from("news_sources")
    .select("id, name, is_active, feed_url, type");

  if (allError) {
    console.error("❌ 查询新闻源失败:", allError);
    process.exit(1);
  }

  console.log(`✅ 总共 ${allSources.length} 个新闻源:`);
  allSources.forEach((source) => {
    console.log(
      `   - ${source.name} (active: ${source.is_active}, type: ${source.type})`
    );
  });

  console.log("\n5️⃣ 检查激活的新闻源...");
  const { data: activeSources, error: activeError } = await supabase
    .from("news_sources")
    .select("id, name, feed_url, type, priority")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (activeError) {
    console.error("❌ 查询激活源失败:", activeError);
    process.exit(1);
  }

  console.log(`✅ ${activeSources.length} 个激活的新闻源:`);
  activeSources.forEach((source) => {
    console.log(
      `   - ${source.name} (${source.type}, priority: ${source.priority})`
    );
  });

  console.log("\n6️⃣ 检查今天的文章...");
  const today = new Date().toISOString().split("T")[0];
  const { data: todayArticles, error: articlesError } = await supabase
    .from("news_articles")
    .select("id, title, source_name, pub_date")
    .gte("pub_date", today)
    .order("pub_date", { ascending: false });

  if (articlesError) {
    console.error("❌ 查询文章失败:", articlesError);
    process.exit(1);
  }

  console.log(`✅ 今天有 ${todayArticles.length} 篇文章:`);
  if (todayArticles.length > 0) {
    todayArticles.slice(0, 5).forEach((article) => {
      console.log(`   - ${article.title} (${article.source_name})`);
    });
    if (todayArticles.length > 5) {
      console.log(`   ... 还有 ${todayArticles.length - 5} 篇`);
    }
  } else {
    console.log("   暂无今天的文章");
  }

  console.log("\n✅ 数据库测试完成");
}

testDatabaseConnection().catch((error) => {
  console.error("❌ 测试失败:", error);
  process.exit(1);
});

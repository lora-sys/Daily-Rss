import { supabase } from "@/lib/supabase";

async function testDatabase() {
  console.log("🔍 测试数据库连接...\n");

  try {
    // 测试连接
    console.log("1️⃣ 测试基本连接...");
    const { data: testData, error: testError } = await supabase
      .from("news_sources")
      .select("count")
      .single();

    if (testError) {
      console.error("❌ 数据库连接失败:", testError);
      return;
    }
    console.log("✅ 数据库连接正常\n");

    // 检查新闻源数量
    console.log("2️⃣ 检查新闻源总数...");
    const { data: allSources, error: allError } = await supabase
      .from("news_sources")
      .select("id, name, is_active, feed_url");

    if (allError) {
      console.error("❌ 查询新闻源失败:", allError);
      return;
    }

    console.log(`✅ 总共 ${allSources.length} 个新闻源:`);
    allSources.forEach((source) => {
      console.log(
        `   - ${source.name} (active: ${source.is_active}, url: ${source.feed_url || "RSSHub"})`
      );
    });

    // 检查激活的新闻源
    console.log("\n3️⃣ 检查激活的新闻源...");
    const { data: activeSources, error: activeError } = await supabase
      .from("news_sources")
      .select("id, name, feed_url, type")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (activeError) {
      console.error("❌ 查询激活源失败:", activeError);
      return;
    }

    console.log(`✅ ${activeSources.length} 个激活的新闻源:`);
    activeSources.forEach((source) => {
      console.log(`   - ${source.name} (${source.type})`);
    });

    // 检查今天的文章
    console.log("\n4️⃣ 检查今天的文章...");
    const today = new Date().toISOString().split("T")[0];
    const { data: todayArticles, error: articlesError } = await supabase
      .from("news_articles")
      .select("id, title, source_name")
      .gte("pub_date", today)
      .order("pub_date", { ascending: false });

    if (articlesError) {
      console.error("❌ 查询文章失败:", articlesError);
      return;
    }

    console.log(`✅ 今天有 ${todayArticles.length} 篇文章:`);
    todayArticles.slice(0, 5).forEach((article) => {
      console.log(`   - ${article.title} (${article.source_name})`);
    });
    if (todayArticles.length > 5) {
      console.log(`   ... 还有 ${todayArticles.length - 5} 篇`);
    }

    console.log("\n✅ 数据库测试完成");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

testDatabase();

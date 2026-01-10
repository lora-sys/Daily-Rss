-- 更新失败源的URL
-- Hacker News Best: 使用直接RSS源
UPDATE news_sources
SET type = 'direct_feed',
    feed_url = 'https://hnrss.org/best',
    rsshub_route = NULL,
    rsshub_params = NULL
WHERE name = 'Hacker News Best';

-- 更新 The Verge 的URL
UPDATE news_sources
SET feed_url = 'https://www.theverge.com/rss/index.xml'
WHERE name = 'The Verge';

-- First Round Review: 尝试正确的URL
UPDATE news_sources
SET feed_url = 'https://firstround.com/review/feed/'
WHERE name = 'First Round Review';

-- 36Kr Startup: 使用正确的RSSHub路由
UPDATE news_sources
SET rsshub_route = '/36kr/search/keyword'
WHERE name = '36Kr Startup';

-- GitHub Trending: 使用直接源
UPDATE news_sources
SET type = 'direct_feed',
    feed_url = 'https://github.com/trending',
    rsshub_route = NULL,
    rsshub_params = NULL
WHERE name IN ('GitHub Trending Daily', 'GitHub Trending Weekly');

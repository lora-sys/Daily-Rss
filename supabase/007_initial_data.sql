-- Note: Password hash will be generated in app layer
-- Default: admin123
-- Use ON CONFLICT to avoid duplicate errors on re-runs
INSERT INTO admin_users (username, password_hash, email)
VALUES (
  'admin',
  '$2b$10$placeholder-bcrypt-hash', -- Will be replaced during setup
  'admin@dailynews.com'
)
ON CONFLICT (username) DO NOTHING;

-- AI Configs (No active by default)
INSERT INTO ai_configs (provider, provider_name, api_key_encrypted, api_key_nonce,
                         base_url, model_name, use_for, is_active, priority)
VALUES
  ('iflow', '心流AI', 'encrypted_placeholder', 'nonce_placeholder',
   'https://apis.iflow.cn/v1', 'qwen3-235b-a22b-instruct',
   ARRAY['summarization'], false, 1),

  ('openai', 'OpenAI', 'encrypted_placeholder', 'nonce_placeholder',
   NULL, 'gpt-4',
   ARRAY['summarization'], false, 2);

-- Direct Feeds
INSERT INTO news_sources (name, description, type, feed_url, category, priority, fetch_interval_minutes) VALUES
  ('Hacker News', 'Hacker News Frontpage', 'direct_feed',
   'https://hnrss.org/frontpage', ARRAY['tech', 'github'], 10, 60),

  ('TechCrunch', 'TechCrunch RSS Feed', 'direct_feed',
   'https://techcrunch.com/feed/', ARRAY['tech', 'startup'], 10, 60),

  ('OpenAI Blog', 'OpenAI Official Blog', 'direct_feed',
   'https://openai.com/blog/rss.xml', ARRAY['ai', 'ml', 'llm'], 10, 60),

  ('DeepMind Blog', 'DeepMind Research Blog', 'direct_feed',
   'https://deepmind.com/blog/feed/basic/', ARRAY['ai', 'ml', 'research'], 10, 120),

  ('The Verge', 'The Verge Technology News', 'direct_feed',
   'https://www.theverge.com/rss/full.xml', ARRAY['tech'], 9, 60),

  ('MIT News AI', 'MIT Artificial Intelligence News', 'direct_feed',
   'https://news.mit.edu/rss/topic/artificial-intelligence2', ARRAY['ai', 'research'], 9, 120),

  ('First Round Review', 'First Round Review', 'direct_feed',
   'https://firstround.com/review/feed.xml', ARRAY['startup', 'business'], 9, 120);

-- RSSHub Sources
INSERT INTO news_sources (name, description, type, category, priority, fetch_interval_minutes) VALUES
  ('36Kr Startup', '36Kr 创业新闻', 'rsshub',
   ARRAY['startup', 'business'], 8, 120),

  ('GitHub Trending Daily', 'GitHub Trending Daily', 'rsshub',
   ARRAY['github', 'open-source'], 8, 120),

  ('GitHub Trending Weekly', 'GitHub Trending Weekly', 'rsshub',
   ARRAY['github', 'open-source'], 7, 120),

  ('Hacker News Best', 'Hacker News Best Stories', 'rsshub',
   ARRAY['tech'], 7, 120);

-- Configure RSSHub routes
UPDATE news_sources
SET rsshub_route = '/36kr/search/创业',
    rsshub_params = '{"keywords": "创业,融资,A轮,B轮"}'::jsonb
WHERE name = '36Kr Startup';

UPDATE news_sources
SET rsshub_route = '/github/trending/daily',
    rsshub_params = '{"period": "daily"}'::jsonb
WHERE name = 'GitHub Trending Daily';

UPDATE news_sources
SET rsshub_route = '/github/trending/weekly',
    rsshub_params = '{"period": "weekly"}'::jsonb
WHERE name = 'GitHub Trending Weekly';

UPDATE news_sources
SET rsshub_route = '/hackernews/best'
WHERE name = 'Hacker News Best';

-- AI Configs
CREATE TABLE IF NOT EXISTS ai_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('iflow', 'openai', 'claude', 'custom')),
  provider_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  api_key_nonce TEXT NOT NULL,
  base_url TEXT,
  model_name TEXT NOT NULL,
  use_for TEXT[] NOT NULL DEFAULT '{summarization}',
  is_active BOOLEAN DEFAULT false,
  priority INT DEFAULT 0,
  max_tokens INT DEFAULT 2000,
  temperature FLOAT DEFAULT 0.3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- GIN index for efficient array searching on use_for
CREATE INDEX IF NOT EXISTS idx_ai_configs_use_for ON ai_configs USING GIN(use_for);

-- Conditional unique index to ensure only one active summarization config
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_config_unique_summarization_active
  ON ai_configs (is_active)
  WHERE is_active = true AND 'summarization' = ANY(use_for);

-- News Sources
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('direct_feed', 'rsshub')),
  feed_url TEXT,
  rsshub_route TEXT,
  rsshub_params JSONB DEFAULT '{}',
  category TEXT[] NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  fetch_interval_minutes INT DEFAULT 60,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  last_fetched_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_news_sources_active
  ON news_sources(is_active, priority DESC)
  WHERE is_active = true;

CREATE INDEX idx_news_sources_type ON news_sources(type);
CREATE INDEX idx_news_sources_category ON news_sources USING GIN(category);

-- News Articles
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  category TEXT[] NOT NULL,
  pub_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_news_articles_date ON news_articles(pub_date DESC);
CREATE INDEX idx_news_articles_source ON news_articles(source_id);
CREATE INDEX idx_news_articles_category ON news_articles USING GIN(category);
CREATE INDEX idx_news_articles_date_category ON news_articles(pub_date DESC, category);

-- Daily Summaries
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  summary_by_category JSONB NOT NULL,
  total_sources_fetched INT DEFAULT 0,
  total_articles INT DEFAULT 0,
  total_categories INT DEFAULT 0,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  ai_config_id UUID REFERENCES ai_configs(id) ON DELETE SET NULL,
  ai_provider TEXT,
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_daily_summaries_date ON daily_summaries(date DESC);
CREATE INDEX idx_daily_summaries_status ON daily_summaries(status);

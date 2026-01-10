-- Get active AI config
CREATE OR REPLACE FUNCTION get_active_ai_config(
  use_for_param TEXT DEFAULT 'summarization'
)
RETURNS TABLE (
  id UUID,
  provider TEXT,
  provider_name TEXT,
  api_key_encrypted TEXT,
  api_key_nonce TEXT,
  base_url TEXT,
  model_name TEXT,
  max_tokens INT,
  temperature FLOAT,
  priority INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT id, provider, provider_name, api_key_encrypted, api_key_nonce,
         base_url, model_name, max_tokens, temperature, priority
  FROM ai_configs
  WHERE use_for_param = ANY(use_for)
    AND is_active = true
  ORDER BY priority ASC
  LIMIT 1;
END;
$$;

-- Set active AI config
CREATE OR REPLACE FUNCTION set_active_ai_config(
  config_id UUID,
  use_for_param TEXT DEFAULT 'summarization'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE ai_configs
  SET is_active = false, updated_at = NOW()
  WHERE use_for_param = ANY(use_for) AND is_active = true;

  UPDATE ai_configs
  SET is_active = true, updated_at = NOW()
  WHERE id = config_id;
END;
$$;

-- Get active sources for fetch
CREATE OR REPLACE FUNCTION get_active_sources_for_fetch()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  feed_url TEXT,
  rsshub_route TEXT,
  rsshub_params JSONB,
  category TEXT[],
  priority INT,
  fetch_interval_minutes INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, type, feed_url, rsshub_route, rsshub_params,
         category, priority, fetch_interval_minutes
  FROM news_sources
  WHERE is_active = true
    AND (
      last_fetched_at IS NULL
      OR last_fetched_at < NOW() - (fetch_interval_minutes || ' minutes')::INTERVAL
    )
  ORDER BY priority DESC;
END;
$$;

-- Update source stats
CREATE OR REPLACE FUNCTION update_source_stats(
  source_id UUID,
  status TEXT,
  articles_fetched INT DEFAULT 0,
  articles_new INT DEFAULT 0,
  error_message TEXT DEFAULT NULL,
  duration_ms INT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF status = 'success' THEN
    UPDATE news_sources
    SET success_count = success_count + 1,
        last_fetched_at = NOW(),
        last_success_at = NOW(),
        last_error = NULL,
        updated_at = NOW()
    WHERE id = source_id;
  ELSE
    UPDATE news_sources
    SET failure_count = failure_count + 1,
        last_fetched_at = NOW(),
        last_error = error_message,
        updated_at = NOW()
    WHERE id = source_id;
  END IF;

  INSERT INTO fetch_logs (
    source_id, source_name, articles_fetched, articles_new,
    status, error_message, duration_ms
  )
  SELECT source_id, name, articles_fetched, articles_new,
         status, error_message, duration_ms
  FROM news_sources
  WHERE id = source_id;
END;
$$;

-- Get articles by date
CREATE OR REPLACE FUNCTION get_articles_by_date(
  target_date DATE,
  category_filter TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  link TEXT,
  source_name TEXT,
  category TEXT[],
  pub_date TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT id, title, description, link, source_name, category, pub_date
  FROM news_articles
  WHERE pub_date::DATE = target_date
    AND (category_filter IS NULL OR category && category_filter)
  ORDER BY pub_date DESC;
END;
$$;

-- Check article exists
CREATE OR REPLACE FUNCTION article_exists_by_link(
  link_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM news_articles WHERE link = link_param);
END;
$$;

-- Get source health report
CREATE OR REPLACE FUNCTION get_source_health_report()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  is_active BOOLEAN,
  status TEXT,
  success_rate FLOAT,
  total_fetches INT,
  last_fetched_at TIMESTAMPTZ,
  last_error TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, type, is_active,
    CASE
      WHEN is_active = false THEN 'disabled'
      WHEN failure_count::FLOAT / GREATEST(success_count + failure_count, 1) > 0.7 THEN 'critical'
      WHEN failure_count::FLOAT / GREATEST(success_count + failure_count, 1) > 0.5 THEN 'unstable'
      WHEN failure_count::FLOAT / GREATEST(success_count + failure_count, 1) > 0.3 THEN 'degraded'
      ELSE 'healthy'
    END AS status,
    COALESCE(success_count::FLOAT / GREATEST(success_count + failure_count, 1), 0)::NUMERIC(5,2) AS success_rate,
    success_count + failure_count AS total_fetches,
    last_fetched_at, last_error
  FROM news_sources
  ORDER BY priority DESC;
END;
$$;

-- Auto-disable failing sources
CREATE OR REPLACE FUNCTION auto_disable_failing_sources(
  failure_threshold FLOAT DEFAULT 0.7,
  min_failures INT DEFAULT 10
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  disabled_count INT;
BEGIN
  UPDATE news_sources
  SET is_active = false,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{disabled_reason}',
      to_jsonb('Auto-disabled: failure rate > ' || (failure_threshold * 100)::text || '%'),
      true
    ),
    metadata = jsonb_set(metadata, '{disabled_at}', to_jsonb(NOW()), true),
    metadata = jsonb_set(metadata, '{failure_rate_at_disable}',
      to_jsonb(failure_count::FLOAT / GREATEST(success_count + failure_count, 1)), true),
    updated_at = NOW()
  WHERE failure_count >= min_failures
    AND failure_count::FLOAT / GREATEST(success_count + failure_count, 1) > failure_threshold
    AND is_active = true;

  GET DIAGNOSTICS disabled_count = ROW_COUNT;
  RETURN disabled_count;
END;
$$;

-- Dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_sources INT,
  active_sources INT,
  total_articles INT,
  articles_today INT,
  articles_this_week INT,
  overall_success_rate FLOAT,
  last_email_sent TIMESTAMPTZ,
  last_summary_date DATE,
  ai_config_provider TEXT,
  ai_config_model TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM news_sources) AS total_sources,
    (SELECT COUNT(*) FROM news_sources WHERE is_active = true) AS active_sources,
    (SELECT COUNT(*) FROM news_articles) AS total_articles,
    (SELECT COUNT(*) FROM news_articles WHERE pub_date::DATE = CURRENT_DATE) AS articles_today,
    (SELECT COUNT(*) FROM news_articles WHERE pub_date >= NOW() - INTERVAL '7 days') AS articles_this_week,
    (
      SELECT COALESCE(SUM(success_count)::FLOAT / GREATEST(SUM(success_count + failure_count), 1), 0)
      FROM news_sources
    )::NUMERIC(5,2) AS overall_success_rate,
    (SELECT MAX(sent_at) FROM email_logs WHERE status = 'sent') AS last_email_sent,
    (SELECT MAX(date) FROM daily_summaries WHERE status = 'completed') AS last_summary_date,
    (SELECT provider FROM ai_configs WHERE is_active = true LIMIT 1) AS ai_config_provider,
    (SELECT model_name FROM ai_configs WHERE is_active = true LIMIT 1) AS ai_config_model;
END;
$$;

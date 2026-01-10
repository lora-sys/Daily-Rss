
-- Check all tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'admin_users', 'admin_sessions',
    'ai_configs', 'news_sources', 'news_articles',
    'daily_summaries', 'fetch_logs', 'email_logs', 'admin_audit_logs'
  )
ORDER BY table_name;

-- Test functions
SELECT * FROM get_dashboard_stats();
SELECT * FROM get_source_health_report();
SELECT * FROM get_active_sources_for_fetch();
SELECT * FROM get_active_ai_config();

-- Check initial data
SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL
SELECT 'ai_configs', COUNT(*) FROM ai_configs
UNION ALL
SELECT 'news_sources', COUNT(*) FROM news_sources;

-- 创建计数器增量函数
CREATE OR REPLACE FUNCTION increment_success_count(source_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_sources
    SET success_count = success_count + 1
    WHERE id = source_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_failure_count(source_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_sources
    SET failure_count = failure_count + 1
    WHERE id = source_id;
END;
$$ LANGUAGE plpgsql;

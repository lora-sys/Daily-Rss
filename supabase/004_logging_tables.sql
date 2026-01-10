-- Fetch Logs
CREATE TABLE IF NOT EXISTS fetch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES news_sources(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  articles_fetched INT DEFAULT 0,
  articles_new INT DEFAULT 0,
  articles_duplicate INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  duration_ms INT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  summary_date DATE NOT NULL,
  broadcast_id TEXT,
  subject TEXT,
  status TEXT NOT NULL CHECK (status IN ('created', 'sent', 'failed')),
  total_recipients INT DEFAULT 0,
  success_count INT DEFAULT 0,
  error_message TEXT,
  ai_config_id UUID REFERENCES ai_configs(id) ON DELETE SET NULL,
  ai_provider TEXT,
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fetch_logs_source ON fetch_logs(source_id);
CREATE INDEX idx_fetch_logs_date ON fetch_logs(fetched_at DESC);
CREATE INDEX idx_fetch_logs_status ON fetch_logs(status);

CREATE INDEX idx_email_logs_date ON email_logs(summary_date DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

CREATE INDEX idx_admin_audit_user ON admin_audit_logs(user_id);
CREATE INDEX idx_admin_audit_date ON admin_audit_logs(created_at DESC);

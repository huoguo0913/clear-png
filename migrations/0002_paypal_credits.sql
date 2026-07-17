CREATE TABLE IF NOT EXISTS credit_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  plan TEXT NOT NULL,
  credits_total INTEGER NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_credit_grants_user_id ON credit_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_grants_expires_at ON credit_grants(expires_at);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  credit_grant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (credit_grant_id) REFERENCES credit_grants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);

CREATE TABLE IF NOT EXISTS paypal_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  captured_at TEXT,
  payer_email TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_paypal_orders_user_id ON paypal_orders(user_id);

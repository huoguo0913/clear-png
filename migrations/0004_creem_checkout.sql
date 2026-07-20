CREATE TABLE IF NOT EXISTS creem_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  checkout_id TEXT NOT NULL UNIQUE,
  request_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  product_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  creem_order_id TEXT,
  customer_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_creem_orders_user_id ON creem_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_creem_orders_creem_order_id ON creem_orders(creem_order_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_grants_creem_source
ON credit_grants(source, source_id)
WHERE source = 'creem' AND source_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS creem_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  resource_id TEXT,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creem_webhook_events_resource_id
ON creem_webhook_events(resource_id);

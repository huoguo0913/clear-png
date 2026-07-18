CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_grants_paypal_source
ON credit_grants(source, source_id)
WHERE source = 'paypal' AND source_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  resource_id TEXT,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_resource_id
ON paypal_webhook_events(resource_id);

CREATE TABLE IF NOT EXISTS urls (
  short_code VARCHAR(6) PRIMARY KEY,
  original_url VARCHAR(2048) NOT NULL,
  click_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_clicked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS urls_created_at_idx ON urls (created_at DESC);
CREATE INDEX IF NOT EXISTS urls_click_count_idx ON urls (click_count DESC);

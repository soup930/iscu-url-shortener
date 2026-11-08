import { neon } from "@neondatabase/serverless";

let sqlClient;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  sqlClient ??= neon(process.env.DATABASE_URL);
  return sqlClient;
}

export async function saveUrl(shortCode, originalUrl) {
  const sql = getSql();

  await sql`
    INSERT INTO urls (short_code, original_url)
    VALUES (${shortCode}, ${originalUrl})
    ON CONFLICT (short_code) DO NOTHING
  `;
}

export async function findUrlByShortCode(shortCode) {
  const sql = getSql();
  const rows = await sql`
    SELECT original_url
    FROM urls
    WHERE short_code = ${shortCode}
    LIMIT 1
  `;

  return rows[0]?.original_url ?? null;
}

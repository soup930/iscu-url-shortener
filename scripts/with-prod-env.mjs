import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const envPath = path.join(projectRoot, ".env.prod");
const envText = await readFile(envPath, "utf8");
const loadedKeys = [];

for (const rawLine of envText.split(/\r?\n/)) {
  const line = rawLine.trim();

  if (!line || line.startsWith("#")) continue;

  const separator = line.indexOf("=");
  if (separator < 1) continue;

  const key = line.slice(0, separator).trim();
  let value = line.slice(separator + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.env[key] = value;
  loadedKeys.push(key);
}

console.log(`Loaded .env.prod (${loadedKeys.join(", ")})`);

const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const command = process.argv[2];

if (!command) {
  throw new Error("Next.js command is required.");
}

const child = spawn(process.execPath, [nextBin, command], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { seed } from "./seed.ts";

/**
 * Where `server/` lives on disk.
 *
 * Not derived from `import.meta.url`: Vite bundles `vite.config.ts` and its
 * relative imports into a temp file at the project root before running it, so
 * `import.meta.url` here would point at that temp file, not at this directory.
 * The Vite plugin sets BLIRO_SERVER_DIR from the resolved project root; the cwd
 * fallback covers npm scripts, which always run from the package root.
 */
export function serverDir(): string {
  return process.env.BLIRO_SERVER_DIR ?? join(process.cwd(), "server");
}

/** Gitignored — `npm run db:reset` deletes it and the next boot rebuilds it. */
export function dbPath(): string {
  return join(serverDir(), "data", "playground.db");
}

let instance: DatabaseSync | null = null;

/**
 * Opens (and on first call creates + seeds) the playground database.
 *
 * `node:sqlite` is built into Node, so this costs no dependency and no native
 * build step — the reason the playground can have a real database without
 * anyone running node-gyp.
 */
export function getDb(): DatabaseSync {
  if (instance) return instance;

  const path = dbPath();
  mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(readFileSync(join(serverDir(), "schema.sql"), "utf8"));

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM orgs").get() as { count: number };
  if (count === 0) seed(db);

  instance = db;
  return db;
}

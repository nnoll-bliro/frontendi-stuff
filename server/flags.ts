import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { serverDir } from "./db.ts";

/**
 * Serves `/flags/<code>.svg`, the endpoint `LanguageFlagIcon` builds its `<img
 * src>` from. The real backend answers it out of the `flag-icons` package with a
 * couple of local overrides for flags that package doesn't ship; this mirrors
 * that so every language picker in the playground renders real flags instead of
 * broken images.
 */

/** Overrides first — same two files, and for the same reason, as apps/backend. */
const OVERRIDE_DIR = () => join(serverDir(), "flags");
const PACKAGE_DIR = () => join(serverDir(), "..", "node_modules", "flag-icons", "flags", "4x3");

/** Flag codes are `de`, `gb-wls`, `es-ct` — nothing that could escape the directory. */
const CODE = /^[a-z0-9-]+$/;

const cache = new Map<string, Buffer | null>();

function read(code: string): Buffer | null {
  const cached = cache.get(code);
  if (cached !== undefined) return cached;

  const candidates = [join(OVERRIDE_DIR(), `${code}.svg`), join(PACKAGE_DIR(), `${code}.svg`)];
  const found = candidates.find((path) => existsSync(path));
  const contents = found ? readFileSync(found) : null;
  cache.set(code, contents);
  return contents;
}

/** Returns false when the request isn't a flag, so the caller can fall through. */
export function serveFlag(pathname: string, res: import("node:http").ServerResponse): boolean {
  const match = pathname.match(/^\/flags\/([^/]+)\.svg$/);
  if (!match) return false;

  const code = match[1];
  const svg = CODE.test(code) ? read(code) : null;

  if (!svg) {
    res.statusCode = 404;
    res.end();
    return true;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.end(svg);
  return true;
}

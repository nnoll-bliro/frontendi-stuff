import type { IncomingMessage, ServerResponse } from "node:http";

import { serveFlag } from "./flags.ts";
import {
  getAgentSession,
  getCalendarEntry,
  getCompany,
  getMeeting,
  getPerson,
  getSession,
  listAgentSessions,
  listCalendar,
  listCompanies,
  listMeetings,
  listPeople,
  listUsers,
} from "./records.ts";

type Handler = (params: URLSearchParams, match: RegExpMatchArray) => unknown;
const ROUTES: [method: string, pattern: RegExp, handler: Handler][] = [
  ["GET", /^\/api\/session$/, () => getSession()],
  ["GET", /^\/api\/users$/, () => listUsers()],
  ["GET", /^\/api\/companies$/, () => listCompanies()],
  ["GET", /^\/api\/companies\/([\w-]+)$/, (_p, m) => getCompany(m[1])],
  ["GET", /^\/api\/people$/, () => listPeople()],
  ["GET", /^\/api\/people\/([\w-]+)$/, (_p, m) => getPerson(m[1])],
  ["GET", /^\/api\/meetings$/, (params) => listMeetings(params)],
  ["GET", /^\/api\/meetings\/([\w-]+)$/, (_p, m) => getMeeting(m[1])],
  ["GET", /^\/api\/agent-sessions$/, (params) => listAgentSessions(params)],
  [
    "GET",
    /^\/api\/agent-sessions\/([\w-]+)$/,
    (_p, m) => getAgentSession(m[1]),
  ],
  ["GET", /^\/api\/calendar$/, (params) => listCalendar(params)],
  ["GET", /^\/api\/calendar\/([\w-]+)$/, (_p, m) => getCalendarEntry(m[1])],
];

/** Read-only Connect middleware, mounted by Vite on the app's own origin. */
export function apiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (serveFlag(url.pathname, res)) return;
  if (!url.pathname.startsWith("/api/")) return next();

  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
  };
  const route = ROUTES.find(
    ([method, pattern]) => req.method === method && pattern.test(url.pathname),
  );
  if (!route)
    return send(404, {
      error: `No API route for ${req.method} ${url.pathname}`,
    });
  try {
    const result = route[2](
      url.searchParams,
      url.pathname.match(route[1]) as RegExpMatchArray,
    );
    if (result === null) return send(404, { error: "Not found" });
    send(200, result);
  } catch (error) {
    console.error(`[api] ${req.method} ${url.pathname} failed:`, error);
    send(500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

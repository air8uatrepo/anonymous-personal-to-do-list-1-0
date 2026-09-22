import { randomUUID } from "node:crypto";

export const VISITOR_COOKIE_NAME = "anonymous_task_visitor";

const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const name = entry.slice(0, separator).trim();
    if (name === VISITOR_COOKIE_NAME) {
      return entry.slice(separator + 1).trim();
    }
  }

  return undefined;
}

export function ensureVisitorId(request: Request): { visitorId: string; setCookie: boolean } {
  const cookieValue = readCookie(request);
  if (cookieValue && visitorIdPattern.test(cookieValue)) {
    return { visitorId: cookieValue, setCookie: false };
  }

  return { visitorId: randomUUID(), setCookie: true };
}

export function visitorCookieHeader(visitorId: string, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${VISITOR_COOKIE_NAME}=${visitorId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`;
}

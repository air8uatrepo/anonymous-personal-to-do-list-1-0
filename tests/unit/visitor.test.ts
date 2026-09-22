import { describe, expect, it } from "vitest";
import { ensureVisitorId, VISITOR_COOKIE_NAME } from "@/lib/tasks/visitor";

describe("ensureVisitorId", () => {
  it("reuses a valid anonymous cookie without creating a new identity", () => {
    const visitorId = "00000000-0000-4000-8000-000000000001";
    const request = new Request("http://localhost", {
      headers: { cookie: `${VISITOR_COOKIE_NAME}=${visitorId}` },
    });

    expect(ensureVisitorId(request)).toEqual({ visitorId, setCookie: false });
  });

  it("creates an anonymous identity when the cookie is absent", () => {
    const result = ensureVisitorId(new Request("http://localhost"));

    expect(result.setCookie).toBe(true);
    expect(result.visitorId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

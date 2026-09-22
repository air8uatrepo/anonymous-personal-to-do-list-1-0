import { z } from "zod";
import { ensureVisitorId, visitorCookieHeader } from "./visitor";
import type { TaskRepository } from "./types";
import { parseCreateTaskInput } from "./validation";

function withVisitorCookie(response: Response, request: Request, visitor: { visitorId: string; setCookie: boolean }): Response {
  if (visitor.setCookie) {
    response.headers.append("set-cookie", visitorCookieHeader(visitor.visitorId, request));
  }
  return response;
}

async function readJson(request: Request): Promise<unknown> {
  return request.json();
}

function invalidRequest(): Response {
  return Response.json({ error: "Invalid request" }, { status: 400 });
}

function serverFailure(): Response {
  return Response.json({ error: "Unable to complete request" }, { status: 500 });
}

export function createTaskCollectionHandlers(repository: TaskRepository) {
  return {
    async GET(request: Request): Promise<Response> {
      const visitor = ensureVisitorId(request);
      try {
        const tasks = await repository.list(visitor.visitorId);
        return withVisitorCookie(Response.json({ tasks }), request, visitor);
      } catch {
        return serverFailure();
      }
    },
    async POST(request: Request): Promise<Response> {
      const visitor = ensureVisitorId(request);
      try {
        const input = parseCreateTaskInput(await readJson(request));
        const task = await repository.create(visitor.visitorId, input.title);
        return withVisitorCookie(Response.json({ task }, { status: 201 }), request, visitor);
      } catch (error) {
        if (error instanceof z.ZodError || error instanceof SyntaxError) {
          return invalidRequest();
        }
        return serverFailure();
      }
    },
  };
}

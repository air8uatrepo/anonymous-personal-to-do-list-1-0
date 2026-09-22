import { z } from "zod";
import { ensureVisitorId, visitorCookieHeader } from "./visitor";
import type { TaskRepository } from "./types";
import { parseCompletionInput, parseTaskId } from "./validation";

type ItemRouteContext = { params: Promise<{ taskId: string }> };

function withVisitorCookie(response: Response, request: Request, visitor: { visitorId: string; setCookie: boolean }): Response {
  if (visitor.setCookie) {
    response.headers.append("set-cookie", visitorCookieHeader(visitor.visitorId, request));
  }
  return response;
}

function invalidRequest(): Response {
  return Response.json({ error: "Invalid request" }, { status: 400 });
}

function notFound(): Response {
  return Response.json({ error: "Task not found" }, { status: 404 });
}

function serverFailure(): Response {
  return Response.json({ error: "Unable to complete request" }, { status: 500 });
}

export function createTaskItemHandlers(repository: TaskRepository) {
  return {
    async PATCH(request: Request, context: ItemRouteContext): Promise<Response> {
      const visitor = ensureVisitorId(request);
      try {
        const { taskId: rawTaskId } = await context.params;
        const taskId = parseTaskId(rawTaskId);
        const { completed } = parseCompletionInput(await request.json());
        const task = await repository.setCompleted(visitor.visitorId, taskId, completed);
        return task ? withVisitorCookie(Response.json({ task }), request, visitor) : notFound();
      } catch (error) {
        if (error instanceof z.ZodError || error instanceof SyntaxError) {
          return invalidRequest();
        }
        return serverFailure();
      }
    },
    async DELETE(request: Request, context: ItemRouteContext): Promise<Response> {
      const visitor = ensureVisitorId(request);
      try {
        const { taskId: rawTaskId } = await context.params;
        const taskId = parseTaskId(rawTaskId);
        const removed = await repository.remove(visitor.visitorId, taskId);
        return removed ? withVisitorCookie(new Response(null, { status: 204 }), request, visitor) : notFound();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return invalidRequest();
        }
        return serverFailure();
      }
    },
  };
}

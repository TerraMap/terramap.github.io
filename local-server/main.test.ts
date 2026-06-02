import { assertEquals } from "@std/assert";
import { handler, corsHeaders, ALLOWED_ORIGIN } from "./main.ts";

function req(path: string, options?: { origin?: string; method?: string }): Request {
  return new Request(`http://localhost:17385${path}`, {
    method: options?.method ?? "GET",
    headers: options?.origin ? { origin: options.origin } : {},
  });
}

// --- CORS ---

Deno.test("corsHeaders echoes allowed origin", () => {
  const headers = corsHeaders(req("/", { origin: ALLOWED_ORIGIN }));
  assertEquals(headers["access-control-allow-origin"], ALLOWED_ORIGIN);
});

Deno.test("corsHeaders allows localhost origins", () => {
  const origin = "http://localhost:5173";
  const headers = corsHeaders(req("/", { origin }));
  assertEquals(headers["access-control-allow-origin"], origin);
});

Deno.test("corsHeaders defaults disallowed origins to ALLOWED_ORIGIN", () => {
  const headers = corsHeaders(req("/", { origin: "https://evil.com" }));
  assertEquals(headers["access-control-allow-origin"], ALLOWED_ORIGIN);
});

Deno.test("corsHeaders defaults missing origin to ALLOWED_ORIGIN", () => {
  const headers = corsHeaders(req("/"));
  assertEquals(headers["access-control-allow-origin"], ALLOWED_ORIGIN);
});

// --- OPTIONS preflight ---

Deno.test("OPTIONS returns 204 with CORS headers", async () => {
  const res = await handler(req("/health", { method: "OPTIONS", origin: ALLOWED_ORIGIN }));
  assertEquals(res.status, 204);
  assertEquals(res.headers.get("access-control-allow-methods"), "GET, OPTIONS");
  assertEquals(res.headers.get("access-control-allow-headers"), "content-type");
});

// --- Routing ---

Deno.test("/ returns health JSON", async () => {
  const res = await handler(req("/"));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.status, "ok");
});

Deno.test("/health returns health JSON", async () => {
  const res = await handler(req("/health"));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.status, "ok");
});

Deno.test("unknown route returns 404", async () => {
  const res = await handler(req("/nonexistent"));
  assertEquals(res.status, 404);
  const body = await res.json();
  assertEquals(body.error, "not found");
});

// --- /file ---

Deno.test("/file without path param returns 400", async () => {
  const res = await handler(req("/file"));
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "missing ?path= parameter");
});

Deno.test("/file with disallowed path returns 403", async () => {
  const res = await handler(req("/file?path=/etc/passwd"));
  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "path not in discovered files");
});

import { discoverFilePaths, discoverPlayers, discoverWorlds } from "./discover.ts";

const PORT = 17385;
export const ALLOWED_ORIGIN = "https://terramap.github.io";

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed =
    origin === ALLOWED_ORIGIN || origin.startsWith("http://localhost:")
      ? origin
      : ALLOWED_ORIGIN;
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function json(req: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(req) },
  });
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  const url = new URL(req.url);

  if (!url.pathname || url.pathname === '/' || url.pathname === "/health") {
    return json(req, { status: "ok", version: "0.1.0" });
  }

  if (url.pathname === "/worlds") {
    const worlds = await discoverWorlds();
    return json(req, worlds);
  }

  if (url.pathname === "/players") {
    const worldIds = url.searchParams.getAll("worldId");
    const players = await discoverPlayers();
    if (worldIds.length) {
      const matchNames = new Set<string>(worldIds.map(id => `${id}.map`));
      return json(req, players.filter((p) => matchNames.has(p.name)));
    }
    return json(req, players);
  }

  if (url.pathname === "/file") {
    const filePath = url.searchParams.get("path");
    if (!filePath) {
      return json(req, { error: "missing ?path= parameter" }, 400);
    }
    const allowed = await discoverFilePaths();
    if (!allowed.has(filePath)) {
      return json(req, { error: "path not in discovered files" }, 403);
    }
    try {
      const data = await Deno.readFile(filePath);
      return new Response(data, {
        headers: {
          "content-type": "application/octet-stream",
          ...corsHeaders(req),
        },
      });
    } catch {
      return json(req, { error: "file not found" }, 404);
    }
  }

  return json(req, { error: "not found" }, 404);
}

function openBrowser(url: string) {
  const cmd = Deno.build.os === "windows" ? "cmd" : Deno.build.os === "darwin" ? "open" : "xdg-open";
  const args = Deno.build.os === "windows" ? ["/c", "start", url] : [url];
  new Deno.Command(cmd, { args, stdout: "null", stderr: "null" }).spawn();
}

if (import.meta.main) {
  Deno.serve(
    {
      port: PORT,
      onListen: () => {
        console.log(`TerraMap local server listening on http://localhost:${PORT}`);
        openBrowser(ALLOWED_ORIGIN);
      }
    },
    handler
  );
}

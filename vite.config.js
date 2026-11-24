import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DEFAULT_MODAL_API_URL = "https://vigo4real2016--persona-api.us-east.modal.run";

/**
 * Server-side middleware proxy for the Modal Persona API.
 * - Keeps CHAT_API_KEY on the server side when set in .env
 * - Also forwards client-supplied X-Chat-Api-Key if configured in the UI
 * - Uses native fetch with redirect: "follow" (Modal answers long cold-start waits with HTTP redirects)
 * - Streams text/event-stream responses chunk-by-chunk without buffering
 */
function personaApiProxyPlugin(env) {
  const attachMiddleware = (middlewares) => {
    middlewares.use("/api", async (req, res) => {
      const targetBase = (
        env.PERSONA_API_URL ||
        env.VITE_API_BASE_URL ||
        process.env.PERSONA_API_URL ||
        DEFAULT_MODAL_API_URL
      ).replace(/\/+$/, "");

      const serverKey =
        env.CHAT_API_KEY ||
        env.VITE_CHAT_API_KEY ||
        process.env.CHAT_API_KEY ||
        process.env.VITE_CHAT_API_KEY ||
        "";

      // Local status endpoint so the UI knows whether a server-side key is configured
      if (req.url === "/config-status" || req.url?.startsWith("/config-status?")) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            hasServerKey: Boolean(serverKey),
            baseUrl: targetBase,
          })
        );
        return;
      }

      try {
        // Normalize shorthand paths (/api/chat -> /v1/chat, /api/warmup -> /v1/warmup, /api/personas -> /v1/personas)
        let upstreamPath = req.url || "";
        if (upstreamPath === "/chat" || upstreamPath.startsWith("/chat?")) {
          upstreamPath = `/v1${upstreamPath}`;
        } else if (upstreamPath === "/warmup" || upstreamPath.startsWith("/warmup?")) {
          upstreamPath = `/v1${upstreamPath}`;
        } else if (upstreamPath === "/personas" || upstreamPath.startsWith("/personas?")) {
          upstreamPath = `/v1${upstreamPath}`;
        }

        const targetUrl = `${targetBase}${upstreamPath}`;
        const clientAuth = req.headers["authorization"];
        const clientKey = req.headers["x-chat-api-key"];

        const headers = new Headers();
        if (req.headers["content-type"]) {
          headers.set("Content-Type", req.headers["content-type"]);
        }
        if (req.headers["accept"]) {
          headers.set("Accept", req.headers["accept"]);
        }

        // All endpoints except /health require Authorization: Bearer <CHAT_API_KEY>
        if (!req.url?.startsWith("/health")) {
          if (clientKey) {
            headers.set("Authorization", `Bearer ${clientKey}`);
          } else if (serverKey) {
            headers.set("Authorization", `Bearer ${serverKey}`);
          } else if (clientAuth) {
            headers.set("Authorization", clientAuth);
          }
        }

        let body = undefined;
        if (req.method !== "GET" && req.method !== "HEAD") {
          body = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", () => resolve(Buffer.concat(chunks)));
            req.on("error", reject);
          });
        }

        const abortController = new AbortController();
        res.on("close", () => {
          if (!res.writableEnded) {
            abortController.abort();
          }
        });

        const upstream = await fetch(targetUrl, {
          method: req.method,
          headers,
          body: body && body.length > 0 ? body : undefined,
          redirect: "follow",
          signal: abortController.signal,
        });

        res.statusCode = upstream.status;
        const contentType = upstream.headers.get("content-type") || "application/json";
        res.setHeader("Content-Type", contentType);

        if (contentType.includes("text/event-stream")) {
          res.setHeader("Cache-Control", "no-cache, no-transform");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("X-Accel-Buffering", "no");
          res.flushHeaders?.();
        }

        if (!upstream.body) {
          res.end();
          return;
        }

        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.writableEnded) {
            res.write(Buffer.from(value));
          }
        }
        if (!res.writableEnded) {
          res.end();
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          if (!res.writableEnded) res.end();
          return;
        }
        if (!res.headersSent) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              type: "error",
              message: err?.message || "Failed to reach Modal Persona API",
            })
          );
        } else if (!res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: err?.message || "Stream interrupted",
            })}\n\n`
          );
          res.end();
        }
      }
    });
  };

  return {
    name: "persona-api-proxy",
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), personaApiProxyPlugin(env)],
  };
});

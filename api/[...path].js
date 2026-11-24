// Serverless / Edge Proxy for Modal Persona API (/api/health, /api/v1/chat, /api/v1/warmup, /api/v1/personas)
// Keeps CHAT_API_KEY on the server side as recommended in the Serving API README.

const DEFAULT_MODAL_API_URL = "https://vigo4real2016--persona-api.us-east.modal.run";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const url = new URL(req.url);
  let path = url.pathname.replace(/^\/api/, "") || "/";
  if (path === "/chat" || path === "/warmup" || path === "/personas") {
    path = `/v1${path}`;
  }

  const targetBase = (
    process.env.PERSONA_API_URL ||
    process.env.VITE_API_BASE_URL ||
    DEFAULT_MODAL_API_URL
  ).replace(/\/+$/, "");

  const serverKey =
    process.env.CHAT_API_KEY || process.env.VITE_CHAT_API_KEY || "";

  if (path === "/config-status") {
    return new Response(
      JSON.stringify({
        hasServerKey: Boolean(serverKey),
        baseUrl: targetBase,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const targetUrl = `${targetBase}${path}${url.search}`;
  const headers = new Headers();

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const accept = req.headers.get("accept");
  if (accept) headers.set("Accept", accept);

  if (!path.startsWith("/health")) {
    const clientKey = req.headers.get("x-chat-api-key");
    const clientAuth = req.headers.get("authorization");
    if (clientKey) {
      headers.set("Authorization", `Bearer ${clientKey}`);
    } else if (serverKey) {
      headers.set("Authorization", `Bearer ${serverKey}`);
    } else if (clientAuth) {
      headers.set("Authorization", clientAuth);
    }
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    redirect: "follow",
  });

  const responseHeaders = new Headers();
  const upstreamContentType =
    upstream.headers.get("content-type") || "application/json";
  responseHeaders.set("Content-Type", upstreamContentType);

  if (upstreamContentType.includes("text/event-stream")) {
    responseHeaders.set("Cache-Control", "no-cache, no-transform");
    responseHeaders.set("Connection", "keep-alive");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}


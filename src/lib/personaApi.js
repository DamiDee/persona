// ============================================================
// PERSONA — Live Modal Serving API Client (with Supabase RAG Sources)
// Implements /health, /v1/warmup, /v1/personas, and /v1/chat (SSE & JSON)
// Base URL: https://vigo4real2016--persona-api.us-east.modal.run
// ============================================================

import { resolveApiPersonaId } from "../data/mockPersonas";

export const DEFAULT_MODAL_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://vigo4real2016--persona-api.us-east.modal.run";

const STORAGE_KEY_API_KEY = "persona_chat_api_key";
const STORAGE_KEY_BASE_URL = "persona_api_base_url";
const STORAGE_KEY_USE_PROXY = "persona_api_use_proxy";

const MAX_MESSAGES_PER_REQUEST = 200;
const MAX_CHARS_PER_MESSAGE = 8000;

export function getStoredApiKey() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(STORAGE_KEY_API_KEY) ||
    import.meta.env.VITE_CHAT_API_KEY ||
    ""
  ).trim();
}

export function setStoredApiKey(key) {
  if (typeof window === "undefined") return;
  if (!key || !key.trim()) {
    window.localStorage.removeItem(STORAGE_KEY_API_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  }
}

export function getStoredBaseUrl() {
  if (typeof window === "undefined") return DEFAULT_MODAL_BASE_URL;
  return (
    window.localStorage.getItem(STORAGE_KEY_BASE_URL) || DEFAULT_MODAL_BASE_URL
  )
    .trim()
    .replace(/\/+$/, "");
}

export function setStoredBaseUrl(url) {
  if (typeof window === "undefined") return;
  if (!url || !url.trim()) {
    window.localStorage.removeItem(STORAGE_KEY_BASE_URL);
  } else {
    window.localStorage.setItem(
      STORAGE_KEY_BASE_URL,
      url.trim().replace(/\/+$/, "")
    );
  }
}

export function getUseServerProxy() {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem(STORAGE_KEY_USE_PROXY);
  return saved === null ? true : saved === "true";
}

export function setUseServerProxy(useProxy) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY_USE_PROXY, String(Boolean(useProxy)));
}

/**
 * Resolves the target URL and headers for an API call.
 * Prefers the local server proxy (/api/...) so CHAT_API_KEY stays server-side,
 * and falls back to direct Modal URL when needed.
 */
function buildRequestConfig(path, { requireAuth = true, forceDirect = false } = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const useProxy = !forceDirect && getUseServerProxy();
  const baseUrl = useProxy ? "/api" : getStoredBaseUrl();
  const url = `${baseUrl}${cleanPath}`;

  const headers = {
    Accept: "application/json",
  };

  if (requireAuth) {
    const apiKey = getStoredApiKey();
    if (apiKey) {
      if (useProxy) {
        headers["X-Chat-Api-Key"] = apiKey;
      }
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
  }

  return { url, headers, useProxy };
}

/**
 * Checks if the Vite/server proxy has a server-side CHAT_API_KEY configured.
 */
export async function checkServerProxyStatus() {
  try {
    const res = await fetch("/api/config-status", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { available: false, hasServerKey: false };
    const data = await res.json();
    return {
      available: true,
      hasServerKey: Boolean(data.hasServerKey),
      baseUrl: data.baseUrl || DEFAULT_MODAL_BASE_URL,
    };
  } catch {
    return { available: false, hasServerKey: false };
  }
}

/**
 * GET /health
 * Liveness check, no key needed. Returns {"status": "ok"}.
 */
export async function checkApiHealth() {
  const startedAt = performance.now();
  try {
    const { url, headers } = buildRequestConfig("/health", {
      requireAuth: false,
    });
    let res = await fetch(url, {
      method: "GET",
      headers,
      redirect: "follow",
    });

    if (res.status === 404 && url.startsWith("/api/")) {
      const direct = buildRequestConfig("/health", {
        requireAuth: false,
        forceDirect: true,
      });
      res = await fetch(direct.url, {
        method: "GET",
        headers: direct.headers,
        redirect: "follow",
      });
    }

    const latencyMs = Math.round(performance.now() - startedAt);
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = { status: res.ok ? "ok" : "error" };
    }

    return {
      ok: res.ok,
      status: res.status,
      latencyMs,
      data: payload,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      latencyMs: Math.round(performance.now() - startedAt),
      error: err?.message || "Unreachable",
    };
  }
}

/**
 * POST /v1/warmup
 * Wakes the model when the chat page opens.
 * Returns {"ready": true} once the model is up (can take up to ~4 minutes on cold start).
 */
export async function warmupPersonaGpu({ signal } = {}) {
  const startedAt = performance.now();
  const { url, headers } = buildRequestConfig("/v1/warmup", {
    requireAuth: true,
  });

  let res = await fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    redirect: "follow",
    signal,
  });

  if (res.status === 404 && url.startsWith("/api/")) {
    const direct = buildRequestConfig("/v1/warmup", {
      requireAuth: true,
      forceDirect: true,
    });
    res = await fetch(direct.url, {
      method: "POST",
      headers: {
        ...direct.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      redirect: "follow",
      signal,
    });
  }

  const elapsedMs = Math.round(performance.now() - startedAt);

  if (res.status === 401 || res.status === 403) {
    const err = new Error("Missing or wrong API key for /v1/warmup");
    err.code = "AUTH_REQUIRED";
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    let errText = "";
    try {
      errText = await res.text();
    } catch {
      // ignore
    }
    throw new Error(errText || `Warmup failed with HTTP ${res.status}`);
  }

  let data = { ready: true };
  try {
    data = await res.json();
  } catch {
    data = { ready: true };
  }

  return {
    ok: true,
    ready: data?.ready !== false,
    elapsedMs,
    data,
  };
}

/**
 * GET /v1/personas
 * Lists personas: [{"id": "ajs", "name": "Apostle Joshua Selman (AI persona)"}]
 */
export async function fetchRemotePersonas({ signal } = {}) {
  const { url, headers } = buildRequestConfig("/v1/personas", {
    requireAuth: true,
  });

  let res = await fetch(url, {
    method: "GET",
    headers,
    redirect: "follow",
    signal,
  });

  if (res.status === 404 && url.startsWith("/api/")) {
    const direct = buildRequestConfig("/v1/personas", {
      requireAuth: true,
      forceDirect: true,
    });
    res = await fetch(direct.url, {
      method: "GET",
      headers: direct.headers,
      redirect: "follow",
      signal,
    });
  }

  if (res.status === 401 || res.status === 403) {
    const err = new Error("Missing or wrong API key for /v1/personas");
    err.code = "AUTH_REQUIRED";
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch personas (HTTP ${res.status})`);
  }

  const payload = await res.json();

  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.personas)) {
    return payload.personas;
  }
  if (payload && typeof payload === "object") {
    return Object.entries(payload).map(([id, val]) =>
      typeof val === "object" && val !== null
        ? { id, ...val }
        : { id, name: String(val) }
    );
  }
  return [];
}

/**
 * Converts internal conversation messages to the strict format required by POST /v1/chat:
 * - 1 to 200 items, roles "user" / "assistant" only ("persona" -> "assistant")
 * - Max 8,000 characters per message
 * - Excludes any errored or incomplete streaming replies
 * - Last message must have role "user"
 */
export function buildApiMessages(conversationMessages = [], latestUserContent = null) {
  const cleaned = [];

  for (const msg of conversationMessages) {
    if (!msg || msg.isStreaming || msg.isError) continue;
    const rawContent = typeof msg.content === "string" ? msg.content.trim() : "";
    if (!rawContent) continue;

    const content =
      rawContent.length > MAX_CHARS_PER_MESSAGE
        ? rawContent.slice(0, MAX_CHARS_PER_MESSAGE)
        : rawContent;

    const role = msg.role === "user" ? "user" : "assistant";
    cleaned.push({ role, content });
  }

  if (latestUserContent && latestUserContent.trim()) {
    const trimmed = latestUserContent.trim().slice(0, MAX_CHARS_PER_MESSAGE);
    const last = cleaned[cleaned.length - 1];
    if (!last || last.role !== "user" || last.content !== trimmed) {
      cleaned.push({ role, content: trimmed });
    }
  }

  // Ensure the last message is role: "user"
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].role !== "user") {
    cleaned.pop();
  }

  // Enforce 1 to 200 items limit
  if (cleaned.length > MAX_MESSAGES_PER_REQUEST) {
    return cleaned.slice(cleaned.length - MAX_MESSAGES_PER_REQUEST);
  }

  return cleaned;
}

/**
 * POST /v1/chat
 * Streams SSE events from the Modal Persona API in order:
 * 1. {"type": "start", "persona": "ajs"}
 * 2. {"type": "sources", "sources": [{"id": 4412, "title": "...", "source": "...", "chunk_index": 37, "similarity": 0.562, "excerpt": "..."}]}
 * 3. {"type": "delta", "text": "..."}
 * 4. {"type": "done", "finish_reason": "stop" | "length" | "guardrail", "used_context": true, "guardrail": "crisis"}
 * or {"type": "error", "message": "..."}
 *
 * Also supports stream: false which returns:
 * {"reply": "...", "sources": [...], "finish_reason": "stop", "used_context": true}
 */
export async function* streamPersonaChat({
  persona = "ajs",
  messages,
  userId,
  stream = true,
  length = "normal",
  format = "markdown",
  signal,
}) {
  const apiPersona = resolveApiPersonaId(persona);
  const formattedMessages = buildApiMessages(messages);

  if (formattedMessages.length === 0) {
    throw new Error("Cannot call /v1/chat without at least one user message.");
  }

  const validLength = ["short", "normal", "long"].includes(length)
    ? length
    : "normal";
  const validFormat = ["markdown", "plain"].includes(format)
    ? format
    : "markdown";

  const requestBody = {
    persona: apiPersona,
    messages: formattedMessages,
    stream: Boolean(stream),
    length: validLength,
    format: validFormat,
    ...(userId ? { user_id: String(userId) } : {}),
  };

  const { url, headers } = buildRequestConfig("/v1/chat", {
    requireAuth: true,
  });

  const requestInit = {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Accept: stream
        ? "text/event-stream, application/json"
        : "application/json",
    },
    body: JSON.stringify(requestBody),
    redirect: "follow",
    signal,
  };

  let res = await fetch(url, requestInit);

  if (res.status === 404 && url.startsWith("/api/")) {
    const direct = buildRequestConfig("/v1/chat", {
      requireAuth: true,
      forceDirect: true,
    });
    res = await fetch(direct.url, {
      ...requestInit,
      headers: {
        ...direct.headers,
        "Content-Type": "application/json",
        Accept: stream
          ? "text/event-stream, application/json"
          : "application/json",
      },
    });
  }

  if (res.status === 401 || res.status === 403) {
    const err = new Error(
      "Missing or wrong API key (401). Please configure a valid CHAT_API_KEY."
    );
    err.code = "AUTH_REQUIRED";
    err.status = res.status;
    throw err;
  }

  if (res.status === 404) {
    const err = new Error(`Unknown persona "${apiPersona}" (404).`);
    err.status = 404;
    throw err;
  }

  if (res.status === 422) {
    let detail = "Invalid request body (422).";
    try {
      const errJson = await res.json();
      detail = errJson.message || errJson.detail || detail;
    } catch {
      // ignore
    }
    const err = new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail)
    );
    err.status = 422;
    throw err;
  }

  if (!res.ok) {
    let errMessage =
      res.status === 502
        ? "The model failed to generate a reply (502). Please try again."
        : `Chat API error (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      errMessage =
        errJson.message || errJson.detail || errJson.error || errMessage;
    } catch {
      try {
        const text = await res.text();
        if (text) errMessage = text;
      } catch {
        // ignore
      }
    }
    const err = new Error(errMessage);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";

  // Handle non-streaming JSON response: {"reply": "...", "sources": [...], "finish_reason": "stop", "used_context": true}
  if (!stream || contentType.includes("application/json")) {
    const data = await res.json();
    if (data.type === "error") {
      throw new Error(data.message || "Model error");
    }
    yield { type: "start", persona: apiPersona };
    if (Array.isArray(data.sources)) {
      yield { type: "sources", sources: data.sources };
    }
    if (typeof data.reply === "string") {
      yield { type: "delta", text: data.reply };
    }
    yield {
      type: "done",
      finish_reason: data.finish_reason || "stop",
      used_context: Boolean(data.used_context),
      guardrail: data.guardrail || null,
    };
    return;
  }

  // Parse SSE text/event-stream response
  if (!res.body) {
    throw new Error("Response body is empty.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const processLine = (rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith(":")) return null;
    if (line.startsWith("data:")) {
      const jsonStr = line.slice(5).trim();
      if (!jsonStr || jsonStr === "[DONE]") return null;
      try {
        return JSON.parse(jsonStr);
      } catch {
        return null;
      }
    }
    if (line.startsWith("{") && line.endsWith("}")) {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }
    return null;
  };

  const KNOWN_EVENT_TYPES = new Set([
    "start",
    "sources",
    "delta",
    "done",
    "error",
  ]);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        const event = processLine(line);
        // Ignore unrecognized event types as specified in the Handover doc
        if (event && KNOWN_EVENT_TYPES.has(event.type)) {
          yield event;
        }
      }
    }

    if (buffer.trim()) {
      for (const line of buffer.split(/\r?\n/)) {
        const event = processLine(line);
        if (event && KNOWN_EVENT_TYPES.has(event.type)) {
          yield event;
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

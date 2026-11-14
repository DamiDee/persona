// ApiConnectionModal.jsx — Modal Serving API configuration, GPU warmup, and endpoint diagnostics

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Flame,
  KeyRound,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import clsx from "clsx";
import { Modal } from "../ui/Modal";
import { useChatStore } from "../../store/useChatStore";
import {
  DEFAULT_MODAL_BASE_URL,
  getStoredApiKey,
  getStoredBaseUrl,
} from "../../lib/personaApi";
import { useToast } from "../ui/Toast";

export function ApiConnectionModal({ isOpen, onClose, onRetryPendingMessage }) {
  const {
    apiMode,
    useStreamProtocol,
    setUseStreamProtocol,
    healthStatus,
    healthLatencyMs,
    warmupStatus,
    lastWarmupAt,
    hasServerKey,
    remotePersonas,
    saveApiCredentials,
    checkHealth,
    warmupGpu,
    syncPersonas,
  } = useChatStore();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [baseUrlInput, setBaseUrlInput] = useState(DEFAULT_MODAL_BASE_URL);
  const [selectedMode, setSelectedMode] = useState(apiMode);
  const [isTesting, setIsTesting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getStoredApiKey());
      setBaseUrlInput(getStoredBaseUrl());
      setSelectedMode(apiMode);
      checkHealth();
    }
  }, [isOpen, apiMode, checkHealth]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsTesting(true);
    try {
      await saveApiCredentials({
        apiKey: apiKeyInput,
        baseUrl: baseUrlInput || DEFAULT_MODAL_BASE_URL,
        apiMode: selectedMode,
      });

      addToast({
        title:
          selectedMode === "live"
            ? "Modal Serving API Connected"
            : "Switched to Demo Simulation",
        description:
          selectedMode === "live"
            ? "Endpoint credentials saved. Waking GPU via /v1/warmup..."
            : "Responses will use local simulated streaming.",
        type: "success",
      });

      if (onRetryPendingMessage && (apiKeyInput.trim() || hasServerKey || selectedMode === "demo")) {
        onRetryPendingMessage();
      }
      onClose();
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualWarmup = async () => {
    if (apiKeyInput.trim() !== getStoredApiKey()) {
      await saveApiCredentials({
        apiKey: apiKeyInput,
        baseUrl: baseUrlInput || DEFAULT_MODAL_BASE_URL,
        apiMode: "live",
      });
    }
    const res = await warmupGpu({ force: true });
    if (res?.ok) {
      addToast({
        title: "GPU Warmed Up",
        description: "Modal L40S GPU is awake and warm for the next 5 minutes.",
        type: "success",
      });
      syncPersonas();
    } else {
      addToast({
        title: "Warmup Notice",
        description:
          res?.error?.message || "Ensure CHAT_API_KEY is configured.",
        type: "warning",
      });
    }
  };

  const warmMinutesLeft = lastWarmupAt
    ? Math.max(0, Math.ceil((5 * 60 * 1000 - (Date.now() - lastWarmupAt)) / 60000))
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="text-[var(--color-text-primary)] font-sans space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] shadow-sm">
              <Cpu size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
                  Modal Persona Serving Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/25">
                  vLLM · L40S
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Configure <code className="font-mono text-[11px]">/v1/chat</code>,{" "}
                <code className="font-mono text-[11px]">/v1/warmup</code>,{" "}
                <code className="font-mono text-[11px]">/v1/personas</code> &amp;{" "}
                <code className="font-mono text-[11px]">/health</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Live Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Health Card */}
          <div className="p-3 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)]">
                GET /health
              </span>
              <button
                type="button"
                onClick={() => checkHealth()}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                title="Refresh health check"
              >
                <RefreshCw
                  size={12}
                  className={healthStatus === "checking" ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "w-2 h-2 rounded-full",
                  healthStatus === "healthy"
                    ? "bg-emerald-500"
                    : healthStatus === "checking"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-zinc-400"
                )}
              />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {healthStatus === "healthy"
                  ? "API Online"
                  : healthStatus === "checking"
                  ? "Checking..."
                  : "Standby"}
              </span>
              {healthLatencyMs ? (
                <span className="ml-auto text-[10px] font-mono text-[var(--color-text-tertiary)]">
                  {healthLatencyMs}ms
                </span>
              ) : null}
            </div>
          </div>

          {/* GPU Warmup Card */}
          <div className="p-3 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)]">
                POST /v1/warmup
              </span>
              <Flame
                size={12}
                className={
                  warmupStatus === "warm"
                    ? "text-emerald-500"
                    : warmupStatus === "warming"
                    ? "text-amber-500 animate-pulse"
                    : "text-[var(--color-text-tertiary)]"
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {warmupStatus === "warm"
                  ? `GPU Warm (${warmMinutesLeft || 5}m)`
                  : warmupStatus === "warming"
                  ? "Waking GPU..."
                  : warmupStatus === "auth_required"
                  ? "Needs API Key"
                  : "Scale-to-Zero Idle"}
              </span>
              <button
                type="button"
                onClick={handleManualWarmup}
                disabled={warmupStatus === "warming"}
                className="px-2 py-0.5 rounded-md bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Wake
              </button>
            </div>
          </div>

          {/* Persona Registry Card */}
          <div className="p-3 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)]">
                GET /v1/personas
              </span>
              <Radio size={12} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                Adapter: <code className="font-mono text-[var(--color-accent)]">ajs</code>
                {remotePersonas.length > 1
                  ? ` (+${remotePersonas.length - 1})`
                  : ""}
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                ~27 tok/s
              </span>
            </div>
          </div>
        </div>

        {/* Engine Mode Selector */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Inference Mode
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedMode("live")}
              className={clsx(
                "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3",
                selectedMode === "live"
                  ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent)] shadow-sm"
                  : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
              )}
            >
              <Server
                size={16}
                className={
                  selectedMode === "live"
                    ? "text-[var(--color-accent)] mt-0.5 shrink-0"
                    : "text-[var(--color-text-tertiary)] mt-0.5 shrink-0"
                }
              />
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  Live Modal API
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                  Streams from fine-tuned <code className="font-mono">ajs</code>{" "}
                  LoRA adapter via <code className="font-mono">/v1/chat</code>
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("demo")}
              className={clsx(
                "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3",
                selectedMode === "demo"
                  ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent)] shadow-sm"
                  : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
              )}
            >
              <Sparkles
                size={16}
                className={
                  selectedMode === "demo"
                    ? "text-[var(--color-accent)] mt-0.5 shrink-0"
                    : "text-[var(--color-text-tertiary)] mt-0.5 shrink-0"
                }
              />
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  Simulated Demo
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                  Offline curated responses when testing UI without a GPU key
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="chat-api-key-input"
                className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5"
              >
                <KeyRound size={13} className="text-[var(--color-accent)]" />
                <span>CHAT_API_KEY (Bearer Token)</span>
              </label>
              {hasServerKey && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                  <CheckCircle2 size={12} /> Loaded from server .env
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="chat-api-key-input"
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  hasServerKey
                    ? "Server .env CHAT_API_KEY active (optional override)..."
                    : "Paste your CHAT_API_KEY from Modal persona-secrets..."
                }
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] focus:border-[var(--color-accent)] text-xs font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
              Sent via the server-side <code className="font-mono">/api</code>{" "}
              proxy as{" "}
              <code className="font-mono">
                Authorization: Bearer &lt;CHAT_API_KEY&gt;
              </code>
              . You can also set <code className="font-mono">CHAT_API_KEY</code>{" "}
              in <code className="font-mono">.env</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="modal-base-url-input"
                className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5"
              >
                <Terminal size={13} className="text-[var(--color-accent)]" />
                <span>Modal Base URL</span>
              </label>
              <input
                id="modal-base-url-input"
                type="url"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder={DEFAULT_MODAL_BASE_URL}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-accent)] text-[11px] font-mono text-[var(--color-text-primary)] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                <Activity size={13} className="text-[var(--color-accent)]" />
                <span>Response Transport</span>
              </label>
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setUseStreamProtocol(true)}
                  className={clsx(
                    "flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    useStreamProtocol
                      ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  SSE Stream (stream: true)
                </button>
                <button
                  type="button"
                  onClick={() => setUseStreamProtocol(false)}
                  className={clsx(
                    "flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    !useStreamProtocol
                      ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  JSON (stream: false)
                </button>
              </div>
            </div>
          </div>

          {/* Cold start info note */}
          <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-start gap-2.5 text-[11px] text-[var(--color-text-secondary)]">
            <ShieldCheck
              size={15}
              className="text-[var(--color-accent)] shrink-0 mt-0.5"
            />
            <div className="leading-relaxed">
              <span className="font-semibold text-[var(--color-text-primary)]">
                Modal Scale-to-Zero Note:
              </span>{" "}
              About 2s to first token &amp; 27 tokens/s when warm; up to ~4
              minutes if waking from a cold start. HTTP redirects are followed
              automatically, and crisis guardrails are active.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] text-[var(--color-button-text)] text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isTesting ? "Connecting..." : "Save & Connect"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default ApiConnectionModal;

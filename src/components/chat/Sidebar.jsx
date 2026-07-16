// Sidebar — persistent left sidebar for the App layout
// Contains: persona switcher, new chat, recent chats list, settings strip

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Toggle } from "../ui/Toggle";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { groupChatsByDate } from "../../data/mockChats";
import { getPersonaById, mockPersonas } from "../../data/mockPersonas";

function ChatRow({ chat, isActive, onSelect, onDelete, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(chat.title);
  const persona = getPersonaById(chat.personaId);

  const handleRename = () => {
    if (renameValue.trim()) {
      onRename(chat.id, renameValue.trim());
    }
    setRenaming(false);
    setMenuOpen(false);
  };

  return (
    <div
      className={clsx(
        "relative group flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)]",
        "cursor-pointer transition-all duration-150",
        isActive
          ? "bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]"
          : "hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
      )}
      onClick={() => !renaming && onSelect(chat.id)}
      aria-current={isActive ? "page" : undefined}
      role="listitem"
    >
      <Avatar
        name={persona?.name}
        gradient={persona?.avatarGradient}
        size="xs"
        className="flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") { setRenaming(false); setMenuOpen(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none border-b border-[var(--color-accent)]"
          />
        ) : (
          <p className="text-[13px] truncate">{chat.title}</p>
        )}
      </div>

      {/* 3-dot menu */}
      {!renaming && (
        <div className="relative">
          <button
            aria-label="Chat options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className={clsx(
              "w-6 h-6 flex items-center justify-center rounded",
              "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]",
              "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150"
            )}
          >
            <MoreHorizontal size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 z-30 glass-strong rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-1 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setRenaming(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <Pencil size={13} /> Rename
                </button>
                <button
                  onClick={() => { onDelete(chat.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[var(--color-destructive)] hover:bg-[var(--color-destructive-subtle)] transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed, onToggleCollapse, onOpenLibrary }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createNewChat,
    deleteChat,
    renameChat,
    activePersonaId,
  } = useChatStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const grouped = groupChatsByDate(conversations);
  const activePersona = mockPersonas.find((p) => p.id === activePersonaId);

  const handleSelectChat = (chatId) => {
    setActiveConversation(chatId);
    navigate(`/app/chat/${chatId}`);
  };

  const handleNewChat = () => {
    if (activePersonaId) {
      const chatId = createNewChat(activePersonaId);
      navigate(`/app/chat/${chatId}`);
    } else {
      navigate("/app/library");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (collapsed) {
    return (
      <motion.aside
        initial={false}
        animate={{ width: 72 }}
        className="hidden lg:flex flex-col h-full glass-md border-r border-[var(--color-border)] py-4 px-2 gap-3 flex-shrink-0"
        aria-label="Navigation sidebar (collapsed)"
      >
        {/* Expand button */}
        <button
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-all"
        >
          <ChevronRight size={18} />
        </button>

        {/* New chat */}
        <button
          onClick={handleNewChat}
          aria-label="New chat"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-button-text)] transition-all hover:shadow-[var(--shadow-accent)]"
        >
          <Plus size={18} />
        </button>

        <div className="flex-1" />

        {/* Settings */}
        <button
          onClick={() => navigate("/app/settings")}
          aria-label="Settings"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-all"
        >
          <Settings size={16} />
        </button>

        {/* User avatar */}
        <Avatar
          name={user?.name}
          size="sm"
          className="mx-auto cursor-pointer"
          onClick={() => navigate("/app/settings")}
        />
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: 280 }}
      className="hidden lg:flex flex-col h-full glass-md border-r border-[var(--color-border)] flex-shrink-0"
      aria-label="Navigation sidebar"
    >
      {/* Top: collapse + persona */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--color-border)]">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={onOpenLibrary}
          role="button"
          aria-label="Switch persona"
        >
          {activePersona ? (
            <Avatar
              src={activePersona.avatar}
              name={activePersona.name}
              gradient={activePersona.avatarGradient}
              size="sm"
              animated
            />
          ) : (
            <img src="/1.png" alt="Persona Logo" className="w-12 h-12 object-contain" />
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
              {activePersona?.name || "Choose Persona"}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
              {activePersona?.tagline || "Select to start chatting"}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-all flex-shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* New chat button */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewChat}
          className={clsx(
            "w-full flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]",
            "bg-[var(--color-accent)] text-[var(--color-button-text)] font-medium text-[14px]",
            "hover:shadow-[var(--shadow-accent)] transition-all duration-200",
            "hover:bg-[var(--color-accent-glow)]"
          )}
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Recent chats */}
      <div className="flex-1 overflow-y-auto px-2 pb-2" role="list" aria-label="Recent conversations">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <MessageSquare size={24} className="text-[var(--color-text-tertiary)]" />
            <p className="text-[13px] text-[var(--color-text-tertiary)]">
              No conversations yet. Start a new chat!
            </p>
          </div>
        ) : (
          grouped.map(([label, chats]) => (
            <div key={label} className="mb-4">
              <p className="text-caption px-3 py-1.5">{label}</p>
              {chats.map((chat) => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeConversationId}
                  onSelect={handleSelectChat}
                  onDelete={deleteChat}
                  onRename={renameChat}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[var(--color-border)] p-3 space-y-1">
        {/* Upgrade prompt (if free) */}
        {user?.plan !== "premium" && (
          <button
            onClick={() => navigate("/app/premium")}
            className={clsx(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)]",
              "bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20",
              "text-[var(--color-accent)] text-[13px] font-medium",
              "hover:bg-[var(--color-accent-subtle-hover)] transition-colors duration-150"
            )}
          >
            <Crown size={14} />
            Upgrade to Premium
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => navigate("/app/settings")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
          aria-label="Settings"
        >
          <Settings size={15} />
          <span className="text-[13px]">Settings</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Avatar name={user?.name} size="sm" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[var(--color-text-primary)] truncate font-medium">
              {user?.name || "Guest"}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
              {user?.plan === "premium" ? "Premium" : "Free plan"}
            </p>
          </div>
          <Toggle
            checked={isDark}
            onChange={(v) => setTheme(v ? "dark" : "light")}
            id="sidebar-theme-toggle"
          />
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;

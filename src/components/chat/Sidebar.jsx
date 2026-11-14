// Sidebar.jsx — Slim persistent left navigation sidebar with global ThemeToggle integration
// Light & Dark mode support, Lucide icons, zero emoji.

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Compass,
  LogOut,
  Brain,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar";
import { ProductLogo } from "../ui/ProductLogo";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
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
        "relative group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans",
        "cursor-pointer transition-all duration-150",
        isActive
          ? "bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)] font-semibold border border-[var(--color-accent)]/20"
          : "hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      )}
      onClick={() => !renaming && onSelect(chat.id)}
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
              if (e.key === "Escape") {
                setRenaming(false);
                setMenuOpen(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-xs text-[var(--color-text-primary)] outline-none border-b border-[var(--color-accent)]"
          />
        ) : (
          <p className="truncate">{chat.title}</p>
        )}
      </div>

      {/* Options */}
      {!renaming && (
        <div className="relative">
          <button
            aria-label="Chat options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
          >
            <MoreHorizontal size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="absolute right-0 top-8 z-40 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-xl py-1 min-w-[130px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                >
                  <Pencil size={12} /> Rename
                </button>
                <button
                  onClick={() => {
                    onDelete(chat.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} /> Delete
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredConversations = conversations.filter((chat) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const persona = getPersonaById(chat.personaId);
    return `${chat.title} ${chat.lastMessage} ${persona?.name || ""}`.toLowerCase().includes(query);
  });
  const grouped = groupChatsByDate(filteredConversations);
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

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] py-4 px-2.5 gap-4 flex-shrink-0 w-16 font-sans">
        <button
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={handleNewChat}
          aria-label="New chat"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          <Plus size={18} />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => navigate("/app/library")}
          title="Persona Library"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
        >
          <Compass size={18} />
        </button>

        <button
          onClick={() => navigate("/app/settings")}
          title="Settings"
          className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
        >
          <Settings size={18} />
        </button>

        <Avatar name={user?.name} size="sm" className="mx-auto cursor-pointer" onClick={() => navigate("/app/settings")} />
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex-shrink-0 w-64 font-sans">
      {/* Product Header */}
      <div className="px-4 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
        <button type="button" onClick={() => navigate("/")} aria-label="Go to Persona home" className="rounded-xl shadow-sm">
          <ProductLogo compact />
        </button>

        <button
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* New Conversation Action */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenLibrary}
          className="mb-2.5 w-full flex items-center gap-2.5 p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] text-left hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
        >
          {activePersona ? (
            <Avatar src={activePersona.avatar} name={activePersona.name} gradient={activePersona.avatarGradient} size="sm" animated />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
              <Brain size={16} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
              {activePersona?.name || "Choose Persona"}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
              {activePersona?.tagline || "Select a mind"}
            </p>
          </div>
        </button>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-base)] font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>New Conversation</span>
        </button>
        <label className="mt-2.5 h-10 px-3 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] flex items-center gap-2 focus-within:border-[var(--color-accent)] transition-colors">
          <Search size={13} className="shrink-0 text-[var(--color-text-tertiary)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 bg-transparent outline-none text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
        </label>
      </div>

      {/* Explore Navigation */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={() => navigate("/app/library")}
          className={clsx(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer",
            location.pathname.includes("/library")
              ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          )}
        >
          <Compass size={14} />
          <span>Explore Personas</span>
        </button>
      </div>

      {/* Recent Chats List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--color-text-tertiary)]">
            {searchQuery ? "No matching conversations." : "No recent conversations."}
          </div>
        ) : (
          grouped.map(([label, chats]) => (
            <div key={label} className="space-y-1">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] px-3 py-1">
                {label}
              </p>
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

      {/* Footer Profile & Global ThemeToggle */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-2.5">
        {user?.plan !== "premium" && (
          <button
            onClick={() => navigate("/app/premium")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <Crown size={13} />
            <span>Upgrade to PRO</span>
          </button>
        )}



        {/* User Footer */}
        <div className="flex items-center justify-between px-1 pt-1 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/app/settings")}>
            <Avatar name={user?.name} size="xs" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{user?.name || "Guest"}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">{user?.plan === "premium" ? "PRO User" : "Free Plan"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/app/settings")}
              className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

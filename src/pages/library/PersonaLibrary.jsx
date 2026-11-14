// PersonaLibrary.jsx — Editorial Character Selection Experience
// Light-first theme support, responsive grid, zero emoji, Lucide icons.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, MessageCircle, Lock, Compass } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { PersonaCard } from "../../components/ui/PersonaCard";
import { mockPersonas, PERSONA_CATEGORIES } from "../../data/mockPersonas";
import { useChatStore } from "../../store/useChatStore";

function PersonaProfileModal({ persona, onClose, onStartChat }) {
  if (!persona) return null;

  return (
    <Modal isOpen={!!persona} onClose={onClose} size="lg" title={persona.name}>
      <div className="space-y-6 text-[var(--color-text-primary)] font-sans">
        {/* Header */}
        <div className="flex items-center gap-5">
          <Avatar src={persona.avatar} name={persona.name} gradient={persona.avatarGradient} size="xl" animated />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                {persona.tagline}
              </p>
              {persona.isPremium && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  PRO
                </span>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {persona.sourceMaterial.map((src) => (
                <div key={src.type} className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                  <BookOpen size={12} className="text-[var(--color-accent)]" />
                  <span>{src.count} {src.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
            {persona.bio}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          {persona.isPremium ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                onClose();
                window.location.href = "/app/premium";
              }}
              className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
            >
              <Lock size={15} />
              Upgrade to Access
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={() => onStartChat(persona)}
              className="bg-[var(--color-accent)] text-[var(--color-button-text)] hover:bg-[var(--color-accent-glow)]"
            >
              <MessageCircle size={15} />
              Start Conversation
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function PersonaLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPersonaModal, setSelectedPersonaModal] = useState(null);
  const { createNewChat, personas, syncPersonas } = useChatStore();

  useEffect(() => {
    syncPersonas();
  }, [syncPersonas]);

  const personaCatalog = personas?.length ? personas : mockPersonas;

  const filtered = personaCatalog.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectPersona = (persona) => {
    if (persona.isPremium) {
      setSelectedPersonaModal(persona);
    } else {
      const chatId = createNewChat(persona.id);
      navigate(`/app/chat/${chatId}`);
    }
  };

  const handleStartChatFromModal = (persona) => {
    setSelectedPersonaModal(null);
    const chatId = createNewChat(persona.id);
    navigate(`/app/chat/${chatId}`);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-10 max-w-7xl mx-auto font-sans text-[var(--color-text-primary)]">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10 space-y-6"
      >
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] flex items-center gap-1.5">
            <Compass size={14} /> Persona Selection
          </span>
          <h1 className="text-[var(--color-text-primary)] text-3xl sm:text-5xl font-extrabold tracking-tight">
            Choose your Persona
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base max-w-xl">
            Every mind offers a different way of seeing the world. Select a persona to begin exploring their corpus.
          </p>
        </div>

        {/* Search Bar + Category Pills */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personas by name or tagline..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {PERSONA_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
                    isActive
                      ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-sm"
                      : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Responsive Character Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[var(--color-bg-elevated)] rounded-3xl border border-[var(--color-border)] space-y-3"
          >
            <p className="text-[var(--color-text-secondary)] text-base font-medium">
              No personas match your search filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="text-xs font-bold text-[var(--color-accent)] hover:underline"
            >
              Reset filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={handleSelectPersona}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Detail Modal */}
      <PersonaProfileModal
        persona={selectedPersonaModal}
        onClose={() => setSelectedPersonaModal(null)}
        onStartChat={handleStartChatFromModal}
      />
    </div>
  );
}

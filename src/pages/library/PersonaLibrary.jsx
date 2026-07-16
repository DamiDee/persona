// PersonaLibrary — browse and select personas

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, MessageCircle, Lock } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { Modal } from "../../components/ui/Modal";
import { Skeleton, PersonaCardSkeleton } from "../../components/ui/Skeleton";
import { mockPersonas, PERSONA_CATEGORIES } from "../../data/mockPersonas";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

function PersonaCard({ persona, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      onClick={onClick}
      className={clsx(
        "glass rounded-[var(--radius-lg)] p-6 cursor-pointer",
        "border border-[var(--color-border)] transition-all duration-200",
        "hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_rgba(0,194,209,0.12)]",
        "flex flex-col items-center gap-4 text-center",
        "group"
      )}
      role="button"
      aria-label={`View ${persona.name}'s profile`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar
          src={persona.avatar}
          name={persona.name}
          gradient={persona.avatarGradient}
          size="xl"
          animated
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {persona.isPremium && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="premium" showLock>Pro</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <h3 className="text-[var(--color-text-primary)] font-semibold text-[17px]">
          {persona.name}
        </h3>
        <p className="text-[var(--color-text-secondary)] text-[14px]">
          {persona.tagline}
        </p>
      </div>

      {/* Source stats */}
      <div className="flex gap-3 flex-wrap justify-center">
        {persona.sourceMaterial.slice(0, 2).map((src) => (
          <div key={src.type} className="flex items-center gap-1 text-[12px] text-[var(--color-text-tertiary)]">
            <BookOpen size={11} />
            <span>{src.count} {src.type}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full mt-1">
        {persona.isPremium ? (
          <div className={clsx(
            "flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]",
            "bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20",
            "text-[var(--color-accent)] text-[13px] font-medium"
          )}>
            <Lock size={13} />
            Premium Only
          </div>
        ) : (
          <div className={clsx(
            "flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]",
            "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-[13px] font-medium",
            "group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-button-text)] transition-all duration-200"
          )}>
            <MessageCircle size={13} />
            Start Conversation
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PersonaProfileModal({ persona, onClose, onStartChat }) {
  if (!persona) return null;

  return (
    <Modal isOpen={!!persona} onClose={onClose} size="lg" title={persona.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-5">
          <Avatar src={persona.avatar} name={persona.name} gradient={persona.avatarGradient} size="xl" animated />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[var(--color-text-secondary)] text-[15px]">
                {persona.tagline}
              </p>
              {persona.isPremium && <Badge variant="premium" showLock>Premium</Badge>}
            </div>
            <div className="flex gap-4 flex-wrap">
              {persona.sourceMaterial.map((src) => (
                <div key={src.type} className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)]">
                  <BookOpen size={12} />
                  <span>{src.count} {src.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="glass rounded-[var(--radius-md)] p-4">
          <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">
            {persona.longBio}
          </p>
        </div>

        {/* Demo disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20">
          <span className="text-[var(--color-accent)] text-[13px] leading-relaxed">
            ⓘ This is a placeholder demo persona. Real persona training requires content licensing — see README for details.
          </span>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          {persona.isPremium ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => { onClose(); window.location.href = "/app/premium"; }}
            >
              <Lock size={15} />
              Upgrade to Access
            </Button>
          ) : (
            <Button variant="primary" fullWidth onClick={() => onStartChat(persona)}>
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
  const [selectedPersona, setSelectedPersona] = useState(null);
  const { createNewChat } = useChatStore();

  const filtered = mockPersonas.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartChat = (persona) => {
    setSelectedPersona(null);
    const chatId = createNewChat(persona.id);
    navigate(`/app/chat/${chatId}`);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 space-y-6"
      >
        <div>
          <h1 className="text-[var(--color-text-primary)] text-3xl font-bold tracking-tight">
            Choose who you'd like to talk to
          </h1>
          <p className="text-[var(--color-text-secondary)] text-[17px] mt-2">
            Each Persona is built from their own corpus of teachings and writings.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personas..."
              aria-label="Search personas"
              className={clsx(
                "w-full pl-10 pr-4 py-2.5 rounded-full glass",
                "border border-[var(--color-border)] text-[14px]",
                "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
                "outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]",
                "transition-all duration-200"
              )}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {PERSONA_CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.id ? "active" : "category"}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-[var(--color-text-tertiary)] text-[17px]">
              No personas match your search.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onClick={() => setSelectedPersona(persona)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile modal */}
      <PersonaProfileModal
        persona={selectedPersona}
        onClose={() => setSelectedPersona(null)}
        onStartChat={handleStartChat}
      />
    </div>
  );
}

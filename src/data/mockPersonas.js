// ============================================================
// PERSONA — Persona Registry & Metadata
// Maps frontend personas to Modal API LoRA adapters (e.g. "ajs")
// and merges with live GET /v1/personas discovery.
// ============================================================

export const PERSONA_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "faith", label: "Faith" },
  { id: "leadership", label: "Leadership" },
  { id: "literature", label: "Literature" },
  { id: "culture", label: "Culture" },
];

export const mockPersonas = [
  {
    id: "persona-01",
    apiPersonaId: "ajs",
    adapterName: "ajs (LoRA · L40S)",
    isLiveAdapter: true,
    name: "Joshua Selman",
    tagline: "Faith & Spiritual Growth",
    category: "faith",
    bio: "A voice dedicated to the pursuit of spiritual depth, kingdom principles, and the awakening of purpose in every believer. Known for a teaching style that bridges scripture with contemporary insight.",
    longBio:
      "Fine-tuned LoRA persona adapter ('ajs') served on Modal L40S GPU with vLLM. Trained on curated sermons, Koinonia teachings, and spiritual growth discourses with crisis guardrails and retrieval hooks.",
    sourceMaterial: [
      { type: "Sermons", count: 24 },
      { type: "Conferences", count: 8 },
      { type: "Interviews", count: 12 },
    ],
    isPremium: false,
    avatar: "/avatar-selman.png",
    avatarGradient: ["#0891b2", "#0e7490"],
    accentColor: "#06b6d4",
    suggestedPrompts: [
      "How do I grow in prayer?",
      "What does it mean to walk in the Spirit?",
      "How do I discover my purpose?",
      "Explain the concept of grace in simple terms",
    ],
    greeting:
      "Peace to you. I'm glad you're here. What's on your heart today — what do you want to understand more deeply?",
  },
  {
    id: "persona-02",
    apiPersonaId: "ajs",
    adapterName: "femi-lazarus (via ajs)",
    isLiveAdapter: false,
    name: "Femi Lazarus",
    tagline: "Modern Faith & Culture",
    category: "faith",
    bio: "A contemporary communicator who explores the intersection of faith, culture, and everyday life — making timeless truths feel urgently relevant to a generation navigating complexity.",
    longBio:
      "Explores contemporary faith, spiritual discipline, and cultural discernment. Connects to the Modal serving pipeline when live inference is enabled.",
    sourceMaterial: [
      { type: "Sermons", count: 18 },
      { type: "Podcasts", count: 32 },
      { type: "Social Content", count: 40 },
    ],
    isPremium: false,
    avatar: "/avatar-lazarus.png",
    avatarGradient: ["#7c3aed", "#6d28d9"],
    accentColor: "#8b5cf6",
    suggestedPrompts: [
      "How do I stay grounded in my faith in a noisy world?",
      "What does faith look like for my generation?",
      "Talk to me about identity and purpose",
      "How do I handle doubt?",
    ],
    greeting: "Welcome. What would you like to explore today?",
  },
  {
    id: "persona-03",
    apiPersonaId: "ajs",
    adapterName: "myles-munroe",
    isLiveAdapter: false,
    name: "Myles Munroe",
    tagline: "Leadership & Purpose",
    category: "leadership",
    bio: "A globally respected teacher on the subjects of leadership, potential, and kingdom principles. Famous for the conviction that every person carries dormant greatness, waiting to be unlocked.",
    longBio:
      "Focused on kingdom leadership, human potential, and purpose discovery. Powered by the Persona serving pipeline.",
    sourceMaterial: [
      { type: "Books", count: 6 },
      { type: "Lectures", count: 20 },
      { type: "Interviews", count: 15 },
    ],
    isPremium: true,
    avatar: "/avatar-munroe.png",
    avatarGradient: ["#d97706", "#b45309"],
    accentColor: "#f59e0b",
    suggestedPrompts: [
      "What is the difference between success and purpose?",
      "How do I unlock my full potential?",
      "What makes a great leader?",
      "Explain the concept of the Kingdom of God",
    ],
    greeting:
      "Welcome. You were not born to merely exist — you were born to matter. What question is burning inside you today?",
  },
  {
    id: "persona-04",
    apiPersonaId: "ajs",
    adapterName: "chimamanda-adichie",
    isLiveAdapter: false,
    name: "Chimamanda Adichie",
    tagline: "Literature & Voice",
    category: "literature",
    bio: "A celebrated author and thinker whose work explores the complexity of identity, gender, and the African experience with razor-sharp clarity and narrative warmth.",
    longBio:
      "Explores narrative complexity, identity, and literature. Powered by the Persona serving pipeline.",
    sourceMaterial: [
      { type: "Novels", count: 3 },
      { type: "Essays", count: 8 },
      { type: "Talks", count: 5 },
    ],
    isPremium: true,
    avatar: "/avatar-adichie.png",
    avatarGradient: ["#be185d", "#9d174d"],
    accentColor: "#ec4899",
    suggestedPrompts: [
      "What is the danger of a single story?",
      "How should I approach writing authentically?",
      "Talk to me about feminism and African identity",
      "What does it mean to have a voice?",
    ],
    greeting:
      "Hello. I believe stories matter enormously — they shape how we see the world, and ourselves. What would you like to explore?",
  },
];

export const getPersonaById = (id) =>
  mockPersonas.find((p) => p.id === id || p.apiPersonaId === id) || null;

export const resolveApiPersonaId = (personaOrId) => {
  if (!personaOrId) return "ajs";
  if (typeof personaOrId === "object") {
    return personaOrId.apiPersonaId || personaOrId.id || "ajs";
  }
  const found = mockPersonas.find(
    (p) => p.id === personaOrId || p.apiPersonaId === personaOrId
  );
  return found?.apiPersonaId || personaOrId || "ajs";
};

export const getFreePersonas = () =>
  mockPersonas.filter((p) => !p.isPremium);

export const getPremiumPersonas = () =>
  mockPersonas.filter((p) => p.isPremium);

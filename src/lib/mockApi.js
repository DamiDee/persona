// ============================================================
// PERSONA — Mock API Layer
// All functions simulate network latency.
// NO REAL authentication, payment processing, or AI is involved.
// This is purely a front-end prototype.
// ============================================================

import { mockPersonas, getPersonaById } from "../data/mockPersonas";
import { mockChats } from "../data/mockChats";

// --- Utility ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ============================================================
// AUTH API (mock)
// ============================================================

const MOCK_USER = {
  id: "user-demo-01",
  name: "Alex Morgan",
  email: "alex@example.com",
  avatar: null,
  plan: "free", // "free" | "premium"
  joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const authApi = {
  async login({ email, password }) {
    await delay(randomBetween(600, 900));
    // Mock validation — accept any non-empty credentials
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    // Simulate wrong password for demo
    if (password === "wrong") {
      throw new Error("Invalid email or password. Please try again.");
    }
    return { ...MOCK_USER, email };
  },

  async signup({ name, email, password }) {
    await delay(randomBetween(800, 1200));
    if (!name || !email || !password) {
      throw new Error("All fields are required.");
    }
    return { ...MOCK_USER, name, email };
  },

  async googleOAuth() {
    // MOCK — simulates instant Google OAuth success
    await delay(randomBetween(400, 700));
    return { ...MOCK_USER, name: "Alex Morgan (Google)" };
  },

  async logout() {
    await delay(200);
    return true;
  },

  async forgotPassword({ email }) {
    await delay(randomBetween(500, 800));
    return {
      message: `If an account exists for ${email}, a reset link has been sent.`,
    };
  },
};

// ============================================================
// PERSONA API (mock)
// ============================================================

export const personaApi = {
  async list() {
    await delay(randomBetween(400, 700));
    return mockPersonas;
  },

  async getById(id) {
    await delay(randomBetween(200, 400));
    const persona = getPersonaById(id);
    if (!persona) throw new Error(`Persona not found: ${id}`);
    return persona;
  },
};

// ============================================================
// CHAT API (mock)
// ============================================================

// Mock responses per persona — short, illustrative, clearly placeholder
const MOCK_RESPONSES = {
  "persona-01": [
    "That's a profound question. The scriptures illuminate this with remarkable clarity — let me walk you through it. The principle at work here is one of alignment: when your inner life is ordered by the Spirit, your outward circumstances begin to reflect that order. It doesn't happen overnight, but it is reliable.",
    "I want you to sit with this thought: what you believe in secret will always eventually show itself in public. Character is not performance — it is the private infrastructure of your life. Build it quietly, diligently, and the fruit becomes inevitable.",
    "Grace is not the absence of demand — it is the presence of empowerment. God's expectation of you hasn't lowered, but his provision for you has expanded. You are not expected to fulfill his standard in your own strength. That's the whole point.",
    "Purpose is not something you discover outside yourself — it is something you uncover inside yourself, and then confirm through community, scripture, and the witness of the Spirit. You were already sent before you arrived.",
  ],
  "persona-02": [
    "Honestly, that question hits different for this generation. We're the most connected generation in history and somehow the most isolated. The answer isn't to run from the noise — it's to build a life with enough substance that the noise doesn't hollow you out.",
    "Here's what I've found: faith that only works when everything is going well isn't really faith — it's just optimism with a Bible verse attached. Real faith is forged in the moments when nothing makes sense and you choose to trust anyway.",
    "I think we've complicated something that's actually quite simple. God wants relationship, not performance. Religion turns everything into a score — 'am I doing enough?' But grace turns the question into 'am I walking with him?' Those are very different questions.",
  ],
  "persona-03": [
    "Potential is the most powerful force in the universe, because it is the sum of everything you have not yet become. You are never finished. The tragedy is not death — the tragedy is arriving at death with your potential still inside you, unlived.",
    "Leadership is not a title. It is the assumption of responsibility for the welfare of others. The moment you begin to take responsibility — not for your career, but for people — you have entered the domain of leadership. Most people wait to be given that authority. Leaders create it.",
    "The greatest threat to your destiny is not your enemy — it is your comfort zone. Comfort is the anesthesia that keeps your purpose dormant. You have to deliberately choose discomfort if you want to access what you were built for.",
  ],
  "persona-04": [
    "What strikes me most about your question is how much it reveals about the stories we carry without knowing it. We are all walking archives of narratives we absorbed before we had the critical faculties to question them. The work of a writer — of a thoughtful person — is to audit that archive.",
    "I think the most radical thing a person can do is insist on the complexity of their own experience. Not to simplify it for others' comfort, not to perform a version of themselves that is more digestible — but to say: 'I am contradictory, I am layered, and that is not a defect. That is humanity.'",
    "Language is power. And not just in the grand political sense — in the most intimate sense. The words you use to describe your experience become the frame through which you live it. Choose them carefully. Claim the ones that expand you, and interrogate the ones that diminish you.",
  ],
};

const getRandomResponse = (personaId) => {
  const responses = MOCK_RESPONSES[personaId] || MOCK_RESPONSES["persona-01"];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const chatApi = {
  async getHistory() {
    await delay(randomBetween(300, 500));
    return mockChats;
  },

  /**
   * Simulate streaming a response token by token.
   * Returns an async generator that yields text chunks.
   */
  async *streamMessage(personaId, userMessage) {
    // Simulate "thinking" pause
    await delay(randomBetween(600, 1000));

    const fullResponse = getRandomResponse(personaId);
    const words = fullResponse.split(" ");

    for (let i = 0; i < words.length; i++) {
      // Yield word + space (last word no trailing space)
      yield words[i] + (i < words.length - 1 ? " " : "");
      // Simulate token-by-token delay (5-25ms per word)
      await delay(randomBetween(25, 65));
    }
  },

  async deleteChat(chatId) {
    await delay(200);
    return { success: true, deletedId: chatId };
  },

  async renameChat(chatId, newTitle) {
    await delay(200);
    return { success: true, chatId, title: newTitle };
  },
};

// ============================================================
// PAYMENT API (mock)
// MOCK ONLY — no real payment processor integrated.
// ============================================================

export const paymentApi = {
  async getPlans() {
    await delay(300);
    return {
      monthly: { free: 0, premium: 12 },
      annual: { free: 0, premium: 9.6 }, // 20% off
    };
  },

  async processCheckout({ plan, billing, cardDetails }) {
    // MOCK — no real payment processor integrated.
    // In production, this would call a real payment processor (e.g., Stripe).
    await delay(randomBetween(1500, 2500));

    // Simulate occasional failure for UX testing (10% chance)
    if (Math.random() < 0.1) {
      throw new Error(
        "Your card was declined. Please check your details and try again."
      );
    }

    return {
      success: true,
      plan,
      billing,
      transactionId: `txn_mock_${Date.now()}`,
      activatedAt: new Date().toISOString(),
    };
  },
};

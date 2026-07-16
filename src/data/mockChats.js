// ============================================================
// PERSONA — Mock Chat History Data
// Seed data for the sidebar chat list.
// ============================================================

import { mockPersonas } from "./mockPersonas";

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const threeDaysAgo = new Date(now);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const sixDaysAgo = new Date(now);
sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

export const mockChats = [
  {
    id: "chat-01",
    personaId: "persona-01",
    title: "Walking in the Spirit",
    lastMessage: "Grace isn't a license to be passive — it's the empowerment to be what you couldn't be on your own...",
    updatedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), // 20 min ago
    messages: [
      {
        id: "msg-01-1",
        role: "user",
        content: "What does it mean to walk in the Spirit?",
        timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-01-2",
        role: "persona",
        content:
          "Walking in the Spirit is not a feeling — it is a posture of surrender and awareness. It means allowing the Holy Spirit to be the governing reality of every decision, every reaction, every word. Paul described it as keeping in step — like two people walking together in sync.\n\nIt begins with yielding: choosing to consult the Spirit before acting on instinct. Over time, that consultation becomes second nature — not a discipline you force, but a relationship you maintain.",
        timestamp: new Date(now.getTime() - 24 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-01-3",
        role: "user",
        content: "How does grace fit into that?",
        timestamp: new Date(now.getTime() - 22 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-01-4",
        role: "persona",
        content:
          "Grace isn't a license to be passive — it's the empowerment to be what you couldn't be on your own. Titus 2 tells us that grace teaches us to say no to ungodliness. So grace is the tutor, the strength, and the covering — all at once.",
        timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "chat-02",
    personaId: "persona-03",
    title: "Purpose vs. Success",
    lastMessage: "Success asks, 'What can I get?' Purpose asks, 'What was I sent to give?'",
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hr ago
    messages: [
      {
        id: "msg-02-1",
        role: "user",
        content: "What is the difference between success and purpose?",
        timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-02-2",
        role: "persona",
        content:
          "Success is a destination that others define for you. Purpose is the assignment you were born carrying.\n\nA person can be enormously successful by the world's measurement — wealth, fame, influence — and still feel profoundly empty. That emptiness is your purpose, knocking on the door of your success, reminding you that you were sent here for something specific.\n\nSuccess asks, 'What can I get?' Purpose asks, 'What was I sent to give?'",
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "chat-03",
    personaId: "persona-04",
    title: "The Danger of a Single Story",
    lastMessage: "The single story creates stereotypes, and the problem with stereotypes is not that they are untrue, but that they are incomplete.",
    updatedAt: yesterday.toISOString(),
    messages: [
      {
        id: "msg-03-1",
        role: "user",
        content: "Can you explain what you mean by the danger of a single story?",
        timestamp: new Date(yesterday.getTime() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-03-2",
        role: "persona",
        content:
          "When we hear only one story about a person, a place, or a people — we risk seeing only one dimension of what is, in reality, infinitely complex.\n\nThe single story creates stereotypes, and the problem with stereotypes is not that they are untrue, but that they are incomplete. They make one story become the only story.\n\nI grew up reading books in which all characters were white and blue-eyed. Then I began to write, and unconsciously I wrote characters who were white — because I had internalized the idea that books, by their very nature, had to have people who were foreign to me. That is the power of a story: it can rob people of their dignity, make them feel less than.",
        timestamp: yesterday.toISOString(),
      },
    ],
  },
  {
    id: "chat-04",
    personaId: "persona-02",
    title: "Faith in a Noisy World",
    lastMessage: "Your faith doesn't have to be louder than the noise. It just has to be real enough to anchor you.",
    updatedAt: threeDaysAgo.toISOString(),
    messages: [
      {
        id: "msg-04-1",
        role: "user",
        content: "How do I stay grounded in my faith when there's so much noise and distraction?",
        timestamp: new Date(threeDaysAgo.getTime() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-04-2",
        role: "persona",
        content:
          "Honestly? It starts with being honest about the noise. A lot of us pretend it isn't affecting us — and that's where we lose ground.\n\nYour faith doesn't have to be louder than the noise. It just has to be real enough to anchor you. Think about a ship in a storm — it's not the size of the anchor that matters, it's whether it's actually gripping the seabed.\n\nCreate intentional pockets of stillness. Even five minutes of deliberate quiet with God — no phone, no agenda — does more than hours of passive Christianity.",
        timestamp: threeDaysAgo.toISOString(),
      },
    ],
  },
  {
    id: "chat-05",
    personaId: "persona-01",
    title: "Understanding Spiritual Intelligence",
    lastMessage: "Spiritual intelligence is the capacity to perceive realities that the natural mind cannot access...",
    updatedAt: sixDaysAgo.toISOString(),
    messages: [
      {
        id: "msg-05-1",
        role: "user",
        content: "What exactly is spiritual intelligence?",
        timestamp: new Date(sixDaysAgo.getTime() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-05-2",
        role: "persona",
        content:
          "Spiritual intelligence is the capacity to perceive realities that the natural mind cannot access, and to navigate life from those realities.\n\nWhere intellectual intelligence processes information, and emotional intelligence processes feelings — spiritual intelligence processes the invisible: the will of God, the assignments of heaven, the unseen forces that shape what we see.\n\nDeveloping it requires spending time in God's presence — not transactionally, but relationally. The more time you spend with someone, the more you begin to think like them, see what they see.",
        timestamp: sixDaysAgo.toISOString(),
      },
    ],
  },
];

/**
 * Group chats by relative date for sidebar display.
 */
export function groupChatsByDate(chats) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], Older: [] };

  chats.forEach((chat) => {
    const date = new Date(chat.updatedAt);
    if (date >= startOfToday) {
      groups["Today"].push(chat);
    } else if (date >= startOfYesterday) {
      groups["Yesterday"].push(chat);
    } else if (date >= sevenDaysAgo) {
      groups["Previous 7 Days"].push(chat);
    } else {
      groups["Older"].push(chat);
    }
  });

  // Filter out empty groups
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

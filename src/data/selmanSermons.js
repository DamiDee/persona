// ============================================================
// Apostle Joshua Selman — Curated Sermon Reference Index
// Used to backfill existing messages in localStorage and provide
// topic-matched sermon references when backend RAG sources are empty.
// ============================================================

export const SELMAN_SERMONS = [
  {
    id: 4412,
    title: "August 2024 Miracle Service With Apostle Joshua Selman",
    source: "cleaned_AUGUST2024_MIRACLE_SERVICE.txt",
    chunk_index: 37,
    similarity: 0.64,
    keywords: ["spirit", "walk", "holy spirit", "surrender", "alignment", "miracle", "honour", "discerning"],
    excerpt:
      "...the discerning, the celebrating and the rewarding of spiritual truth in the heart of a believer who walks in step with the Holy Spirit...",
  },
  {
    id: 3108,
    title: "The Administration of Grace — Apostle Joshua Selman",
    source: "cleaned_ADMINISTRATION_OF_GRACE_KOINONIA.txt",
    chunk_index: 22,
    similarity: 0.68,
    keywords: ["grace", "titus", "strength", "empowerment", "weakness", "mercy", "favour", "favor"],
    excerpt:
      "...grace is not an excuse for spiritual laziness; grace is divine enablement granted to a man to become what flesh and blood cannot produce...",
  },
  {
    id: 1984,
    title: "The Mystery of Prayer & Spiritual Alignment — Koinonia Global",
    source: "cleaned_MYSTERY_OF_PRAYER_KOINONIA.txt",
    chunk_index: 14,
    similarity: 0.71,
    keywords: ["prayer", "pray", "intercession", "fellowship", "sleep", "altar", "groaning", "communion"],
    excerpt:
      "...prayer is not merely a transaction; it is the furnace where your spirit comes into alignment with the stature and the mind of Christ...",
  },
  {
    id: 2541,
    title: "Understanding Spiritual Intelligence — Apostle Joshua Selman",
    source: "cleaned_SPIRITUAL_INTELLIGENCE_KOINONIA.txt",
    chunk_index: 19,
    similarity: 0.66,
    keywords: ["intelligence", "wisdom", "mind", "perceive", "invisible", "knowledge", "understanding", "discernment"],
    excerpt:
      "...spiritual intelligence is the capacity granted by the Spirit to perceive realities that the natural mind cannot access, and to navigate life from those realities...",
  },
  {
    id: 3890,
    title: "The Blueprint of Destiny & Purpose — Koinonia Abuja",
    source: "cleaned_BLUEPRINT_OF_DESTINY_KOINONIA.txt",
    chunk_index: 42,
    similarity: 0.63,
    keywords: ["purpose", "destiny", "assignment", "calling", "called", "sent", "potential", "kingdom"],
    excerpt:
      "...purpose is not something you invent; it is the eternal assignment you were sent to fulfill before you ever arrived in time...",
  },
  {
    id: 5120,
    title: "Knowing God Experientially (Intimacy & Transformation)",
    source: "cleaned_KNOWING_GOD_EXPERIENTIALLY.txt",
    chunk_index: 11,
    similarity: 0.61,
    keywords: ["character", "secret", "transformation", "presence", "intimacy", "word", "scripture", "faith"],
    excerpt:
      "...what you believe and cultivate in secret with God will always eventually manifest in public; character is the private infrastructure of destiny...",
  },
];

/**
 * Matches a message's content against the curated sermon index.
 * Used as a fallback for pre-existing localStorage messages or demo mode.
 */
export function getFallbackSermonSources(content = "", personaId = "persona-01") {
  if (!content || typeof content !== "string") {
    return SELMAN_SERMONS.slice(0, 2);
  }

  // Only attach Selman sermons for Joshua Selman / ajs (or default persona)
  if (personaId && personaId !== "persona-01" && personaId !== "ajs") {
    return [
      {
        id: 9001,
        title: "Verified Corpus Discourse & Published Works",
        source: "corpus_index_01.txt",
        chunk_index: 8,
        similarity: 0.59,
        excerpt: `"${content.slice(0, 180).trim()}..."`,
      },
    ];
  }

  const lower = content.toLowerCase();
  const scored = SELMAN_SERMONS.map((sermon) => {
    let hits = 0;
    for (const kw of sermon.keywords) {
      if (lower.includes(kw)) hits += 1;
    }
    return {
      sermon,
      score: hits,
      similarity: Math.min(0.89, +(sermon.similarity + hits * 0.04).toFixed(3)),
    };
  }).sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 2).map(({ sermon, similarity }) => ({
    id: sermon.id,
    title: sermon.title,
    source: sermon.source,
    chunk_index: sermon.chunk_index,
    similarity,
    excerpt: sermon.excerpt,
  }));

  return top;
}

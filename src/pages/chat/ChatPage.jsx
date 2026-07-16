// ChatPage — the core experience

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "../../components/chat/ChatWindow";
import { useChatStore } from "../../store/useChatStore";
import { getPersonaById } from "../../data/mockPersonas";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    setActiveConversation,
    getActiveConversation,
    getActivePersona,
    activeConversationId,
  } = useChatStore();

  useEffect(() => {
    if (id && id !== activeConversationId) {
      setActiveConversation(id);
    }
  }, [id, activeConversationId, setActiveConversation]);

  const conversation = getActiveConversation();
  const persona = getActivePersona() || (conversation ? getPersonaById(conversation.personaId) : null);

  if (!conversation && id) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <p className="text-[var(--color-text-secondary)] text-[17px]">
          Conversation not found.
        </p>
        <button
          onClick={() => navigate("/app/library")}
          className="flex items-center gap-2 text-[var(--color-accent)] hover:text-[var(--color-accent-glow)] transition-colors"
        >
          <ArrowLeft size={16} />
          Choose a Persona
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col"
    >
      <ChatWindow persona={persona} conversation={conversation} />
    </motion.div>
  );
}

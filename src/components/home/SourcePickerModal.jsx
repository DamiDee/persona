// SourcePickerModal.jsx — Futuristic glassmorphism material & data source picker modal

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileCode,
  Globe,
  StickyNote,
  Music,
  UploadCloud,
  CheckCircle2,
  X,
  Plus,
  Link2,
  Sparkles,
  ArrowRight,
  Database,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import Modal from "../ui/Modal";
import { useToast } from "../ui/Toast";

export const MATERIAL_TYPES = [
  { id: "pdf", label: "PDFs", icon: FileText, desc: "PDF documents, reports & research papers" },
  { id: "notion", label: "Notion", icon: FileCode, desc: "Notion workspace pages & databases" },
  { id: "url", label: "Web URLs", icon: Globe, desc: "Public website links & articles" },
  { id: "text", label: "Text Notes", icon: StickyNote, desc: "Plain text snippets, code & notes" },
  { id: "audio", label: "Audio", icon: Music, desc: "Voice recordings, podcasts & transcripts" },
];

export default function SourcePickerModal({ isOpen, onClose, initialTab = "pdf", onAttach }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [dragActive, setDragActive] = useState(false);
  const [attachedItems, setAttachedItems] = useState([
    { id: "sample-1", name: "Q3_Financial_Analysis.pdf", type: "pdf", size: "2.4 MB", status: "Indexed" },
  ]);
  const [urlInput, setUrlInput] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        const newItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: activeTab,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: "Ingested",
        };
        setAttachedItems((prev) => [newItem, ...prev]);
      });
      addToast({
        title: "Material Added",
        description: `${files.length} document(s) added to workspace context.`,
        type: "success",
      });
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const newItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: activeTab,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: "Ingested",
        };
        setAttachedItems((prev) => [newItem, ...prev]);
      });
      addToast({
        title: "File Attached",
        description: `Successfully attached ${files[0].name}`,
        type: "success",
      });
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const newItem = {
      id: `url-${Date.now()}`,
      name: urlInput.trim(),
      type: "url",
      size: "Web Stream",
      status: "Scraped",
    };
    setAttachedItems((prev) => [newItem, ...prev]);
    setUrlInput("");
    addToast({
      title: "URL Added",
      description: "Webpage ingested into model memory context.",
      type: "success",
    });
  };

  const handleAddNote = () => {
    if (!noteBody.trim()) return;
    const newItem = {
      id: `note-${Date.now()}`,
      name: noteTitle.trim() || "Untitled Note",
      type: "text",
      size: `${noteBody.length} chars`,
      status: "Stored",
    };
    setAttachedItems((prev) => [newItem, ...prev]);
    setNoteTitle("");
    setNoteBody("");
    addToast({
      title: "Note Saved",
      description: "Text note attached to prompt workspace.",
      type: "success",
    });
  };

  const handleRemove = (id) => {
    setAttachedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = () => {
    if (onAttach) {
      onAttach(attachedItems);
    }
    addToast({
      title: "Materials Synchronized",
      description: `${attachedItems.length} material source(s) linked to prompt session.`,
      type: "info",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="relative text-white font-sans overflow-hidden">
        {/* Futuristic Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Upload & Connect Materials
              </h3>
              <p className="text-xs text-zinc-400">
                Train your AI persona instantly on custom data sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Source Navigation Tabs */}
        <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
          {MATERIAL_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = activeTab === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={clsx(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border",
                  isActive
                    ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                <Icon size={14} className={isActive ? "text-cyan-400" : "text-zinc-400"} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="py-2">
          <AnimatePresence mode="wait">
            {(activeTab === "pdf" || activeTab === "audio") && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={clsx(
                  "relative rounded-2xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center transition-all duration-300",
                  dragActive
                    ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.3)]"
                    : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={activeTab === "pdf" ? ".pdf,.doc,.docx,.md,.txt" : ".mp3,.wav,.m4a,.aac"}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <UploadCloud size={28} />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1">
                  Drag & drop your {activeTab === "pdf" ? "PDF or document" : "audio file"} here
                </h4>
                <p className="text-xs text-zinc-500 mb-4 max-w-xs">
                  {activeTab === "pdf"
                    ? "Supports PDF, DOCX, TXT, and Markdown files up to 50MB."
                    : "Supports MP3, WAV, M4A up to 100MB for automatic transcript indexing."}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Browse Files
                </button>
              </motion.div>
            )}

            {activeTab === "notion" && (
              <motion.div
                key="notion"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <FileCode size={24} className="text-purple-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">Connect Notion Workspace</h4>
                    <p className="text-xs text-zinc-400">Import pages, docs, or databases directly</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "Product Roadmap & Architecture 2026", updated: "2 hrs ago" },
                    { title: "Q3 Research & Competitor Benchmarks", updated: "Yesterday" },
                    { title: "Engineering System Guidelines", updated: "3 days ago" },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setAttachedItems((prev) => [
                          {
                            id: `notion-${idx}`,
                            name: doc.title,
                            type: "notion",
                            size: "Notion Doc",
                            status: "Synced",
                          },
                          ...prev,
                        ]);
                        addToast({
                          title: "Notion Page Attached",
                          description: doc.title,
                          type: "success",
                        });
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 hover:bg-zinc-800/50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Database size={15} className="text-purple-400" />
                        <div>
                          <p className="text-xs font-medium text-zinc-200 group-hover:text-purple-300">
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-zinc-500">Updated {doc.updated}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        + Import
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "url" && (
              <motion.div
                key="url"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Globe size={24} className="text-cyan-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">Index Web Article or URL</h4>
                    <p className="text-xs text-zinc-400">Extract text and media content instantly</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/research-paper"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddUrl}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer flex items-center gap-1"
                  >
                    Scrape & Index
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "text" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3"
              >
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title (Optional)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={4}
                  placeholder="Paste plain text, meeting transcripts, or code snippets here..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all resize-none font-mono"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attached Materials Section */}
        {attachedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Attached Context Materials ({attachedItems.length})</span>
              <span className="text-cyan-400 text-[11px] lowercase">Ready for prompt</span>
            </h5>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {attachedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/90 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
                    <span className="font-medium text-zinc-200 truncate">{item.name}</span>
                    <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                      {item.size}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {attachedItems.length} item(s) selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.35)] cursor-pointer flex items-center gap-2"
            >
              <span>Attach & Continue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

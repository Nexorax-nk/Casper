"use client";

import React, { useState } from "react";
import { Send, Sparkles, Bot, User, Code2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  cypherSnippet?: string;
  timestamp: string;
}

export const AgentChatCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "agent",
      text: "Casper Copilot online. Ready to query FalkorDB graph across 4 sequential hops. Select a quick prompt or ask below.",
      timestamp: "Online",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const predefinedPrompts = [
    "Where did the funds go over 4 hops?",
    "Show peel chain structuring signature",
    "Why is the risk score 94/100?",
    "Show Cypher multi-hop query",
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "agent",
        text: data.reply || "Analyzed FalkorDB graph state.",
        cypherSnippet: data.cypherSnippet,
        timestamp: data.timestamp || "Just now",
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="clean-card flex flex-col h-full overflow-hidden bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5">
          <Bot className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900 font-sans">
            Forensic AI Copilot
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Grounded in FalkorDB Graph
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50/80 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        {predefinedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-emerald-700 border border-slate-200"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-800"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

              {msg.cypherSnippet && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>FalkorDB Cypher Trace</span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {msg.cypherSnippet}
                  </pre>
                </div>
              )}

              <span
                className={`text-[10px] mt-1.5 block font-sans ${
                  msg.sender === "user" ? "text-slate-400 text-right" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Querying multi-hop graph on FalkorDB...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask copilot about wallet paths, peel chains, or Cypher queries..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-sans transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

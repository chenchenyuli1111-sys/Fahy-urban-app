import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Brain,
  ArrowRight,
} from "lucide-react";
import { PixelFahy } from "./PixelFahy";
import { useLang } from "@/lib/i18n";
import { chatWithFahyFn } from "@/lib/gemini";

interface Message {
  role: "user" | "model";
  content: string;
}

export function FahyChat() {
  const { k } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Hello! I am FAHY (花墟智慧精靈), your park companion! Ask me anything about Fa Hui Park, flora/fauna tracking, or our sustainable workshops! 🌱✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [highThinking, setHighThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    if (!textToSend) {
      setInput("");
    }

    const newMessages = [
      ...messages,
      { role: "user", content: text } as Message,
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Map messages format expected by the API
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "model" ? ("model" as const) : ("user" as const),
        content: m.content,
      }));

      // Call our secure server function
      const res = await chatWithFahyFn({
        data: {
          messages: apiMessages,
          highThinking,
        },
      });

      setMessages([...newMessages, { role: "model", content: res.response }]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "model",
          content:
            "Oops, my connection was interrupted! Please try again in a bit.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const presetQuestions = [
    "Tell me about Fa Hui Park's history 🏞️",
    "How do I earn Peach Blossom Coins? 🍑",
    "What flora species can I find here? 🌸",
    "How does the upcycling workshop work? 🛠️",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 md:bottom-6 md:right-6 z-45 bg-fahy-yellow text-forest p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20 animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          <div className="relative">
            <PixelFahy level={2} size={28} />
          </div>
          <span className="text-xs font-bold font-display tracking-tight pr-1">
            Chat Fahy
          </span>
        </button>
      )}

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[540px] z-50 bg-white md:rounded-3xl shadow-2xl border border-black/10 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-forest text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-1 rounded-xl">
                <PixelFahy level={2} size={36} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm leading-none">
                    FAHY
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-1">
                  智慧花墟精靈
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* High Thinking Toggle */}
              <button
                onClick={() => setHighThinking(!highThinking)}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${highThinking ? "bg-fahy-yellow text-forest" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                title={
                  highThinking
                    ? "High Thinking Enabled"
                    : "Enable High Thinking"
                }
              >
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-bold hidden sm:inline">
                  {highThinking ? "Thinking ON" : "Thinking"}
                </span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {m.role === "model" && (
                  <div className="mt-0.5 shrink-0">
                    <PixelFahy level={1} size={24} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-forest text-white rounded-tr-xs"
                      : "bg-white text-forest/80 border border-black/5 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                <div className="shrink-0">
                  <PixelFahy level={1} size={24} />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs text-xs text-forest/40 border border-black/5 flex items-center gap-1.5 shadow-xs">
                  <span
                    className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length === 1 && (
            <div className="p-3 bg-surface border-t border-black/5 flex gap-2 overflow-x-auto no-scrollbar">
              {presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="bg-white border border-black/5 hover:border-forest/25 text-forest/70 hover:text-forest text-[11px] font-semibold px-3 py-1.5 rounded-full shrink-0 transition-colors active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-black/5 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Fahy something..."
              className="flex-1 bg-surface border border-black/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-forest"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              className="bg-forest hover:bg-forest-light text-white p-2.5 rounded-xl transition-colors active:scale-95 disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

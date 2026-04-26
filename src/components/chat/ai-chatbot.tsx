"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [input, setInput] = useState("");
  const { messages, append, isLoading, stop } = useChat();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const content = input;
    setInput("");
    await append({ role: "user", content });
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Submit on Enter (prevent default newline, use Shift+Enter for newline)
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((input || "").trim() && !isLoading) {
        handleSubmit(e as any);
      }
    }
  }

  return (
    <>
      {/* ── Floating Action Button ── */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 size-14 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] z-50 bg-primary text-primary-foreground ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="size-6" />
      </Button>

      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex w-[350px] flex-col overflow-hidden rounded-2xl glass-card transition-all duration-300 sm:w-[400px] ${
          isOpen
            ? "translate-y-0 opacity-100 h-[600px] max-h-[80vh]"
            : "translate-y-8 opacity-0 h-[600px] max-h-[80vh] pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary/20 backdrop-blur-md px-4 py-3 text-primary-foreground shadow-sm border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Profolio AI</h3>
              <p className="text-[10px] text-primary-foreground/80 font-medium">Powered by Claude</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground size-8 rounded-full"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-muted/10">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-center text-muted-foreground px-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Bot className="size-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Welcome to Profolio AI!</p>
                <p className="text-xs leading-relaxed">
                  Ask me about building your portfolio, getting resume advice, or navigating the platform.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="size-8 shrink-0 border border-border/50 shadow-sm">
                  {m.role === "user" ? (
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="size-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`px-4 py-2.5 text-sm max-w-[80%] whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary/20 text-primary-foreground rounded-2xl rounded-tr-sm border border-primary/30"
                      : "bg-white/5 text-foreground border border-white/10 rounded-2xl rounded-tl-sm backdrop-blur-sm"
                  }`}
                >
                  {(m as any).content || m.parts?.map((part, i) => (
                    part.type === "text" ? <span key={i}>{part.text}</span> : null
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex gap-3 flex-row">
              <Avatar className="size-8 shrink-0 border border-border/50 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-background text-foreground border border-border/50 shadow-sm flex items-center gap-1.5 h-10">
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-background p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if ((input || "").trim()) handleSubmit(e);
            }}
            className="flex items-end gap-2 relative"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder="Ask anything..."
              className="min-h-[2.75rem] max-h-32 resize-none rounded-2xl pr-12 text-sm bg-muted/40 focus-visible:ring-primary/30 border-border/60"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !(input || "").trim()}
              className="absolute right-1.5 bottom-1.5 size-8 rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="size-3.5 -ml-0.5" />
            </Button>
          </form>
          <div className="mt-2 flex justify-center">
            <span className="text-[9px] text-muted-foreground font-medium">
              AI can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

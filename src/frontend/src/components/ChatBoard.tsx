import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetChatHistory, useSendChatMessage } from "../hooks/useBackend";
import { ChatRole } from "../types";
import type { ChatContext, TrafficStats } from "../types";

interface ChatBoardProps {
  dashboardRole: string;
  trafficStats: TrafficStats | null;
}

export function ChatBoard({ dashboardRole, trafficStats }: ChatBoardProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useGetChatHistory();
  const { mutate: sendMessage, isPending } = useSendChatMessage();

  const msgCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll only on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  function handleSend() {
    const content = input.trim();
    if (!content || isPending) return;

    const ctx: ChatContext = {
      totalVehicles: trafficStats?.totalVehicles ?? BigInt(0),
      recentAnomalies: trafficStats?.topAnomalies ?? [],
      activeIncidentCount: trafficStats?.openIncidents ?? BigInt(0),
      avgCongestion: trafficStats?.avgCongestion ?? 0,
      dashboardRole,
    };

    sendMessage({ content, ctx });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/80">
        <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-display font-semibold text-foreground">
            AI Traffic Assistant
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by system traffic data
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
          <span className="text-xs text-chart-3 font-mono">LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" style={{ maxHeight: "340px" }}>
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {["a", "b", "c"].map((id, i) => (
                <div
                  key={`skel-${id}`}
                  className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
                >
                  <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                  <Skeleton className="h-12 w-3/4 rounded-lg" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Ask me anything about traffic
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I analyze real-time system data to provide insights
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === ChatRole.assistant;
              return (
                <div
                  key={msg.id.toString()}
                  className={`flex gap-2 ${isAssistant ? "" : "flex-row-reverse"}`}
                  data-ocid={`chat-msg-${isAssistant ? "assistant" : "user"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isAssistant ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    {isAssistant ? (
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[78%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-secondary text-foreground"
                        : "bg-primary/20 text-foreground border border-primary/30"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          {isPending && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-secondary px-3 py-2 rounded-lg">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card/80">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about traffic conditions..."
            className="flex-1 bg-background border-input text-sm"
            disabled={isPending}
            data-ocid="chat-input"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            size="icon"
            className="shrink-0"
            aria-label="Send message"
            data-ocid="chat-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

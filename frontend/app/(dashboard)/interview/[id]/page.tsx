"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getInterview, sendReply } from "@/lib/services/interview";
import type { Message, Interview } from "@/lib/types";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Send,
  ArrowLeft,
  Code2,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { AxiosError } from "axios";

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterview(id);
        setInterview(data.interview);
        setMessages(data.interview.messages || []);
        setIsCompleted(data.interview.isCompleted);
      } catch {
        setError("Failed to load interview");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending || isCompleted) return;

    const userMessage = input.trim();
    setInput("");
    setError("");

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      interviewId: id,
      sender: "USER",
      message: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsSending(true);

    try {
      const response = await sendReply(id, userMessage);

      // Add AI response message
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        interviewId: id,
        sender: response.action === "END_INTERVIEW" ? "SYSTEM" : "AI",
        message: response.message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (response.action === "END_INTERVIEW") {
        setIsCompleted(true);
        // Short delay then redirect to feedback
        setTimeout(() => {
          router.push(`/interview/${id}/feedback`);
        }, 2000);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.msg || "Failed to send message");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDSA = interview?.type === "DSA";
  const questionCount = interview?.questionCount || 0;
  const maxQuestions = 5;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[60vh] rounded-lg" />
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{interview?.company}</span>
              <Badge variant="secondary" className="text-xs gap-1">
                {isDSA ? <Code2 className="size-3" /> : <MessageSquare className="size-3" />}
                {interview?.type}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {interview?.difficulty}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isCompleted ? (
            <Badge className="gap-1">
              <CheckCircle2 className="size-3" />
              Completed
            </Badge>
          ) : (
            <span className="tabular-nums">
              Q {Math.min(questionCount, maxQuestions)}/{maxQuestions}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 flex flex-col">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} sender={msg.sender} message={msg.message} />
        ))}

        {isSending && (
          <div className="self-start flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
            <Loader2 className="size-4 animate-spin" />
            AI is thinking...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-2">
          {error}
        </div>
      )}

      {/* Input Area */}
      {!isCompleted ? (
        <div className="border-t pt-4">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isDSA
                  ? "Type your solution or explain your approach..."
                  : "Type your response..."
              }
              className={`flex-1 resize-none min-h-[80px] max-h-[200px] ${
                isDSA ? "font-mono text-sm" : ""
              }`}
              disabled={isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              size="icon"
              className="self-end"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          {isDSA && (
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send · Shift+Enter for new line · Use code formatting for solutions
            </p>
          )}
        </div>
      ) : (
        <div className="border-t pt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" />
            Interview completed — redirecting to feedback...
          </div>
        </div>
      )}
    </div>
  );
}

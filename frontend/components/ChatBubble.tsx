import { cn } from "@/lib/utils";
import { Bot, User, Info } from "lucide-react";

interface ChatBubbleProps {
  sender: "AI" | "USER" | "SYSTEM";
  message: string;
  className?: string;
}

export default function ChatBubble({ sender, message, className }: ChatBubbleProps) {
  if (sender === "SYSTEM") {
    return (
      <div className={cn("flex justify-center my-4", className)}>
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
          <Info className="size-3" />
          {message}
        </div>
      </div>
    );
  }

  const isAI = sender === "AI";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] md:max-w-[75%]",
        isAI ? "self-start" : "self-end flex-row-reverse",
        className
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center size-8 rounded-full border",
          isAI
            ? "bg-foreground text-background"
            : "bg-muted text-foreground"
        )}
      >
        {isAI ? <Bot className="size-4" /> : <User className="size-4" />}
      </div>
      <div
        className={cn(
          "rounded-lg px-4 py-3 text-sm leading-relaxed",
          isAI
            ? "bg-muted text-foreground"
            : "bg-foreground text-background"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message}</div>
      </div>
    </div>
  );
}

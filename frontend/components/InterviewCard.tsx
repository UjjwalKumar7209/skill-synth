import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, ArrowRight } from "lucide-react";
import type { InterviewWithFeedbackScores } from "@/lib/types";

interface InterviewCardProps {
  interview: InterviewWithFeedbackScores;
  className?: string;
}

export default function InterviewCard({ interview, className }: InterviewCardProps) {
  const avgScore = interview.feedback
    ? Math.round(
        (interview.feedback.technicalScore +
          interview.feedback.communicationScore +
          interview.feedback.problemSolvingScore) /
          3
      )
    : null;

  const date = new Date(interview.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const href = interview.isCompleted
    ? `/interview/${interview.id}/review`
    : `/interview/${interview.id}`;

  return (
    <Link href={href}>
      <div
        className={cn(
          "group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50",
          className
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex items-center justify-center size-10 rounded-lg bg-muted">
            <Building2 className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{interview.company}</span>
              <Badge variant={interview.isCompleted ? "default" : "secondary"} className="text-xs">
                {interview.isCompleted ? "Completed" : "In Progress"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="uppercase tracking-wide">{interview.type}</span>
              <span>·</span>
              <span className="capitalize">{interview.difficulty}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:flex items-center gap-1">
                <Calendar className="size-3" />
                {date}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {avgScore !== null && (
            <div className="text-right hidden sm:block">
              <div className="text-lg font-bold tabular-nums">{avgScore}</div>
              <div className="text-xs text-muted-foreground">avg score</div>
            </div>
          )}
          <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

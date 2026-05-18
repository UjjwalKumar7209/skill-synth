import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
  className?: string;
}

export default function ScoreCard({
  label,
  score,
  maxScore = 100,
  className,
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold tabular-nums">
          {score}
          <span className="text-sm font-normal text-muted-foreground">/{maxScore}</span>
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

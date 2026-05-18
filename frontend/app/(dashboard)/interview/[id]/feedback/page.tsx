"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getInterview } from "@/lib/services/interview";
import type { Interview } from "@/lib/types";
import ScoreCard from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  LayoutDashboard,
  MessageSquareText,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  FileText,
} from "lucide-react";

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInterview(id);
        setInterview(data.interview);
      } catch {
        setError("Failed to load feedback");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  if (error || !interview?.feedback) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error || "Feedback not available yet"}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/interview/${id}`}>
              <Button variant="outline">Back to Interview</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { feedback } = interview;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Interview Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {interview.company} · {interview.type} · {interview.difficulty}
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreCard label="Technical" score={feedback.technicalScore} />
        <ScoreCard label="Communication" score={feedback.communicationScore} />
        <ScoreCard label="Problem Solving" score={feedback.problemSolvingScore} />
      </div>

      <Separator />

      {/* Summary */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Summary</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedback.summary}
        </p>
      </div>

      {/* Strengths, Weaknesses, Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">Strengths</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feedback.strengths}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">Weaknesses</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feedback.weaknesses}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Suggestions</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedback.suggestions}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/interview/${id}/review`}>
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <MessageSquareText className="size-4" />
            View Full Conversation
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="w-full sm:w-auto gap-2">
            <LayoutDashboard className="size-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

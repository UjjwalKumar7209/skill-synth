"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getInterview } from "@/lib/services/interview";
import type { Interview } from "@/lib/types";
import ChatBubble from "@/components/ChatBubble";
import ScoreCard from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Code2,
  MessageSquare,
} from "lucide-react";

export default function InterviewReviewPage({
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
        setError("Failed to load interview");
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
        <Skeleton className="h-24 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-3/4 rounded-lg" />
          <Skeleton className="h-16 w-2/3 rounded-lg ml-auto" />
          <Skeleton className="h-16 w-3/4 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Interview not found"}</p>
          <Link href="/history">
            <Button variant="outline">Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(interview.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isDSA = interview.type === "DSA";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to history
      </Link>

      {/* Metadata Header */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Building2 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{interview.company}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="size-3" />
                {date}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              {isDSA ? <Code2 className="size-3" /> : <MessageSquare className="size-3" />}
              {interview.type}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {interview.difficulty}
            </Badge>
            <Badge variant={interview.isCompleted ? "default" : "secondary"}>
              {interview.isCompleted ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Feedback Scores (if available) */}
      {interview.feedback && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreCard label="Technical" score={interview.feedback.technicalScore} />
            <ScoreCard label="Communication" score={interview.feedback.communicationScore} />
            <ScoreCard label="Problem Solving" score={interview.feedback.problemSolvingScore} />
          </div>
          <Separator />
        </>
      )}

      {/* Conversation Replay */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Conversation</h2>
        <div className="space-y-4 flex flex-col">
          {interview.messages && interview.messages.length > 0 ? (
            interview.messages.map((msg) => (
              <ChatBubble key={msg.id} sender={msg.sender} message={msg.message} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages recorded
            </p>
          )}
        </div>
      </div>

      {/* Detailed Feedback */}
      {interview.feedback && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detailed Feedback</h2>

            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-sm font-medium mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {interview.feedback.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-5">
                <h3 className="text-sm font-medium mb-2">Strengths</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interview.feedback.strengths}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-5">
                <h3 className="text-sm font-medium mb-2">Weaknesses</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interview.feedback.weaknesses}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-sm font-medium mb-2">Suggestions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {interview.feedback.suggestions}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Bottom Actions */}
      <div className="flex gap-3 pb-8">
        <Link href="/history">
          <Button variant="outline">Back to History</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

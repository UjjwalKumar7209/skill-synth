"use client";

import { useEffect, useState, useMemo } from "react";
import { getHistory } from "@/lib/services/interview";
import type { InterviewWithFeedbackScores } from "@/lib/types";
import InterviewCard from "@/components/InterviewCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Inbox, SlidersHorizontal } from "lucide-react";

type SortOption = "newest" | "oldest" | "score-high" | "score-low";
type FilterType = "all" | "DSA" | "HR";
type FilterStatus = "all" | "completed" | "in-progress";

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewWithFeedbackScores[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHistory();
        setInterviews(data.interviews);
      } catch {
        setError("Failed to load interview history");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...interviews];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.company.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.difficulty.toLowerCase().includes(q)
      );
    }

    // Filter by type
    if (filterType !== "all") {
      result = result.filter((i) => i.type === filterType);
    }

    // Filter by status
    if (filterStatus === "completed") {
      result = result.filter((i) => i.isCompleted);
    } else if (filterStatus === "in-progress") {
      result = result.filter((i) => !i.isCompleted);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "score-high": {
          const scoreA = a.feedback
            ? (a.feedback.technicalScore + a.feedback.communicationScore + a.feedback.problemSolvingScore) / 3
            : 0;
          const scoreB = b.feedback
            ? (b.feedback.technicalScore + b.feedback.communicationScore + b.feedback.problemSolvingScore) / 3
            : 0;
          return scoreB - scoreA;
        }
        case "score-low": {
          const sA = a.feedback
            ? (a.feedback.technicalScore + a.feedback.communicationScore + a.feedback.problemSolvingScore) / 3
            : 0;
          const sB = b.feedback
            ? (b.feedback.technicalScore + b.feedback.communicationScore + b.feedback.problemSolvingScore) / 3
            : 0;
          return sA - sB;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [interviews, search, sortBy, filterType, filterStatus]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and track all your past interviews
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, type, or difficulty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="score-high">Highest score</SelectItem>
                <SelectItem value="score-low">Lowest score</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DSA">DSA</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredAndSorted.length === 0 ? (
        interviews.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No interviews yet"
            description="Start your first AI-powered interview to see your history here."
            actionLabel="Start Interview"
            actionHref="/interview/new"
          />
        ) : (
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try adjusting your search or filters."
          />
        )
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredAndSorted.length} interview{filteredAndSorted.length !== 1 ? "s" : ""}
          </p>
          {filteredAndSorted.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}

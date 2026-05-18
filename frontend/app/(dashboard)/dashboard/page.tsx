'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { getHistory } from '@/lib/services/interview'
import { getAptitudeHistory } from '@/lib/services/aptitude'
import type {
  InterviewWithFeedbackScores,
  AptitudeHistoryItem
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import InterviewCard from '@/components/InterviewCard'
import AptitudeCard from '@/components/AptitudeCard'
import EmptyState from '@/components/EmptyState'
import {
  Plus,
  BarChart3,
  Target,
  CheckCircle2,
  Inbox,
  Calculator
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<InterviewWithFeedbackScores[]>(
    []
  )
  const [aptitudes, setAptitudes] = useState<AptitudeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, aptitudeData] = await Promise.all([
          getHistory(),
          getAptitudeHistory()
        ])
        setInterviews(historyData.interviews)
        setAptitudes(aptitudeData.tests)
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const completedInterviews = interviews.filter((i) => i.isCompleted)
  const totalInterviews = interviews.length
  const completionRate =
    totalInterviews > 0
      ? Math.round((completedInterviews.length / totalInterviews) * 100)
      : 0

  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((acc, i) => {
            if (!i.feedback) return acc
            return (
              acc +
              (i.feedback.technicalScore +
                i.feedback.communicationScore +
                i.feedback.problemSolvingScore) /
                3
            )
          }, 0) / completedInterviews.length
        )
      : 0

  const recentInterviews = interviews.slice(0, 5)
  const recentAptitudes = aptitudes.slice(0, 5)
  const aptitudeAttempts = aptitudes.length
  const averageAptitudeScore =
    aptitudes.filter((item) => item.score !== null).length > 0
      ? Math.round(
          aptitudes
            .filter((item) => item.score !== null)
            .reduce((acc, item) => acc + (item.score ?? 0), 0) /
            aptitudes.filter((item) => item.score !== null).length
        )
      : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    )
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
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your progress and start new interviews
          </p>
        </div>
        <Link href="/interview/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Start Interview
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <BarChart3 className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Interviews</p>
              <p className="text-2xl font-bold tabular-nums">
                {totalInterviews}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Target className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold tabular-nums">
                {avgScore}
                <span className="text-sm font-normal text-muted-foreground">
                  /100
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Calculator className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aptitude Attempts</p>
              <p className="text-2xl font-bold tabular-nums">
                {aptitudeAttempts}
              </p>
              <p className="text-xs text-muted-foreground">
                Average score {averageAptitudeScore}/100
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold tabular-nums">
                {completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Interviews</h2>
          {interviews.length > 5 && (
            <Link href="/history">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                View all
              </Button>
            </Link>
          )}
        </div>

        {recentInterviews.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No interviews yet"
            description="Start your first AI-powered interview to begin tracking your progress."
            actionLabel="Start Interview"
            actionHref="/interview/new"
          />
        ) : (
          <div className="space-y-3">
            {recentInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Aptitude Tests</h2>
          {aptitudes.length > 5 && (
            <Link href="/history">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                View all
              </Button>
            </Link>
          )}
        </div>

        {recentAptitudes.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="No aptitude tests yet"
            description="Start an aptitude test to begin tracking your quantitative progress."
            actionLabel="Start Interview"
            actionHref="/interview/new"
          />
        ) : (
          <div className="space-y-3">
            {recentAptitudes.map((attempt) => (
              <AptitudeCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

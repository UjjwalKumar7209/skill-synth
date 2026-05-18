'use client'

import { useEffect, useMemo, useState } from 'react'
import { getHistory } from '@/lib/services/interview'
import { getAptitudeHistory } from '@/lib/services/aptitude'
import type {
  InterviewWithFeedbackScores,
  AptitudeHistoryItem
} from '@/lib/types'
import InterviewCard from '@/components/InterviewCard'
import AptitudeCard from '@/components/AptitudeCard'
import EmptyState from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search, Inbox } from 'lucide-react'

type HistoryTab = 'interviews' | 'aptitude'
type InterviewSortOption = 'newest' | 'oldest' | 'score-high' | 'score-low'
type AptitudeSortOption = 'newest' | 'oldest' | 'score-high' | 'score-low'
type FilterStatus = 'all' | 'completed' | 'in-progress'

export default function HistoryPage() {
  const [tab, setTab] = useState<HistoryTab>('interviews')
  const [interviews, setInterviews] = useState<InterviewWithFeedbackScores[]>(
    []
  )
  const [aptitudes, setAptitudes] = useState<AptitudeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<
    InterviewSortOption | AptitudeSortOption
  >('newest')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

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
        setError('Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredInterviews = useMemo(() => {
    let result = [...interviews]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.company.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.difficulty.toLowerCase().includes(q)
      )
    }

    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType)
    }

    if (filterStatus === 'completed') {
      result = result.filter((item) => item.isCompleted)
    } else if (filterStatus === 'in-progress') {
      result = result.filter((item) => !item.isCompleted)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'score-high': {
          const scoreA = a.feedback
            ? (a.feedback.technicalScore +
                a.feedback.communicationScore +
                a.feedback.problemSolvingScore) /
              3
            : 0
          const scoreB = b.feedback
            ? (b.feedback.technicalScore +
                b.feedback.communicationScore +
                b.feedback.problemSolvingScore) /
              3
            : 0
          return scoreB - scoreA
        }
        case 'score-low': {
          const scoreA = a.feedback
            ? (a.feedback.technicalScore +
                a.feedback.communicationScore +
                a.feedback.problemSolvingScore) /
              3
            : 0
          const scoreB = b.feedback
            ? (b.feedback.technicalScore +
                b.feedback.communicationScore +
                b.feedback.problemSolvingScore) /
              3
            : 0
          return scoreA - scoreB
        }
        default:
          return 0
      }
    })

    return result
  }, [interviews, search, sortBy, filterType, filterStatus])

  const filteredAptitudes = useMemo(() => {
    let result = [...aptitudes]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.company.toLowerCase().includes(q) ||
          item.difficulty.toLowerCase().includes(q)
      )
    }

    if (filterStatus === 'completed') {
      result = result.filter((item) => item.isCompleted)
    } else if (filterStatus === 'in-progress') {
      result = result.filter((item) => !item.isCompleted)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'score-high':
          return (b.score ?? 0) - (a.score ?? 0)
        case 'score-low':
          return (a.score ?? 0) - (b.score ?? 0)
        default:
          return 0
      }
    })

    return result
  }, [aptitudes, search, sortBy, filterStatus])

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review interviews and aptitude attempts in one place.
          </p>
        </div>
        <div className="flex gap-2 rounded-full border bg-card p-1">
          {(['interviews', 'aptitude'] as HistoryTab[]).map((option) => (
            <button
              key={option}
              onClick={() => setTab(option)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                tab === option
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {option === 'interviews' ? 'Interviews' : 'Aptitude'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Active view
            </p>
            <p className="mt-2 text-base font-medium">
              {tab === 'interviews' ? 'Interview sessions' : 'Aptitude tests'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Entries
            </p>
            <p className="mt-2 text-base font-medium">
              {tab === 'interviews'
                ? filteredInterviews.length
                : filteredAptitudes.length}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </p>
            <p className="mt-2 text-base font-medium">
              {tab === 'interviews' ? 'Interview progress' : 'Test results'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or difficulty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as InterviewSortOption | AptitudeSortOption)
              }
            >
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

            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
              </SelectContent>
            </Select>

            {tab === 'interviews' && (
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="DSA">DSA</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {tab === 'interviews' ? (
          filteredInterviews.length === 0 ? (
            interviews.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No interviews yet"
                description="Start a session to start tracking progress."
                actionLabel="Start Interview"
                actionHref="/interview/new"
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No results found"
                description="Try another search term or filter."
              />
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {filteredInterviews.length} interview
                {filteredInterviews.length !== 1 ? 's' : ''}
              </p>
              {filteredInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )
        ) : filteredAptitudes.length === 0 ? (
          aptitudes.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No aptitude tests yet"
              description="Create a new aptitude assessment from the start flow."
              actionLabel="Start Interview"
              actionHref="/interview/new"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description="Try another search term or filter."
            />
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filteredAptitudes.length} aptitude attempt
              {filteredAptitudes.length !== 1 ? 's' : ''}
            </p>
            {filteredAptitudes.map((attempt) => (
              <AptitudeCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getAptitudeTest, submitAptitude } from '@/lib/services/aptitude'
import type { AptitudeTest } from '@/lib/types'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AptitudeTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params?.id as string

  const [test, setTest] = useState<AptitudeTest | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await getAptitudeTest(testId)
        setTest(data.test)
        setRemainingSeconds(data.test.timeLimit || 0)
      } catch (err) {
        setError('Unable to load aptitude test. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (testId) {
      fetchTest()
    }
  }, [testId])

  useEffect(() => {
    if (!test || test.isCompleted) {
      return
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [test])

  useEffect(() => {
    if (test?.isCompleted) {
      router.replace(`/aptitude/${testId}/review`)
    }
  }, [router, test, testId])

  const question = useMemo(
    () => test?.questions[currentIndex] ?? null,
    [test, currentIndex]
  )

  const answeredCount = Object.keys(answers).length
  const progressValue = test
    ? Math.round((answeredCount / test.questions.length) * 100)
    : 0

  const handleSelect = (questionId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (!test) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await submitAptitude(
        test.id,
        test.questions.map((question) => ({
          questionId: question.id,
          answer: answers[question.id] ?? ''
        }))
      )
      router.push(`/aptitude/${test.id}/review`)
    } catch (err) {
      setError('Failed to submit answers. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!test || !question) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Test not found or unavailable.</p>
      </div>
    )
  }

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const hasTimer =
    test?.timeLimit !== null &&
    test?.timeLimit !== undefined &&
    test?.timeLimit > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/interview/new"
          className="inline-flex items-center gap-2 text-sm text-primary transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to start
        </Link>
        <div className="space-y-1 text-right">
          <p className="text-sm text-muted-foreground">Time remaining</p>
          <p className="text-lg font-semibold">
            {hasTimer
              ? `${minutes}:${seconds.toString().padStart(2, '0')}`
              : 'No limit'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_0.9fr]">
        <section className="space-y-6 rounded-xl border bg-card p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{test.company} Aptitude Test</h1>
            <p className="text-sm text-muted-foreground">
              Answer the questions below and submit when ready.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border bg-background p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Question</p>
                <p className="text-lg font-semibold">
                  {currentIndex + 1} of {test.questions.length}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Difficulty: {test.difficulty}
              </p>
            </div>
            <Progress value={progressValue} className="h-2 rounded-full" />
          </div>

          <div className="space-y-5 rounded-xl border bg-background p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{question.question}</h2>
                  <p className="text-sm text-muted-foreground">
                    Select the best answer.
                  </p>
                </div>
                {test.isCompleted ? (
                  <Badge variant="secondary">Completed</Badge>
                ) : (
                  <Badge variant="outline">In progress</Badge>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(question.id, option)}
                    className={`w-full rounded-lg border px-4 py-4 text-left transition ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{answeredCount} answered</span>
              <span>•</span>
              <span>{test.questions.length - answeredCount} unanswered</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={currentIndex === test.questions.length - 1}
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(prev + 1, test.questions.length - 1)
                  )
                }
              >
                Next
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (hasTimer && remainingSeconds === 0)}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Submit Test
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border bg-card p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Test details</p>
            <p className="text-lg font-semibold">
              {test.questions.length} Questions
            </p>
          </div>
          <div className="space-y-3 rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className="font-semibold">{test.difficulty}</p>
          </div>
          <div className="space-y-3 rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Estimated time</p>
            <p className="font-semibold">
              {test.timeLimit
                ? `${Math.ceil(test.timeLimit / 60)} minutes`
                : 'No limit'}
            </p>
          </div>
          <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
            Keep answers selected for each question, then submit when you are
            ready. Your score will appear after submission.
          </div>
        </aside>
      </div>
    </div>
  )
}

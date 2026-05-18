'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAptitudeTest } from '@/lib/services/aptitude'
import type { AptitudeTest } from '@/lib/types'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AptitudeReviewPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params?.id as string

  const [test, setTest] = useState<AptitudeTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await getAptitudeTest(testId)
        setTest(data.test)
      } catch {
        setError('Unable to load review. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (testId) {
      fetchTest()
    }
  }, [testId])

  useEffect(() => {
    if (test && !test.isCompleted) {
      router.replace(`/aptitude/${testId}`)
    }
  }, [router, test, testId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-64 rounded-lg" />
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

  if (!test) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Review not available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aptitude Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your responses and compare them with the correct answers.
          </p>
        </div>
        <Link
          href="/interview/new"
          className="inline-flex items-center gap-2 text-sm text-primary transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to start
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="space-y-6 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {test.company} Aptitude Test
              </p>
              <h2 className="text-2xl font-semibold">Score review</h2>
            </div>
            <Badge variant="secondary">Completed</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Final score</p>
              <p className="mt-2 text-xl font-semibold">
                {test.score ?? 0}/{test.totalMarks ?? 0}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="mt-2 text-xl font-semibold">
                {test.questions.length}
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="mt-2 text-xl font-semibold">{test.difficulty}</p>
            </div>
          </div>

          <div className="space-y-4">
            {test.questions.map((question, index) => {
              const isCorrect = question.userAnswer === question.correctAnswer
              return (
                <div
                  key={question.id}
                  className="rounded-2xl border bg-background p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Question {index + 1}
                      </p>
                      <p className="font-semibold">{question.question}</p>
                    </div>
                    <Badge variant={isCorrect ? 'secondary' : 'destructive'}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Your answer</p>
                      <p className="rounded-xl bg-slate-950/5 px-3 py-2">
                        {question.userAnswer || 'No answer'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Correct answer</p>
                      <p className="rounded-xl bg-slate-950/5 px-3 py-2">
                        {question.correctAnswer || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border bg-card p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Aptitude Summary</p>
            <p className="text-lg font-semibold">{test.company}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-2 text-xl font-semibold">Yes</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">Last attempted</p>
            <p className="mt-2 text-base">
              {new Date(test.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button onClick={() => router.push('/interview/new')}>
            Start another test
          </Button>
        </aside>
      </div>
    </div>
  )
}

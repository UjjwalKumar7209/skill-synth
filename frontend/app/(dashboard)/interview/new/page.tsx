'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { startInterview } from '@/lib/services/interview'
import { startAptitude } from '@/lib/services/aptitude'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { AxiosError } from 'axios'
import Link from 'next/link'

const INTERVIEW_TYPES = [
  {
    value: 'DSA',
    label: 'DSA / Coding',
    description: 'Data structures, algorithms, and coding problems'
  },
  {
    value: 'HR',
    label: 'HR / Behavioral',
    description: 'Behavioral questions, culture fit, and communication'
  },
  {
    value: 'Aptitude',
    label: 'Aptitude / Quant',
    description: 'Quantitative aptitude and reasoning practice'
  }
]

const DIFFICULTIES = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Fundamentals and basic concepts'
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Intermediate problem-solving'
  },
  { value: 'hard', label: 'Hard', description: 'Advanced challenges' }
]

export default function NewInterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState('')
  const [type, setType] = useState(
    searchParams.get('mode') === 'aptitude' ? 'Aptitude' : ''
  )
  const [difficulty, setDifficulty] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const canProceed = () => {
    if (step === 1) return company.trim().length > 0
    if (step === 2) return type.length > 0
    if (step === 3) return difficulty.length > 0
    return false
  }

  const handleStart = async () => {
    setError('')
    setIsLoading(true)
    try {
      if (type === 'Aptitude') {
        const data = await startAptitude(company, difficulty)
        router.push(`/aptitude/${data.testId}`)
      } else {
        const data = await startInterview(company, type, difficulty)
        router.push(`/interview/${data.interviewId}`)
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.msg || 'Failed to start interview')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Company */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Which company?
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;ll tailor the interview to match their style
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                placeholder="e.g. Google, Amazon, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Interview type
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select the kind of interview you want to practice
              </p>
            </div>
            <div className="space-y-3">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    type === t.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border'
                  }`}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Difficulty */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Difficulty level
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Choose based on your comfort level
              </p>
            </div>
            <div className="space-y-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    difficulty === d.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border'
                  }`}
                >
                  <div className="font-medium">{d.label}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {d.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mt-4">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={!canProceed() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

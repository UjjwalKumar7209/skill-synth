import Link from 'next/link'
import type { AptitudeHistoryItem } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

interface AptitudeCardProps {
  attempt: AptitudeHistoryItem
}

export default function AptitudeCard({ attempt }: AptitudeCardProps) {
  return (
    <Card className="border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="text-base">{attempt.company}</span>
          <Badge variant={attempt.isCompleted ? 'secondary' : 'outline'}>
            {attempt.isCompleted ? 'Completed' : 'In progress'}
          </Badge>
        </CardTitle>
        <CardDescription>{attempt.difficulty} difficulty</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{attempt.questionCount ?? 0} questions</span>
          <span>
            {attempt.score !== null
              ? `${attempt.score}/${attempt.totalMarks}`
              : 'No score yet'}
          </span>
        </div>
        <Link
          href={
            attempt.isCompleted
              ? `/aptitude/${attempt.id}/review`
              : `/aptitude/${attempt.id}`
          }
          className="inline-flex items-center justify-between rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          <span>{attempt.isCompleted ? 'View results' : 'Continue test'}</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

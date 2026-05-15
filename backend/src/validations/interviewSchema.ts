import z from 'zod'

export const InterviewSchema = z.object({
  company: z.string(),
  type: z.string(),
  difficulty: z.string()
})

export const InterviewReplySchema = z.object({
  interviewId: z.string(),
  answer: z.string()
})

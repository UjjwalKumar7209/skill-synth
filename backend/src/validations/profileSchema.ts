import z from 'zod'

export const ProfileSchema = z.object({
    experienceLevel: z.string(),
    skills: z.string(),
    targetRole: z.string()
})
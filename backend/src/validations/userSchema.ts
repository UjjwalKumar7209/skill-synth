import { z } from 'zod'

export const UserRegister = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string().min(8)
})

export const UserLogin = z.object({
  email: z.string(),
  password: z.string().min(8)
})

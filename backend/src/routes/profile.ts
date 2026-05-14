import express, { type Request, type Response } from 'express'
import { prisma } from '../db/prisma'
import { ProfileSchema } from '../validations/profileSchema'

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }
  const data = await prisma.profile.findUnique({
    where: {
      userId: req.userId
    }
  })
  if (!data) {
    return res.status(404).json({
      msg: 'Profile not found'
    })
  }
  return res.status(200).json({
    experienceLevel: data.experienceLevel,
    skills: data.skills,
    targetRole: data.targetRole
  })
})

router.post('/', async (req: Request, res: Response) => {
  const { experienceLevel, skills, targetRole } = req.body

  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  try {
    const result = ProfileSchema.safeParse({
      experienceLevel,
      skills,
      targetRole
    })
    if (!result.success) {
      return res.status(400).json({
        msg: 'Invalid data'
      })
    }
    const checkProfile = await prisma.profile.findUnique({
      where: {
        userId: req.userId
      }
    })
    if (checkProfile) {
      return res.status(409).json({
        msg: 'Profile already exists for this user'
      })
    }
    const profile = await prisma.profile.create({
      data: {
        experienceLevel,
        skills,
        targetRole,
        userId: req.userId
      }
    })

    return res.status(201).json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

export default router

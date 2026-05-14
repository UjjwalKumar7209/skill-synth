import express, { type Request, type Response } from 'express'
import { prisma } from '../db/prisma'

const router = express.Router()

router.post('/start', async (req: Request, res: Response) => {
  const { company, type, difficulty } = req.body
  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }
  const interviewData = await prisma.interview.create({
    data: {
      company,
      difficulty,
      type,
      userId: req.userId
    }
  })
  const userProfile = await prisma.profile.findUnique({
    where: {
        userId: req.userId
    }
  })
})

export default router

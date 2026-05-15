import express, { type Request, type Response } from 'express'
import { prisma } from '../db/prisma'
import {
  InterviewReplySchema,
  InterviewSchema
} from '../validations/interviewSchema'

import {
  generateFirstInterviewQuestion,
  generateReply
} from '../services/ai/interviewEngine'
import { generateInterviewFeedback } from '../services/ai/feedbackEngine'

const router = express.Router()

const MAX_QUESTIONS = 5
const MAX_FOLLOW_UPS = 2

router.post('/start', async (req: Request, res: Response) => {
  const { company, type, difficulty } = req.body

  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  try {
    const result = InterviewSchema.safeParse({
      company,
      type,
      difficulty
    })

    if (!result.success) {
      return res.status(400).json({
        msg: 'Invalid interview data',
        errors: result.error.flatten()
      })
    }

    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: req.userId
      }
    })

    if (!userProfile) {
      return res.status(404).json({
        msg: 'Profile not found'
      })
    }

    const interview = await prisma.interview.create({
      data: {
        company,
        type,
        difficulty,
        userId: req.userId,
        questionCount: 1,
        followUpCount: 0,
        isCompleted: false
      }
    })

    const firstQuestion = await generateFirstInterviewQuestion({
      company,
      type,
      difficulty,
      skills: userProfile.skills,
      experienceLevel: userProfile.experienceLevel,
      targetRole: userProfile.targetRole
    })

    await prisma.message.create({
      data: {
        interviewId: interview.id,
        sender: 'AI',
        message: firstQuestion
      }
    })

    return res.status(201).json({
      interviewId: interview.id,
      action: 'NEW_QUESTION',
      message: firstQuestion
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

router.post('/reply', async (req: Request, res: Response) => {
  const { interviewId, answer } = req.body

  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  try {
    const result = InterviewReplySchema.safeParse({
      interviewId,
      answer
    })

    if (!result.success) {
      return res.status(400).json({
        msg: 'Invalid answer input',
        errors: result.error.flatten()
      })
    }

    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId
      }
    })

    if (!interview) {
      return res.status(404).json({
        msg: 'Interview not found'
      })
    }

    if (interview.isCompleted) {
      return res.status(400).json({
        msg: 'Interview already completed'
      })
    }

    await prisma.message.create({
      data: {
        interviewId,
        sender: 'USER',
        message: answer
      }
    })

    // HARD BACKEND LIMIT
    if (interview.questionCount >= MAX_QUESTIONS) {
      await prisma.interview.update({
        where: {
          id: interviewId
        },
        data: {
          isCompleted: true
        }
      })

      await prisma.message.create({
        data: {
          interviewId,
          sender: 'SYSTEM',
          message: 'Interview completed successfully.'
        }
      })

      return res.status(200).json({
        action: 'END_INTERVIEW',
        message: 'Interview completed successfully.'
      })
    }

    const messages = await prisma.message.findMany({
      where: {
        interviewId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const forceNewQuestion = interview.followUpCount >= MAX_FOLLOW_UPS

    const aiResponse = await generateReply({
      messages,
      questionCount: interview.questionCount,
      followUpCount: interview.followUpCount,
      forceNewQuestion
    })

    let parsedResponse: {
      action: string
      message: string
    }

    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch {
      return res.status(500).json({
        msg: 'Invalid AI response format'
      })
    }

    const validActions = ['FOLLOW_UP', 'NEW_QUESTION', 'END_INTERVIEW']

    if (!validActions.includes(parsedResponse.action)) {
      return res.status(500).json({
        msg: 'Invalid AI action'
      })
    }

    // FORCE BACKEND CONTROL
    if (forceNewQuestion && parsedResponse.action === 'FOLLOW_UP') {
      parsedResponse.action = 'NEW_QUESTION'
    }

    // UPDATE INTERVIEW STATE
    if (parsedResponse.action === 'FOLLOW_UP') {
      await prisma.interview.update({
        where: {
          id: interviewId
        },
        data: {
          followUpCount: {
            increment: 1
          }
        }
      })
    }

    if (parsedResponse.action === 'NEW_QUESTION') {
      await prisma.interview.update({
        where: {
          id: interviewId
        },
        data: {
          questionCount: {
            increment: 1
          },
          followUpCount: 0
        }
      })
    }

    if (parsedResponse.action === 'END_INTERVIEW') {
      await prisma.interview.update({
        where: {
          id: interviewId
        },
        data: {
          isCompleted: true
        }
      })
      // STORE FINAL AI MESSAGE
      await prisma.message.create({
        data: {
          interviewId,
          sender: 'AI',
          message: parsedResponse.message
        }
      })
      const interviewMessages = await prisma.message.findMany({
        where: {
          interviewId
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
      const feedbackResponse =
        await generateInterviewFeedback(interviewMessages)
      let parsedFeedback

      try {
        parsedFeedback = JSON.parse(feedbackResponse)
      } catch {
        return res.status(500).json({
          msg: 'Invalid feedback format'
        })
      }

      await prisma.feedback.create({
        data: {
          interviewId,
          technicalScore: parsedFeedback.technicalScore,
          communicationScore: parsedFeedback.communicationScore,
          problemSolvingScore: parsedFeedback.problemSolvingScore,
          strengths: parsedFeedback.strengths,
          weaknesses: parsedFeedback.weaknesses,
          suggestions: parsedFeedback.suggestions,
          summary: parsedFeedback.summary
        }
      })
      return res.status(200).json({
        action: 'END_INTERVIEW',
        message: parsedResponse.message,
        feedback: parsedFeedback
      })
    }

    // STORE AI MESSAGE
    await prisma.message.create({
      data: {
        interviewId,
        sender: 'AI',
        message: parsedResponse.message
      }
    })

    return res.status(200).json(parsedResponse)
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

router.get('/history', async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  try {
    const interviews = await prisma.interview.findMany({
      where: {
        userId: req.userId
      },

      include: {
        feedback: {
          select: {
            technicalScore: true,
            communicationScore: true,
            problemSolvingScore: true
          }
        }
      },

      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json({
      interviews
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  try {
    const interview = await prisma.interview.findUnique({
      where: {
        id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        feedback: true
      }
    })

    if (!interview) {
      return res.status(404).json({
        msg: 'Interview not found'
      })
    }

    // SECURITY CHECK
    if (interview.userId !== req.userId) {
      return res.status(403).json({
        msg: 'Forbidden'
      })
    }

    return res.status(200).json({
      interview
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

export default router

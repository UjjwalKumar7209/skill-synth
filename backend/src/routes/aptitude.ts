import express, { type Request, type Response } from 'express'

import { prisma } from '../db/prisma'
import { generateAptitudeQuiz } from '../services/ai/aptitudeEngine'

const router = express.Router()

router.post('/start', async (req: Request, res: Response) => {
  const { company, difficulty } = req.body

  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  try {
    if (!company || !difficulty) {
      return res.status(400).json({
        msg: 'Company and difficulty are required'
      })
    }

    const quizResponse = await generateAptitudeQuiz(company, difficulty)

    let parsedQuiz

    try {
      parsedQuiz = JSON.parse(quizResponse)
    } catch {
      return res.status(500).json({
        msg: 'Invalid AI response format'
      })
    }

    const aptitudeTest = await prisma.aptitudeTest.create({
      data: {
        userId: req.userId,
        company,
        difficulty
      }
    })

    await prisma.aptitudeQuestion.createMany({
      data: parsedQuiz.questions.map((q: any) => ({
        aptitudeTestId: aptitudeTest.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    })

    const savedQuestions = await prisma.aptitudeQuestion.findMany({
      where: {
        aptitudeTestId: aptitudeTest.id
      },
      select: {
        id: true,
        question: true,
        options: true
      }
    })

    return res.status(200).json({
      testId: aptitudeTest.id,
      questions: savedQuestions
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

router.post('/submit', async (req: Request, res: Response) => {
  const { testId, answers } = req.body

  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  try {
    const aptitudeTest = await prisma.aptitudeTest.findUnique({
      where: {
        id: testId
      },
      include: {
        questions: true
      }
    })

    if (!aptitudeTest) {
      return res.status(404).json({
        msg: 'Aptitude test not found'
      })
    }

    if (aptitudeTest.userId !== req.userId) {
      return res.status(403).json({
        msg: 'Forbidden'
      })
    }

    if (aptitudeTest.isCompleted) {
      return res.status(400).json({
        msg: 'Test already submitted'
      })
    }

    let score = 0

    for (const answerData of answers) {
      const question = aptitudeTest.questions.find(
        (q) => q.id === answerData.questionId
      )

      if (!question) continue

      await prisma.aptitudeQuestion.update({
        where: {
          id: question.id
        },
        data: {
          userAnswer: answerData.answer
        }
      })

      if (question.correctAnswer === answerData.answer) {
        score++
      }
    }

    await prisma.aptitudeTest.update({
      where: {
        id: testId
      },
      data: {
        score,
        totalMarks: aptitudeTest.questions.length,
        isCompleted: true
      }
    })

    return res.status(200).json({
      score,
      totalMarks: aptitudeTest.questions.length,
      correctAnswers: score,
      wrongAnswers: aptitudeTest.questions.length - score
    })
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
    const tests = await prisma.aptitudeTest.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json({
      tests
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  const idParam = req.params.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam

  if (!req.userId) {
    return res.status(401).json({
      msg: 'Unauthorized'
    })
  }

  if (!id) {
    return res.status(400).json({
      msg: 'Test id is required'
    })
  }

  try {
    const test = await prisma.aptitudeTest.findUnique({
      where: {
        id
      },
      include: {
        questions: true
      }
    })

    if (!test) {
      return res.status(404).json({
        msg: 'Test not found'
      })
    }

    if (test.userId !== req.userId) {
      return res.status(403).json({
        msg: 'Forbidden'
      })
    }

    return res.status(200).json({
      test
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

export default router

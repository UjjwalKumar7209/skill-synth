import bcrypt from 'bcryptjs'
import express, { type Request, type Response } from 'express'
import { prisma } from '../db/prisma'
import { UserLogin, UserRegister } from '../validations/userSchema'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  try {
    const result = UserRegister.safeParse({
      name,
      email,
      password
    })
    if (!result.success) {
      return res.status(400).json({
        msg: 'Invalid inputs. Please verify!',
        errors: result.error.flatten()
      })
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return res.status(409).json({
        msg: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })
    return res.status(201).json({
      msg: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error: unknown) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = UserLogin.safeParse({
      email,
      password
    })
    if (!result.success) {
      return res.status(400).json({
        msg: 'Invalid inputs. Please verify!',
        errors: result.error.flatten()
      })
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    if (!user) {
      return res.status(404).json({
        msg: 'Invalid credentials'
      })
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({
        msg: 'Invalid credentials'
      })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET missing')
    }

    const token = jwt.sign(
      {
        userId: user.id
      },
      secret,
      {
        expiresIn: '7d'
      }
    )

    return res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error: unknown) {
    console.log(error)

    return res.status(500).json({
      msg: 'Internal server error'
    })
  }
})

export default router

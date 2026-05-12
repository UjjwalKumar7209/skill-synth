import { type NextFunction, type Request, type Response } from 'express'

import jwt from 'jsonwebtoken'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        msg: 'Token missing'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        msg: 'Token missing'
      })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({
        msg: 'JWT secret not configured'
      })
    }

    const decoded = jwt.verify(token, secret) as { userId: string }

    req.userId = decoded.userId

    next()
  } catch (error) {
    return res.status(401).json({
      msg: 'Invalid or expired token'
    })
  }
}

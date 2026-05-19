import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware } from './middleware/authMiddleware'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import interviewRoutes from './routes/interview'
import aptitudeRoutes from './routes/aptitude'

dotenv.config()

const PORT = Number(process.env.PORT) || 8080
const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://skill-synth-gray.vercel.app'],
    credentials: true
  })
)
app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/profile', authMiddleware, profileRoutes)
app.use('/api/v1/interview', authMiddleware, interviewRoutes)
app.use('/api/v1/aptitude', authMiddleware, aptitudeRoutes)

app.get('/', (_, res) => {
  res.send('SkillSynth Backend Running')
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

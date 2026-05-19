import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware } from './middleware/authMiddleware'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import interviewRoutes from './routes/interview'
import aptitudeRoutes from './routes/aptitude'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/profile', authMiddleware, profileRoutes)
app.use('/api/v1/interview', authMiddleware, interviewRoutes)
app.use('/api/v1/aptitude', authMiddleware, aptitudeRoutes)

app.get('/', (_, res) => {
  res.send('SkillSynth Backend Running')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

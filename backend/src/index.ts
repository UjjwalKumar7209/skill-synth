import express from "express";
import cors from "cors";
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import dotenv from 'dotenv'
import { authMiddleware } from "./middleware/authMiddleware";

dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/profile', authMiddleware, profileRoutes)

app.get("/", (_, res) => {
  res.send("SkillSynth Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
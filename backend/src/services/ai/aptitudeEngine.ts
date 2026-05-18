import { generateAIResponse } from './openrouter'
import { buildAptitudePrompt } from './aptitudePrompt'

export const generateAptitudeQuiz = async (
  company: string,
  difficulty: string
) => {
  const prompt = buildAptitudePrompt(company, difficulty)

  const response = await generateAIResponse(prompt)

  return response
}

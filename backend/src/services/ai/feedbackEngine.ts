import { generateAIResponse } from './openrouter'
import { buildFeedbackPrompt } from './promptBuilder'

export const generateInterviewFeedback = async (messages: any[]) => {
  const conversation = messages
    .map((msg: any) => `${msg.sender}: ${msg.message}`)
    .join('\n')

  const prompt = buildFeedbackPrompt(conversation)

  const response = await generateAIResponse(prompt)

  return response
}

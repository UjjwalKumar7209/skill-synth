import { buildFirstQuestionPrompt, buildReplyPrompt } from './promptBuilder'
import { generateAIResponse } from './openrouter'

export const generateFirstInterviewQuestion = async (data: any) => {
  const prompt = buildFirstQuestionPrompt(data)
  const aiResponse = await generateAIResponse(prompt)
  return aiResponse
}

export const generateReply = async ({
  messages,
  questionCount,
  followUpCount,
  forceNewQuestion
}: any) => {
  const conversation = messages
    .map((msg: any) => `${msg.sender}: ${msg.message}`)
    .join('\n')

  const prompt = buildReplyPrompt({
    conversation,
    questionCount,
    followUpCount,
    forceNewQuestion
  })

  const response = await generateAIResponse(prompt)

  return response
}

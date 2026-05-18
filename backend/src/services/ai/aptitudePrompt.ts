export const buildAptitudePrompt = (company: string, difficulty: string) => {
  return `
Generate 10 aptitude interview questions for ${company}.

Difficulty:
${difficulty}

Question categories:
- Quantitative aptitude
- Logical reasoning
- Verbal ability

IMPORTANT:
Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}

Rules:
- Exactly 4 options.
- Only one correct answer.
- Questions should feel interview-quality.
- No markdown.
- No extra text.
`
}

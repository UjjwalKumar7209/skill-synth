import api from '@/lib/api'
import type {
  AptitudeStartResponse,
  AptitudeHistoryResponse,
  AptitudeDetailResponse,
  AptitudeSubmitResponse
} from '@/lib/types'

export async function startAptitude(
  company: string,
  difficulty: string
): Promise<AptitudeStartResponse> {
  const res = await api.post('/aptitude/start', { company, difficulty })
  return res.data
}

export async function submitAptitude(
  testId: string,
  answers: Array<{ questionId: string; answer: string }>
): Promise<AptitudeSubmitResponse> {
  const res = await api.post('/aptitude/submit', { testId, answers })
  return res.data
}

export async function getAptitudeHistory(): Promise<AptitudeHistoryResponse> {
  const res = await api.get('/aptitude/history')
  return res.data
}

export async function getAptitudeTest(
  id: string
): Promise<AptitudeDetailResponse> {
  const res = await api.get(`/aptitude/${id}`)
  return res.data
}

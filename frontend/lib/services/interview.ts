import api from "@/lib/api";
import type {
  StartInterviewResponse,
  ReplyResponse,
  HistoryResponse,
  InterviewDetailResponse,
} from "@/lib/types";

export async function startInterview(
  company: string,
  type: string,
  difficulty: string
): Promise<StartInterviewResponse> {
  const res = await api.post("/interview/start", { company, type, difficulty });
  return res.data;
}

export async function sendReply(
  interviewId: string,
  answer: string
): Promise<ReplyResponse> {
  const res = await api.post("/interview/reply", { interviewId, answer });
  return res.data;
}

export async function getHistory(): Promise<HistoryResponse> {
  const res = await api.get("/interview/history");
  return res.data;
}

export async function getInterview(
  id: string
): Promise<InterviewDetailResponse> {
  const res = await api.get(`/interview/${id}`);
  return res.data;
}

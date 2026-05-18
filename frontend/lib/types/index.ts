// ========================
// User & Auth
// ========================
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  msg: string;
  token: string;
  user: User;
}

export interface SignupResponse {
  msg: string;
  user: User;
}

// ========================
// Profile
// ========================
export interface Profile {
  experienceLevel: string;
  skills: string;
  targetRole: string;
}

// ========================
// Interview
// ========================
export interface Interview {
  id: string;
  userId: string;
  company: string;
  type: string;
  difficulty: string;
  questionCount: number;
  followUpCount: number;
  isCompleted: boolean;
  createdAt: string;
  feedback?: Feedback | null;
  messages?: Message[];
}

export interface InterviewWithFeedbackScores {
  id: string;
  userId: string;
  company: string;
  type: string;
  difficulty: string;
  questionCount: number;
  followUpCount: number;
  isCompleted: boolean;
  createdAt: string;
  feedback: {
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
  } | null;
}

export interface Message {
  id: string;
  interviewId: string;
  sender: "AI" | "USER" | "SYSTEM";
  message: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  summary: string;
  createdAt: string;
}

// ========================
// API Response Shapes
// ========================
export interface StartInterviewResponse {
  interviewId: string;
  action: "NEW_QUESTION";
  message: string;
}

export interface ReplyResponse {
  action: "FOLLOW_UP" | "NEW_QUESTION" | "END_INTERVIEW";
  message: string;
  feedback?: Feedback;
}

export interface HistoryResponse {
  interviews: InterviewWithFeedbackScores[];
}

export interface InterviewDetailResponse {
  interview: Interview;
}

export interface ApiError {
  msg: string;
  errors?: unknown;
}

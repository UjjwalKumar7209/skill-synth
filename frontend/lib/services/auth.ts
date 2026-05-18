import api from "@/lib/api";
import type { AuthResponse, SignupResponse } from "@/lib/types";

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  const res = await api.post("/auth/signup", { name, email, password });
  return res.data;
}

import api from "@/lib/api";
import type { Profile } from "@/lib/types";

export async function getProfile(): Promise<Profile> {
  const res = await api.get("/profile");
  return res.data;
}

export async function createProfile(data: Profile): Promise<Profile> {
  const res = await api.post("/profile", data);
  return res.data;
}

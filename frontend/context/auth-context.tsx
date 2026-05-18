"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/types";
import { login as loginApi, signup as signupApi } from "@/lib/services/auth";
import { getProfile } from "@/lib/services/profile";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasProfile: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkProfile = useCallback(async (): Promise<boolean> => {
    try {
      await getProfile();
      setHasProfile(true);
      return true;
    } catch {
      setHasProfile(false);
      return false;
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        await checkProfile();
      }
      setIsLoading(false);
    };
    init();
  }, [checkProfile]);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!token && !isPublic) {
      router.replace("/login");
    }
  }, [isLoading, token, pathname, router]);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    const profileExists = await checkProfile();
    if (profileExists) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await signupApi(name, email, password);
    router.push("/login");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setHasProfile(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        hasProfile,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

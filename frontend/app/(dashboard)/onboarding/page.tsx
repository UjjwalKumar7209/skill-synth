"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProfile } from "@/lib/services/profile";
import { Loader2, Sparkles } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0–1 years)" },
  { value: "intermediate", label: "Intermediate (1–3 years)" },
  { value: "advanced", label: "Advanced (3–5 years)" },
  { value: "expert", label: "Expert (5+ years)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!skills.trim()) {
      setError("Please enter your skills");
      return;
    }
    if (!experienceLevel) {
      setError("Please select your experience level");
      return;
    }
    if (!targetRole.trim()) {
      setError("Please enter your target role");
      return;
    }

    setIsLoading(true);
    try {
      await createProfile({ skills, experienceLevel, targetRole });
      toast.success("Profile created successfully!");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.msg || "Failed to create profile");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Setup
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Complete your profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Help us personalize your interview experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              placeholder="e.g. JavaScript, Python, React, Node.js, SQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of your technical skills
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel} disabled={isLoading}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Input
              id="targetRole"
              placeholder="e.g. Frontend Engineer, Backend Developer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

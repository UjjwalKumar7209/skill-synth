"use client";

import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
            <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
            <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

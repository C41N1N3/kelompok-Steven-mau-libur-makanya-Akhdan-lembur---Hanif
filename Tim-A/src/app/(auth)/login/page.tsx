import { Suspense } from "react";

import { AuthForm } from "@/features/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

function AuthFormFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Skeleton className="h-96 w-full max-w-sm" />
    </main>
  );
}

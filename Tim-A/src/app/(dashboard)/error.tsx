"use client";

import { Button } from "@/components/ui/button";
import { getDashboardUserErrorMessage } from "@/lib/errors/user-facing";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-2xl content-center px-6 py-6">
      <div className="rounded-lg border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {getDashboardUserErrorMessage()}
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </section>
  );
}

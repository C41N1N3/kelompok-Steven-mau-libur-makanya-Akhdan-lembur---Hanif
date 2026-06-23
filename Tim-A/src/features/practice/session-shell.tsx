"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SessionShellContext = createContext<{
  hideHeader: boolean;
  setHideHeader: (hide: boolean) => void;
}>({
  hideHeader: false,
  setHideHeader: () => {},
});

export function useSessionShell() {
  return useContext(SessionShellContext);
}

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  variant?: "default" | "conversation";
  backHref?: string;
};

export function SessionShell({
  title,
  subtitle,
  children,
  variant = "default",
  backHref = "/learn",
}: Props) {
  const [hideHeader, setHideHeader] = useState(false);

  const contextValue = {
    hideHeader,
    setHideHeader,
  };

  if (variant === "conversation") {
    return (
      <SessionShellContext.Provider value={contextValue}>
        <section className="conversation-section mx-auto min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-177px)] max-w-[1480px] px-[22px] py-10">
          {!hideHeader && (
            <Link
              href={backHref}
              className="ml-4 inline-flex h-[53px] w-[114px] items-center justify-center gap-2 rounded-[14px] border border-[#7c571e]/30 bg-white text-base font-semibold text-black shadow-[0_4px_8px_rgba(0,0,0,0.16)] md:ml-[46px]"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          )}
          {children}
        </section>
      </SessionShellContext.Provider>
    );
  }

  return (
    <SessionShellContext.Provider value={contextValue}>
      <section className="mx-auto min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-177px)] max-w-[1480px] px-5 py-8 md:px-10">
        {!hideHeader && (
          <div className="relative mb-8 grid items-center gap-5 md:grid-cols-[114px_1fr_114px]">
            <Link
              href={backHref}
              className="inline-flex h-[53px] w-[114px] items-center justify-center gap-2 rounded-[14px] border border-[#7c571e]/30 bg-white text-base font-semibold text-black shadow-[0_4px_8px_rgba(0,0,0,0.16)]"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold leading-tight text-black md:text-[40px]">
                {title}
              </h1>
              <p className="mt-2 text-lg leading-7 text-[#4f4539]">{subtitle}</p>
            </div>
          </div>
        )}

        <div
          className={cn(
            "mx-auto max-w-[980px] rounded-[24px] border border-[#f3eee8] bg-[#fefcfb] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.22)] md:p-10",
            hideHeader && "border-none bg-transparent p-0 shadow-none md:p-0"
          )}
        >
          {children}
        </div>
      </section>
    </SessionShellContext.Provider>
  );
}

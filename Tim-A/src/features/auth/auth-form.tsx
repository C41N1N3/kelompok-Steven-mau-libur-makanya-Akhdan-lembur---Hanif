"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";

import {
  signInWithPassword,
  signUpWithPassword,
} from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";
type AuthState = { error?: string };

const initialState: AuthState = {};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const searchParams = useSearchParams();
  const isLogin = mode === "login";
  const pageMessage = getAuthPageMessage(searchParams);
  const action = isLogin ? signInWithPassword : signUpWithPassword;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_previousState: AuthState, formData: FormData) => {
      return (await action(formData)) ?? {};
    },
    initialState,
  );
  const ctaLabel = isLogin ? "Sign In" : "Sign Up";

  return (
    <main className="relative flex min-h-[calc(100vh/var(--app-zoom))] w-[calc(100vw/var(--app-zoom))] items-start justify-center overflow-x-hidden bg-white px-4 pb-12 pt-[160px] text-[#4f4539] sm:px-6 lg:px-10">
      <div className="absolute inset-x-0 bottom-[-120px] top-0">
        <Image
          src="/auth/santorini-cliffside.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-[#f6f1e8]/35 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-0" />
      </div>

      <section className="relative flex min-h-[820px] w-full max-w-[552px] flex-col items-center rounded-[24px] border border-black bg-[#fdfdfd] px-5 py-10 shadow-[0_28px_80px_rgba(47,38,25,0.24)] sm:px-9 sm:py-[54px] lg:min-h-[922px]">
        <div className="flex flex-col items-center text-center">
          <div
            aria-label="GLOSIO logo"
            role="img"
            className="relative flex h-[220px] w-[310px] items-center justify-center sm:h-[286px] sm:w-[430px]"
          >
            <GrainOrnament side="left" />
            <Image
              src="/auth/greek-temple.svg"
              alt=""
              width={269}
              height={269}
              className="relative z-10 size-[190px] sm:size-[240px] lg:size-[269px]"
            />
            <GrainOrnament side="right" />
          </div>
          <p className="mt-1 font-lexend text-[28px] font-bold leading-none text-[#c89b5b] sm:text-[32px]">
            GLOSIO
          </p>
          <p className="mt-6 text-[18px] leading-normal text-black sm:text-[24px]">
            A Greek Learning Companion
          </p>
        </div>

        <div className="mt-8 w-full rounded-[24px] border border-[#e7d7c3] bg-white/95 p-6 shadow-[0_12px_40px_rgba(156,122,82,0.12)] backdrop-blur-[6px] sm:mt-11 sm:p-[33px]">
          {pageMessage ? (
            <p
              className="mb-5 rounded-[12px] border border-[#d3c4b4] bg-[#fef9f0] px-4 py-3 text-base text-[#817568]"
              role={pageMessage.type === "error" ? "alert" : "status"}
            >
              {pageMessage.text}
            </p>
          ) : null}
          <form action={formAction} className="space-y-6">
            {!isLogin ? (
              <AuthField
                id="username"
                name="username"
                label="Username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                icon="user"
                value={username}
                onChange={setUsername}
              />
            ) : null}
            <AuthField
              id="email"
              name="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              icon="mail"
              value={email}
              onChange={setEmail}
            />
            <AuthField
              id="password"
              name="password"
              label="Password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Enter your password"
              icon="lock"
              minLength={isLogin ? undefined : 8}
              value={password}
              onChange={setPassword}
              labelAction={
                isLogin ? (
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium leading-5 text-[#c89b5b] underline-offset-4 transition-colors hover:text-[#9c7a52] hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c89b5b]/25"
                  >
                    Forgot password?
                  </Link>
                ) : null
              }
            />
            {state.error ? (
              <p className="text-base text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              className="flex h-[58px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c89b5b] to-[#d4a24c] px-6 py-3.5 text-[20px] font-semibold leading-[30px] text-[#f6f1e8] shadow-[0_4px_7px_rgba(156,122,82,0.2)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c89b5b]/35 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              disabled={pending}
            >
              <span>{pending ? "Please wait" : ctaLabel}</span>
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-7 border-t border-[#e7e2d9] pt-6">
            <p className="flex items-center justify-center gap-1 text-center text-[16px] leading-[25.6px] text-[#4f4539]">
              {isLogin ? "Are you new?" : "Already registered?"}{" "}
              <Link
                href={isLogin ? "/register" : "/login"}
                className="text-base font-medium leading-6 tracking-[0.14px] text-[#c89b5b] hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function GrainOrnament({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      data-auth-grain={side}
      viewBox="0 0 108 218"
      className={cn(
        "absolute bottom-3 z-0 h-[122px] w-[60px] text-[#ead8bf] opacity-90 sm:bottom-6 sm:h-[168px] sm:w-[84px] lg:h-[188px] lg:w-[94px]",
        side === "left" ? "left-0" : "right-0 scale-x-[-1]",
      )}
    >
      <path
        d="M82 10C54 45 37 84 31 126c-4 28-2 55 7 82"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="8"
      />
      {[
        ["61", "47", "-31"],
        ["45", "73", "-20"],
        ["34", "101", "-11"],
        ["31", "132", "3"],
        ["37", "160", "17"],
        ["51", "184", "29"],
        ["72", "34", "29"],
        ["61", "62", "21"],
        ["54", "93", "12"],
        ["55", "123", "0"],
        ["65", "151", "-13"],
      ].map(([cx, cy, rotate]) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx="9"
          ry="27"
          fill="currentColor"
          transform={`rotate(${rotate} ${cx} ${cy})`}
        />
      ))}
    </svg>
  );
}

function AuthField({
  id,
  name,
  label,
  type,
  autoComplete,
  placeholder,
  icon,
  labelAction,
  value,
  onChange,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  icon: "mail" | "lock" | "user";
  labelAction?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  const Icon = icon === "mail" ? Mail : icon === "lock" ? Lock : UserRound;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Label
          htmlFor={id}
          className="text-base font-medium leading-6 tracking-[0.14px] text-[#4f4539]"
        >
          {label}
        </Label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#c89b5b]"
          aria-hidden="true"
        />
        <Input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-[48px] rounded-[12px] border-[#d3c4b4] bg-[#fef9f0] pl-[45px] pr-4 text-base text-[#4f4539] shadow-none",
            "placeholder:text-[#817568] focus-visible:border-[#c89b5b] focus-visible:ring-[#c89b5b]/25",
          )}
        />
      </div>
    </div>
  );
}

function getAuthPageMessage(searchParams: URLSearchParams) {
  if (searchParams.get("error") === "callback") {
    return {
      type: "error",
      text: "We could not finish signing you in. Please try again.",
    };
  }

  if (searchParams.get("registered") === "1") {
    return {
      type: "status",
      text: "Check your email to confirm your account, then sign in.",
    };
  }

  if (searchParams.get("password_reset") === "1") {
    return {
      type: "status",
      text: "Password updated. Please sign in with your new password.",
    };
  }

  return null;
}

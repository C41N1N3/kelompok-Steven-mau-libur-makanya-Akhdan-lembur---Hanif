"use client";

import { useActionState } from "react";
import { ArrowRight, Lock } from "lucide-react";

import { updatePasswordFromReset } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type UpdatePasswordState = { error?: string };

const initialState: UpdatePasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_previousState: UpdatePasswordState, formData: FormData) => {
      return (await updatePasswordFromReset(formData)) ?? {};
    },
    initialState,
  );

  return (
    <div className="mt-8 w-full rounded-[24px] border border-[#e7d7c3] bg-white/95 p-6 shadow-[0_12px_40px_rgba(156,122,82,0.12)] backdrop-blur-[6px] sm:mt-11 sm:p-[33px]">
      <div className="mb-6">
        <h1 className="font-cinzel text-[34px] font-bold leading-tight text-[#7c571e]">
          Choose New Password
        </h1>
        <p className="mt-2 text-base leading-7 text-[#4f4539]">
          Create a new password for your GLOSIO account.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <PasswordField
          id="password"
          name="password"
          label="New Password"
          placeholder="Enter your new password"
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-password"
          name="confirm_password"
          label="Confirm Password"
          placeholder="Confirm your new password"
          autoComplete="new-password"
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
          <span>{pending ? "Saving" : "Update password"}</span>
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-base font-medium leading-6 tracking-[0.14px] text-[#4f4539]"
      >
        {label}
      </Label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#c89b5b]"
          aria-hidden="true"
        />
        <Input
          id={id}
          name={name}
          type="password"
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          minLength={8}
          className={cn(
            "h-[48px] rounded-[12px] border-[#d3c4b4] bg-[#fef9f0] pl-[45px] pr-4 text-base text-[#4f4539] shadow-none",
            "placeholder:text-[#817568] focus-visible:border-[#c89b5b] focus-visible:ring-[#c89b5b]/25",
          )}
        />
      </div>
    </div>
  );
}

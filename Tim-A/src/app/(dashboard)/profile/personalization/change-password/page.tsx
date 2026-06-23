import Link from "next/link";
import { ChevronLeft, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/server/actions/profile";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-177px)] max-w-[720px] items-center px-5 py-8 md:px-10">
      <div className="w-full rounded-[24px] border border-[#e7d7c3] bg-[#fefcfb] p-8 shadow-[0_16px_40px_rgba(79,69,57,0.16)]">
        <Button
          asChild
          variant="ghost"
          className="mb-6 size-12 rounded-full text-[#1d1c16] hover:bg-transparent"
        >
          <Link href="/profile/personalization" aria-label="Back">
            <ChevronLeft className="size-9" />
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="font-cinzel text-4xl font-bold text-[#7c571e]">
            Change Password
          </h1>
          <p className="mt-2 text-[#4f4539]">
            Confirm your account details and choose a new password.
          </p>
        </div>

        {saved ? (
          <p className="mt-6 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-700">
            Password updated.
          </p>
        ) : null}
        {error ? (
          <p className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <form action={changePassword} className="mt-8 space-y-5">
          <Field
            id="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email address"
            icon={Mail}
            type="email"
          />
          <Field
            id="old-password"
            name="old_password"
            label="Old Password"
            placeholder="Enter your old password"
            icon={Lock}
            type="password"
          />
          <Field
            id="new-password"
            name="new_password"
            label="New Password"
            placeholder="Enter your new password"
            icon={Lock}
            type="password"
          />
          <Field
            id="confirm-password"
            name="confirm_password"
            label="Confirm Password"
            placeholder="Confirm your new password"
            icon={Lock}
            type="password"
          />

          <Button
            type="submit"
            className="h-[58px] w-full rounded-[18px] bg-[#c89b5b] text-2xl font-semibold text-[#f6f1e8] shadow-[0_4px_12px_rgba(124,87,30,0.22)] hover:bg-[#b88945]"
          >
            Confirm
          </Button>
        </form>
      </div>
    </section>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  icon: Icon,
  type,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  icon: typeof Mail;
  type: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-semibold text-[#1d1c16]">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9c7a52]" />
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          className="h-12 rounded-[12px] border-[#e7d7c3] bg-[#f8f3ea] pl-12 text-base"
        />
      </div>
    </div>
  );
}

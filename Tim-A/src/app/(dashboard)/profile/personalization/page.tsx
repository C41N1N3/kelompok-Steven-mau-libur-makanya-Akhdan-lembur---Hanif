import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Languages,
  LogOut,
  Settings,
  ShieldUser,
  Type,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { createClient } from "@/lib/supabase/server";
import { updatePreferences } from "@/server/actions/profile";
import { getCurrentPreferences } from "@/server/queries/preferences";

export default async function ProfilePersonalizationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const preferences = await getCurrentPreferences();
  const { saved, error } = await searchParams;

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <section className="mx-auto max-w-[980px] px-5 py-8 md:px-10 md:py-[44px]">
      <form id="personalization-form" action={updatePreferences} />

      <div className="mb-6 grid grid-cols-[56px_1fr_auto] items-center gap-4">
        <Button
          asChild
          variant="ghost"
          className="size-12 rounded-full text-[#1d1c16] hover:bg-transparent"
        >
          <Link href="/profile" aria-label="Back to profile">
            <ChevronLeft className="size-9" />
          </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-4xl font-bold leading-tight text-black">
            Profile
          </h1>
          <p className="mt-1 text-xl text-[#4f4539]">Personalization</p>
        </div>
        <Button
          type="submit"
          form="personalization-form"
          className="h-12 rounded-[14px] border-2 border-[#c89b5b] bg-white px-6 text-lg font-bold text-[#c89b5b] shadow-none hover:bg-[#fbf6f1] hover:text-[#9c7a52]"
        >
          Save
        </Button>
      </div>

      {saved ? (
        <p className="mb-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-700">
          Personalization saved.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-7">
        <SettingsSection
          icon={Globe2}
          title="General Settings"
          description="Used for daily streak resets and reminders."
        >
          <OptionRow
            icon={Languages}
            name="primary_language"
            label="Primary Language"
            description="Choose your preferred language."
            value={preferences.primary_language}
            options={["English", "Indonesian", "Greek"]}
          />
          <OptionRow
            icon={Clock3}
            name="time_zone"
            label="Time Zone"
            description="Set your current time zone."
            value={preferences.time_zone}
            options={["Asia/Jakarta", "(GMT+02:00)", "UTC", "Europe/Athens"]}
          />
        </SettingsSection>

        <SettingsSection
          icon={Settings}
          title="Preference Settings"
          description="Preferred layout for calendar views."
        >
          <OptionRow
            icon={CalendarDays}
            name="date_format"
            label="Date Format"
            description="Choose how dates are displayed."
            value={preferences.date_format}
            options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
          />
          <OptionRow
            icon={Type}
            name="font_size"
            label="Font Size"
            description="Adjust the size of the text."
            value={String(preferences.font_size)}
            options={["10", "12", "14", "16", "18", "20", "24"]}
          />
        </SettingsSection>

      </div>

      <div className="mt-7 space-y-7">
        <SettingsSection
          icon={UserRound}
          title="Account Settings"
          description="Manage your password and sign-in session."
        >
          <Link
            href="/profile/personalization/change-password"
            className="grid min-h-[78px] grid-cols-[42px_1fr_auto] items-center gap-4 rounded-[18px] border border-[#c89b5b] bg-[#f8f3ea] px-4 shadow-[0_4px_8px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5"
          >
            <span className="flex size-[42px] items-center justify-center rounded-full bg-[#fbf5ee] text-[#1d1c16]">
              <ShieldUser className="size-6" />
            </span>
            <span>
              <span className="block text-2xl font-semibold text-[#1d1c16]">
                Change Password
              </span>
              <span className="mt-1 block text-base text-black">
                Update your account password.
              </span>
            </span>
            <ChevronRight className="size-6 text-[#4f4539]" />
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="grid min-h-[78px] w-full grid-cols-[42px_1fr_auto] items-center gap-4 rounded-[18px] border border-[#c89b5b] bg-[#f8f3ea] px-4 text-left shadow-[0_4px_8px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5"
            >
              <span className="flex size-[42px] items-center justify-center rounded-full bg-[#fbf5ee] text-red-600">
                <LogOut className="size-6" />
              </span>
              <span>
                <span className="block text-2xl font-semibold text-[#1d1c16]">
                  Log Out
                </span>
                <span className="mt-1 block text-base text-black">
                  Log out from your account.
                </span>
              </span>
              <ChevronRight className="size-6 text-[#4f4539]" />
            </button>
          </form>
        </SettingsSection>
      </div>
    </section>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Globe2;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-[#c89b5b] bg-white px-5 py-7 md:px-8">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-[68px] shrink-0 items-center justify-center rounded-full bg-[#fbf5ee] text-[#c89b5b]">
          <Icon className="size-10" />
        </span>
        <div>
          <h2 className="font-cinzel text-[32px] font-bold uppercase leading-none text-[#875c10] md:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-base text-[#4f4539]">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 space-y-5 md:pl-[50px]">{children}</div>
    </section>
  );
}

function OptionRow({
  icon: Icon,
  name,
  label,
  description,
  value,
  options,
}: {
  icon?: typeof CalendarDays;
  name: string;
  label: string;
  description: string;
  value: string;
  options: string[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_232px] md:items-center">
      <div className="flex gap-3">
        {Icon ? (
          <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fbf5ee] text-[#c89b5b]">
            <Icon className="size-6" />
          </span>
        ) : null}
        <div>
          <p className="text-2xl font-semibold leading-tight text-[#1d1c16]">
            {label}
          </p>
          <p className="mt-1 text-base text-[#4f4539]">{description}</p>
        </div>
      </div>
      <CustomSelect
        name={name}
        form="personalization-form"
        defaultValue={value}
        options={options}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown, Flame, LogOut, UserRound } from "lucide-react";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";

type Props = {
  displayName: string;
  avatarUrl: string | null;
  currentStreak: number;
  level: number;
  primaryLanguage?: string;
};

export function DashboardHeader({
  displayName,
  avatarUrl,
  currentStreak,
  level,
  primaryLanguage = "English",
}: Props) {
  const firstName = displayName.split(" ")[0] ?? displayName;
  const copy = getHeaderCopy(primaryLanguage);
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="hidden lg:block border-b border-[#e6e3e0] bg-white px-5 py-5 md:h-[177px] md:px-[51px] md:py-8">
      <div className="flex h-full w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-black md:text-[48px]">
            {copy.greeting}, {firstName}!
          </h1>
          <p className="mt-1 text-base text-black md:text-2xl">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex h-[94px] min-w-[180px] items-center justify-center gap-3 rounded-[20px] bg-white px-4 shadow-[0_4px_14px_rgba(79,69,57,0.16)]">
            <Flame className="size-11 fill-[#ff7a1a] text-[#ff7a1a]" />
            <div>
              <p className="text-[40px] leading-none text-black">
                {currentStreak}
              </p>
              <p className="mt-1 text-base leading-none text-black/50">
                day streak
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group/profile flex items-center gap-3 rounded-[18px] px-2 py-1 transition-colors duration-200 hover:bg-[#fbf6f1] focus-visible:bg-[#fbf6f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89b5b]/30 data-[state=open]:bg-[#fbf6f1]"
                aria-label="Open profile menu"
              >
                <Avatar className="size-[70px] border-2 border-[#ded9d1]">
                  <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-[#fbf6f1] text-lg font-semibold text-[#976c2f]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left text-xl leading-tight text-black sm:block">
                  <p>{firstName}</p>
                  <p>Level {level}</p>
                </div>
                <ChevronDown className="size-5 text-black transition-transform duration-200 ease-out group-hover/profile:translate-y-0.5 group-hover/profile:rotate-180 group-focus-visible/profile:translate-y-0.5 group-focus-visible/profile:rotate-180 group-data-[state=open]/profile:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              sideOffset={8}
              className="w-[230px] translate-x-[262px] p-2"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="h-12 rounded-[12px] text-lg font-semibold"
                >
                  <UserRound className="size-5" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <DropdownMenuItem asChild variant="destructive">
                  <button
                    type="submit"
                    className="h-12 w-full rounded-[12px] text-lg font-semibold text-red-600 focus:text-red-700"
                  >
                    <LogOut className="size-5 text-red-600" />
                    Log out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function getHeaderCopy(language: string): { greeting: string; subtitle: string } {
  if (language === "Indonesian") {
    return {
      greeting: "Halo",
      subtitle: "Ayo lanjutkan perjalanan bahasa Yunanamu.",
    };
  }

  if (language === "Greek") {
    return {
      greeting: "Γεια",
      subtitle: "Ας συνεχίσουμε το ταξίδι σου στα ελληνικά.",
    };
  }

  return {
    greeting: "Greetings",
    subtitle: "Let's continue your Greek journey.",
  };
}

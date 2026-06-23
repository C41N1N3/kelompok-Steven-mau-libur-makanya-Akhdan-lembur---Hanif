"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Home, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[338px] border-r border-[#e6e3e0] bg-white xl:block">
      <Link
        href="/dashboard"
        className="mx-auto mt-12 flex w-[202px] flex-col items-center gap-2"
      >
        <Image
          src="/auth/greek-temple.svg"
          alt=""
          width={202}
          height={202}
          priority
          className="h-[202px] w-[202px]"
        />
        <span className="font-lexend text-[32px] font-bold leading-none text-[#c89b5b]">
          GLOSIO
        </span>
      </Link>

      <nav className="mt-[72px] space-y-4 px-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-[68px] items-center gap-4 rounded-2xl border px-4 text-[20px] transition-colors",
              isActive(pathname, item.href)
                ? "border-[#976c2f] bg-[#976c2f] font-bold text-white shadow-[0_8px_18px_rgba(151,108,47,0.2)]"
                : "border-[#e6e3e0] bg-[#fbf6f1] text-[#1d1c16] hover:border-[#c89b5b]",
            )}
          >
            <item.icon className="size-[30px] shrink-0" strokeWidth={1.9} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

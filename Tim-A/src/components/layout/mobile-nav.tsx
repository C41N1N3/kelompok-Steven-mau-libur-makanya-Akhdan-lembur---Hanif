"use client";

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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-5 bottom-3 md:inset-x-8 md:bottom-6 z-40 grid h-[62px] md:h-[96px] grid-cols-4 rounded-[22px] md:rounded-[32px] border border-[#e6e3e0] bg-white/95 p-1.5 md:p-3 shadow-[0_10px_30px_rgba(79,69,57,0.16)] backdrop-blur xl:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex min-w-0 flex-col items-center justify-center rounded-[17px] md:rounded-[24px] text-[9px] md:text-[15px] font-semibold transition-colors",
            isActive(pathname, item.href)
              ? "bg-[#976c2f] text-white shadow-[0_8px_18px_rgba(151,108,47,0.2)] md:shadow-[0_8px_20px_rgba(151,108,47,0.3)]"
              : "text-[#4f4539] hover:bg-[#fbf6f1]",
          )}
        >
          <item.icon className="size-[18px] md:size-[32px] shrink-0" strokeWidth={1.9} />
          <span className="max-w-full truncate md:mt-1.5">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

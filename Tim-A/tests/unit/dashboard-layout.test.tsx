import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("dashboard tablet layout", () => {
  test("keeps the sidebar hidden until desktop screens", () => {
    render(
      <AppShell>
        <p>Dashboard content</p>
      </AppShell>,
    );

    expect(screen.getByRole("complementary")).toHaveClass("hidden");
    expect(screen.getByRole("complementary")).toHaveClass("xl:block");
    expect(screen.getByRole("main")).not.toHaveClass("md:ml-[250px]");
    expect(screen.getByRole("main")).toHaveClass("xl:ml-[338px]");
  });

  test("keeps the desktop sidebar width for xl screens", () => {
    render(<Sidebar />);

    expect(screen.getByRole("complementary")).toHaveClass("w-[338px]");
  });

  test("keeps bottom navigation available on tablet", () => {
    render(
      <AppShell>
        <p>Dashboard content</p>
      </AppShell>,
    );

    const bottomNav = screen
      .getAllByRole("navigation")
      .find((nav) => nav.className.includes("xl:hidden"));

    expect(bottomNav).toBeDefined();
    expect(bottomNav).not.toHaveClass("md:hidden");
  });
});

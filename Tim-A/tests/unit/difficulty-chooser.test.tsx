import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { DifficultyChooser } from "@/features/difficulty/difficulty-chooser";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("DifficultyChooser", () => {
  beforeEach(() => {
    push.mockClear();
  });

  test("opens an explanation popup from the highlighted info button", async () => {
    const user = userEvent.setup();

    render(<DifficultyChooser difficulty="standard" lessonId="lesson-1" />);

    await user.click(
      screen.getByRole("button", { name: /show learning mode differences/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /choose your learning mode/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("No timer")).toBeInTheDocument();
    expect(screen.getByText("Scores appear on leaderboard")).toBeInTheDocument();
  });

  test("keeps difficulty tabs in a fixed equal-ratio pill", () => {
    render(<DifficultyChooser difficulty="competitive" lessonId="lesson-1" />);

    const casualTab = screen.getByRole("link", { name: "Casual Mode" });
    const competitiveTab = screen.getByRole("link", { name: "Competitive" });
    const pill = casualTab.parentElement;

    expect(pill).toHaveClass("grid-cols-2");
    expect(pill).toHaveClass("lg:w-[449px]");
    expect(casualTab).toHaveClass("whitespace-nowrap");
    expect(competitiveTab).toHaveClass("whitespace-nowrap");
  });

  test("uses a minimal static info icon without pulse animation", () => {
    render(<DifficultyChooser difficulty="standard" lessonId="lesson-1" />);

    const infoButton = screen.getByRole("button", {
      name: /show learning mode differences/i,
    });

    expect(infoButton).toHaveClass("border-red-600");
    expect(infoButton).toHaveClass("bg-white");
    expect(infoButton).not.toHaveClass("shadow-[0_8px_18px_rgba(220,38,38,0.22)]");
    expect(infoButton.querySelector(".animate-ping")).not.toBeInTheDocument();
  });

  test("lets the user change difficulty from the popup", async () => {
    const user = userEvent.setup();

    render(<DifficultyChooser difficulty="standard" lessonId="lesson-1" />);

    await user.click(
      screen.getByRole("button", { name: /show learning mode differences/i }),
    );
    await user.click(screen.getByRole("button", { name: /competitive mode/i }));
    await user.click(
      screen.getByRole("button", { name: /continue with competitive mode/i }),
    );

    expect(push).toHaveBeenCalledWith(
      "/learn?difficulty=competitive&lesson=lesson-1",
    );
  });

  test("preserves active confirmation context when changing difficulty", async () => {
    const user = userEvent.setup();

    render(
      <DifficultyChooser
        difficulty="standard"
        lessonId="lesson-1"
        confirm="conversation"
        from="dashboard"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /show learning mode differences/i }),
    );
    await user.click(screen.getByRole("button", { name: /competitive mode/i }));
    await user.click(
      screen.getByRole("button", { name: /continue with competitive mode/i }),
    );

    expect(push).toHaveBeenCalledWith(
      "/learn?difficulty=competitive&lesson=lesson-1&confirm=conversation&from=dashboard",
    );
  });
});

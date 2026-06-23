import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { useSearchParams } from "next/navigation";

import { AuthForm } from "@/features/auth/auth-form";
import { signInWithPassword } from "@/features/auth/actions";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/features/auth/actions", () => ({
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
}));

describe("AuthForm", () => {
  test("keeps typed credentials visible when login fails", async () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());
    vi.mocked(signInWithPassword).mockResolvedValue({
      error: "Invalid email or password.",
    });
    const user = userEvent.setup();

    render(<AuthForm mode="login" />);

    const email = screen.getByLabelText("Email Address");
    const password = screen.getByLabelText("Password");

    await user.type(email, "michael@example.com");
    await user.type(password, "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
    expect(email).toHaveValue("michael@example.com");
    expect(password).toHaveValue("wrong-password");
  });

  test("shows a password reset success message on login", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      createReadonlySearchParams("password_reset=1"),
    );

    render(<AuthForm mode="login" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Password updated. Please sign in with your new password.",
    );
  });

  test("shows a forgot password link beside the password label on login", () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());

    render(<AuthForm mode="login" />);

    const link = screen.getByRole("link", { name: /forgot password/i });

    expect(link).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test("does not show a forgot password link on registration", () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());

    render(<AuthForm mode="register" />);

    expect(
      screen.queryByRole("link", { name: /forgot password/i }),
    ).not.toBeInTheDocument();
  });

  test("shows a username field on registration", () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());

    render(<AuthForm mode="register" />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });

  test("does not show a username field on login", () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());

    render(<AuthForm mode="login" />);

    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
  });

  test("renders grain ornaments on the login logo", () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());

    const { container } = render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("GLOSIO logo")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-auth-grain]")).toHaveLength(2);
  });

  test("renders grain ornaments on the register logo", () => {
    vi.mocked(useSearchParams).mockReturnValue(createReadonlySearchParams());

    const { container } = render(<AuthForm mode="register" />);

    expect(screen.getByLabelText("GLOSIO logo")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-auth-grain]")).toHaveLength(2);
  });
});

function createReadonlySearchParams(value = ""): ReturnType<typeof useSearchParams> {
  return new URLSearchParams(value) as unknown as ReturnType<typeof useSearchParams>;
}

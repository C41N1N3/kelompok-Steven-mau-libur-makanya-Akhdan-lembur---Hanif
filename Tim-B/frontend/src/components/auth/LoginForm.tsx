import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthTabs } from "./AuthTabs";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
    toast.success('Welcome back!');
    window.location.href = '/home';
  };

  return (
    <div className="rounded-xl shadow-2xl p-8 bg-surface">
      <AuthTabs active="login" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-foreground text-sm font-medium mb-1.5">
            Username or Email
          </label>
          <input
            id="username"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Enter your username"
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-foreground text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Enter your password"
          />
        </div>

        {/* Forgot password link */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-sm text-dimmed hover:text-primary transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="w-full bg-primary text-background font-semibold py-3 rounded-xl hover:bg-primary/80 transition-colors mt-2"
          onClick={() => window.location.href = '/home'}
        >
          Login
        </button>

        <p className="text-center text-dimmed text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </form>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
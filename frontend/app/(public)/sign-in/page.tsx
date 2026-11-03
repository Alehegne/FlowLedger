"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  function fillDemoCredentials() {
    setEmail("abebe@acme.co");
    setPassword("password");
    setErrors({});
  }

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-[0_4px_16px_0_rgb(0_0_0/0.08)] p-8">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0f766e] shrink-0">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 11V6l5-4 5 4v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" fill="white" fillOpacity="0.9" />
              <rect x="5" y="7" width="4" height="5" fill="white" fillOpacity="0.6" />
            </svg>
          </span>
          <span className="font-bold text-[#0f172a] text-lg">FlowLedger</span>
        </div>

        <h1 className="text-xl font-bold text-[#0f172a] mb-1">Sign in</h1>
        <p className="text-sm text-[#64748b] mb-6">
          Enter your credentials to access your workspace.
        </p>

        {/* Demo credentials hint */}
        <div className="mb-5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2.5 text-xs text-[#166534]">
          <div className="flex items-center justify-between">
            <span><strong>Demo account:</strong> abebe@acme.co / password</span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="ml-2 font-semibold underline text-[#0f766e] hover:text-[#115e59]"
            >
              Fill
            </button>
          </div>
        </div>

        {errors.form && (
          <div role="alert" className="mb-4 rounded-lg bg-[#fee2e2] border border-[#fecaca] px-3 py-2.5 text-sm text-[#991b1b]">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField label="Email" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              error={!!errors.email}
              placeholder="you@company.com"
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required error={errors.password}>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                error={!!errors.password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </FormField>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-[#0f766e] hover:text-[#115e59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

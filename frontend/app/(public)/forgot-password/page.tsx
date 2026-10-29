"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  }

  return (
    <div className="w-full max-w-sm">
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

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#ccfbf1] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#0f172a] mb-2">Check your email</h2>
            <p className="text-sm text-[#64748b] mb-1">
              If an account exists for <strong>{email}</strong>, password reset instructions will be sent.
            </p>
            <p className="text-xs text-[#94a3b8] mb-6">
              (Prototype: no email is actually sent.)
            </p>
            <Link href="/sign-in" className="text-sm font-medium text-[#0f766e] hover:text-[#115e59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#0f172a] mb-1">Forgot password</h1>
            <p className="text-sm text-[#64748b] mb-6">
              Enter your email address and we will send recovery instructions.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormField label="Email" htmlFor="email" required error={emailError}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  error={!!emailError}
                  placeholder="you@company.com"
                />
              </FormField>

              <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
                Send Reset Instructions
              </Button>
            </form>

            <p className="text-center text-xs text-[#64748b] mt-5">
              <Link href="/sign-in" className="text-[#0f766e] hover:text-[#115e59] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

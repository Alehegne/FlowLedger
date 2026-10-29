"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { ArrowLeftIcon } from "@/components/ui/Icons";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("Abebe Girma");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
      >
        <ArrowLeftIcon size={16} aria-hidden />
        Back to Settings
      </Link>

      <PageHeader
        title="Profile"
        description="Edit your personal display information."
      />

      <form onSubmit={handleSave} className="flex flex-col gap-6" noValidate>
        <Card className="flex flex-col gap-4">
          <FormField label="Display Name" htmlFor="name" required>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              required
            />
          </FormField>

          {/* Email is read-only in the prototype */}
          <FormField label="Email Address" htmlFor="email" hint="Email cannot be changed in the prototype.">
            <Input
              id="email"
              type="email"
              defaultValue="abebe@acme.co"
              readOnly
              className="opacity-60 cursor-not-allowed"
            />
          </FormField>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
          {saved && (
            <p role="status" className="text-sm text-[#166534]">
              Changes saved.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

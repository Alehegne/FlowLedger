"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Input";
import { ArrowLeftIcon } from "@/components/ui/Icons";

export default function OrganizationSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        title="Organization"
        description="View and update your workspace settings."
      />

      <form onSubmit={handleSave} className="flex flex-col gap-6" noValidate>
        <Card className="flex flex-col gap-4">
          <FormField label="Organization Name" htmlFor="orgName" required>
            <Input id="orgName" defaultValue="Acme Trading Co." required />
          </FormField>

          <FormField
            label="Default Currency"
            htmlFor="currency"
            hint="Used as the default for new invoices."
          >
            <Select id="currency" defaultValue="ETB">
              <option value="ETB">ETB — Ethiopian Birr</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
            </Select>
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

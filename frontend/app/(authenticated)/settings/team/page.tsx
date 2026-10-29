import Link from "next/link";
import { MOCK_TEAM_MEMBERS } from "@/lib/mock/fixtures";
import { PageHeader, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, PlusIcon } from "@/components/ui/Icons";

export const metadata = { title: "Team — FlowLedger" };

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  FINANCE: "Finance",
  APPROVER: "Approver",
  VIEWER: "Viewer",
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "text-[#166534] bg-[#dcfce7]",
  INVITED: "text-[#92400e] bg-[#fef3c7]",
  SUSPENDED: "text-[#991b1b] bg-[#fee2e2]",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INVITED: "Invited",
  SUSPENDED: "Suspended",
};

export default function TeamPage() {
  const members = MOCK_TEAM_MEMBERS;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded w-fit"
      >
        <ArrowLeftIcon size={16} aria-hidden />
        Back to Settings
      </Link>

      <PageHeader
        title="Team"
        description={`${members.length} member${members.length === 1 ? "" : "s"} in your organization.`}
        action={
          <Button variant="primary" size="md" disabled title="Invite functionality coming in a future phase">
            <PlusIcon size={16} aria-hidden />
            Invite Member
          </Button>
        }
      />

      <div
        role="note"
        className="rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-3 text-sm text-[#475569]"
      >
        <strong className="text-[#0f172a]">Prototype:</strong> Team invite and
        role-change functionality will be implemented in a later phase.
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
        <table className="w-full text-sm" aria-label="Team members">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Email</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Role</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[#475569] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold shrink-0">
                      {(member.name ?? member.email).charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-[#0f172a]">
                      {member.name ?? <span className="text-[#94a3b8] italic">No name</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#475569]">{member.email}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#0f172a]">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[member.status] ?? "text-[#475569] bg-[#f1f5f9]"}`}>
                    {STATUS_LABELS[member.status] ?? member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="sm:hidden flex flex-col gap-3" role="list">
        {members.map((member) => (
          <li key={member.id}>
            <Card>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f1f5f9] text-[#475569] font-semibold shrink-0">
                  {(member.name ?? member.email).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#0f172a] truncate">
                    {member.name ?? <span className="text-[#94a3b8] italic">No name</span>}
                  </p>
                  <p className="text-xs text-[#64748b] truncate">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f1f5f9]">
                <span className="text-xs text-[#475569]">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[member.status] ?? "text-[#475569] bg-[#f1f5f9]"}`}>
                  {STATUS_LABELS[member.status] ?? member.status}
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

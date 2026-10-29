import Link from "next/link";
import { PageHeader, Card } from "@/components/ui/Card";
import { UserIcon, BuildingIcon, TeamIcon, ChevronRightIcon } from "@/components/ui/Icons";

export const metadata = { title: "Settings — FlowLedger" };

const SETTINGS_SECTIONS = [
  {
    href: "/settings/profile",
    icon: <UserIcon size={20} />,
    title: "Profile",
    description: "Edit your display name and personal information.",
  },
  {
    href: "/settings/organization",
    icon: <BuildingIcon size={20} />,
    title: "Organization",
    description: "View and update your workspace name and preferences.",
  },
  {
    href: "/settings/team",
    icon: <TeamIcon size={20} />,
    title: "Team",
    description: "Manage team members, roles and pending invitations.",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account, organization and team."
      />

      <ul className="flex flex-col gap-3" role="list">
        {SETTINGS_SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] rounded-xl"
            >
              <Card className="group-hover:border-[#0f766e] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#0f766e]">
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0f172a] group-hover:text-[#0f766e] transition-colors">
                      {section.title}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRightIcon
                    size={16}
                    className="text-[#94a3b8] shrink-0"
                    aria-hidden
                  />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

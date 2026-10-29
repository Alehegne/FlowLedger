import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="text-center flex flex-col items-center gap-4 max-w-md">
        <div className="w-14 h-14 rounded-full bg-[#f1f5f9] flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Page not found</h1>
          <p className="mt-2 text-sm text-[#64748b]">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

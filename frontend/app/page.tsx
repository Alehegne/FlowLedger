import { redirect } from "next/navigation";

/**
 * Root route — redirect to the dashboard for authenticated users.
 * A real implementation would check session state server-side before redirecting.
 */
export default function RootPage() {
  redirect("/dashboard");
}

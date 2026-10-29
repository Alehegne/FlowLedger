/**
 * Public layout — used for sign-in, forgot-password, etc.
 * No sidebar or authenticated shell.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      {children}
    </div>
  );
}

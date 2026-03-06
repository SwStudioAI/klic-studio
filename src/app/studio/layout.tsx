import { AuthGuard } from "@/components/studio/auth-guard";
import { Sidebar } from "@/components/studio/sidebar";

export const metadata = {
  title: "kLic Studio",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}

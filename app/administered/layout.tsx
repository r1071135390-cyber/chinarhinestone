import type { Metadata } from "next";
import { AdminGuard } from "@/lib/admin-auth";

// Internal portal — keep it out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}

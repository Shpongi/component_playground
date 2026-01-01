"use client";

import AdminNav from "./_components/AdminNav";
import { AdminDataProvider } from "./_components/AdminDataProvider";
import { AuthProvider } from "./_components/AuthProvider";
import { usePathname } from "next/navigation";

function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminDataProvider>
      <div className="min-h-screen flex flex-col">
        <AdminNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {children}
        </main>
      </div>
    </AdminDataProvider>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <AdminContent>{children}</AdminContent>
    </AuthProvider>
  );
}



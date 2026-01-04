"use client";

import AdminNav from "./_components/AdminNav";
import { AdminDataProvider } from "./_components/AdminDataProvider";
import { AuthProvider } from "./_components/AuthProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always provide AdminDataProvider to prevent "must be used within" errors
  // But conditionally show nav and layout structure
  const isLoginPage = mounted && pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <AdminDataProvider>
        {children}
      </AdminDataProvider>
    );
  }

  return (
    <AdminDataProvider>
      <div className="min-h-screen flex flex-col">
        {mounted && <AdminNav />}
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



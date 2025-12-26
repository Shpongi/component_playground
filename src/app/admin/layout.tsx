import AdminNav from "./_components/AdminNav";
import { AdminDataProvider } from "./_components/AdminDataProvider";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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



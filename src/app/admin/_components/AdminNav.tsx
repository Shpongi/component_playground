"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

  const links = [
    { href: "/admin/catalogs", label: "Catalogs" },
    { href: "/admin/tenants", label: "Tenants" },
    { href: "/admin/stores", label: "Stores" },
    { href: "/admin/master-combos", label: "Default Combos" },
  ];

export default function AdminNav() {
	const pathname = usePathname();
	const { logout } = useAuth();
	
	return (
		<nav className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
			<div className="p-4 border-b border-gray-200">
				<h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
			</div>
			<ul className="flex-1 p-4 space-y-1">
				{links.map(({ href, label }) => {
					const isActive = pathname === href;
					return (
						<li key={href}>
							<Link
								href={href}
								className={[
									"flex items-center h-10 px-4 rounded-md text-sm font-medium transition-colors",
									"hover:bg-gray-100",
									isActive
										? "bg-gray-200 text-gray-900"
										: "text-gray-700",
								].join(" ")}
							>
								{label}
							</Link>
						</li>
					);
				})}
			</ul>
			<div className="p-4 border-t border-gray-200">
				<button
					onClick={logout}
					className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
				>
					Logout
				</button>
			</div>
		</nav>
	);
}

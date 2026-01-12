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
		<nav className="border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-10">
			<div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
				<ul className="flex gap-2">
				{links.map(({ href, label }) => {
					const isActive = pathname === href;
					return (
						<li key={href}>
							<Link
								href={href}
								className={[
									"inline-flex items-center h-10 px-4 rounded-md text-sm font-medium transition-colors",
									"hover:bg-gray-100",
									isActive
										? "bg-gray-200"
										: "bg-transparent",
								].join(" ")}
							>
								{label}
							</Link>
						</li>
					);
				})}
			</ul>
				<button
					onClick={logout}
					className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
				>
					Logout
				</button>
			</div>
		</nav>
	);
}

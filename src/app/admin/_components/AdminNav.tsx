"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

  const links = [
    { href: "/admin/catalogs", label: "Catalogs" },
    { href: "/admin/tenants", label: "Tenants" },
    { href: "/admin/stores", label: "Stores" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/redemption", label: "Redemption" },
    { href: "/admin/master-combos", label: "Master Combos" },
  ];

export default function AdminNav() {
	const pathname = usePathname();
	return (
		<nav className="border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-10">
			<ul className="container mx-auto flex gap-2 px-4 sm:px-6 lg:px-8">
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
		</nav>
	);
}

"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import Link from "next/link";

export default function RedemptionPage() {
  const { swapLists, tenants, deleteSwapList, getTenantsUsingSwapList } = useAdminData();
  const [filterTenant, setFilterTenant] = useState<string>("");
  const [filterCurrency, setFilterCurrency] = useState<string>("");

  const tenantsById = useMemo(() => {
    return Object.fromEntries(tenants.map(t => [t.id, t]));
  }, [tenants]);

  const filteredLists = useMemo(() => {
    return swapLists.filter(list => {
      if (filterTenant && list.tenantId !== filterTenant) return false;
      if (filterCurrency && list.baseCurrency !== filterCurrency) return false;
      return true;
    });
  }, [swapLists, filterTenant, filterCurrency]);

  const uniqueCurrencies = useMemo(() => {
    return Array.from(new Set(swapLists.map(list => list.baseCurrency))).sort();
  }, [swapLists]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Redemption Lists</h1>
            <p className="text-sm text-gray-600">
              Manage restricted product swap lists for tenants.
            </p>
          </div>
          <Link
            href="/admin/redemption/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create New Redemption List
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Tenant
          </label>
          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Tenants</option>
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Currency
          </label>
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Currencies</option>
            {uniqueCurrencies.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                List Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenants Using
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Modified
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLists.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  No redemption lists found. Create your first list to get started.
                </td>
              </tr>
            ) : (
              filteredLists.map((list) => {
                const tenant = tenantsById[list.tenantId];
                const tenantsUsing = getTenantsUsingSwapList(list.id);
                return (
                  <tr
                    key={list.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      window.location.href = `/admin/redemption/${list.id}`;
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{list.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant?.name || "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{list.baseCurrency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          list.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {list.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {tenantsUsing.length === 0 ? (
                          <span className="text-gray-400 italic">No tenants</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {tenantsUsing.slice(0, 3).map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                              >
                                {t.name}
                              </span>
                            ))}
                            {tenantsUsing.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                                +{tenantsUsing.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {tenantsUsing.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {tenantsUsing.length} tenant{tenantsUsing.length !== 1 ? 's' : ''} using this catalog
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {list.dateModified.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSwapList(list.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}


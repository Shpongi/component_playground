"use client";

import { useMemo, useState, useEffect } from "react";
import { useAdminData } from "../../_components/AdminDataProvider";
import { useParams, useRouter } from "next/navigation";
import type { SwapListStatus, Currency, Product } from "../../_components/AdminDataProvider";

export default function RedemptionListEditPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.list_id as string;
  const isNew = listId === "new";

  const {
    getSwapList,
    createSwapList,
    updateSwapList,
    tenants,
    categories,
    getFilteredProductsForSwapList,
    stores,
    productSwapEligibility,
    getTenantsUsingSwapList,
    addTenantToSwapList,
    removeTenantFromSwapList,
  } = useAdminData();

  const existingList = isNew ? null : getSwapList(listId);

  const [formData, setFormData] = useState({
    name: "",
    tenantId: "",
    baseCurrency: "USD" as Currency,
    allowedCategories: [] as string[],
    applyAlcoholExclusion: true,
    applyLowMarginExclusion: true,
    applyComboProductExclusion: true,
    status: "DRAFT" as SwapListStatus,
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [tenantsModalOpen, setTenantsModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedTenantToAdd, setSelectedTenantToAdd] = useState<string>("");

  useEffect(() => {
    if (existingList) {
      setFormData({
        name: existingList.name,
        tenantId: existingList.tenantId,
        baseCurrency: existingList.baseCurrency,
        allowedCategories: existingList.allowedCategories,
        applyAlcoholExclusion: existingList.applyAlcoholExclusion,
        applyLowMarginExclusion: existingList.applyLowMarginExclusion,
        applyComboProductExclusion: existingList.applyComboProductExclusion,
        status: existingList.status,
      });
    }
  }, [existingList]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    const search = categorySearch.toLowerCase();
    return categories.filter(cat => cat.name.toLowerCase().includes(search));
  }, [categories, categorySearch]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.tenantId) {
      alert("Please fill in all required fields");
      return;
    }

    if (isNew) {
      const newId = createSwapList({
        name: formData.name,
        tenantId: formData.tenantId,
        baseCurrency: formData.baseCurrency,
        allowedCategories: formData.allowedCategories,
        applyAlcoholExclusion: formData.applyAlcoholExclusion,
        applyLowMarginExclusion: formData.applyLowMarginExclusion,
        applyComboProductExclusion: formData.applyComboProductExclusion,
        status: formData.status,
      });
      router.push(`/admin/redemption/${newId}`);
    } else {
      updateSwapList(listId, {
        name: formData.name,
        tenantId: formData.tenantId,
        baseCurrency: formData.baseCurrency,
        allowedCategories: formData.allowedCategories,
        applyAlcoholExclusion: formData.applyAlcoholExclusion,
        applyLowMarginExclusion: formData.applyLowMarginExclusion,
        applyComboProductExclusion: formData.applyComboProductExclusion,
        status: formData.status,
      });
      alert("Redemption list updated successfully!");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(categoryId)
        ? prev.allowedCategories.filter(id => id !== categoryId)
        : [...prev.allowedCategories, categoryId],
    }));
  };

  const selectedTenant = tenants.find(t => t.id === formData.tenantId);
  const previewProducts = useMemo(() => {
    // For preview, we need to filter products based on current form data
    // This works for both new and existing lists
    
    // Get all products from all stores
    const allProducts: Product[] = [];
    stores.forEach(store => {
      store.products.forEach(product => {
        const eligibility = productSwapEligibility[product.id] || {};
        allProducts.push({
          ...product,
          comboProduct: eligibility.comboProduct,
          containsAlcohol: eligibility.containsAlcohol,
          lowMargin: eligibility.lowMargin,
          category: product.category || "cat-1",
        });
      });
    });

    // Apply filters based on form data
    return allProducts.filter(product => {
      // Category filter
      if (formData.allowedCategories.length > 0) {
        if (!product.category || !formData.allowedCategories.includes(product.category)) {
          return false;
        }
      }

      // Alcohol exclusion
      if (formData.applyAlcoholExclusion && product.containsAlcohol) {
        return false;
      }

      // Low margin exclusion
      if (formData.applyLowMarginExclusion && product.lowMargin) {
        return false;
      }

      // Combo product exclusion
      if (formData.applyComboProductExclusion && product.comboProduct) {
        return false;
      }

      return true;
    });
  }, [formData, stores, productSwapEligibility]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "Create Redemption List" : "Edit Redemption List"}
        </h1>
        <p className="text-sm text-gray-600">
          Define the specific rules and categories allowed for a restricted swap.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Main Configuration Area (Left ~70%) */}
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sports Only - Acme Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tenantId}
                  onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="">Select a tenant...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.baseCurrency}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseCurrency: e.target.value as Currency }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Allowed Categories */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-2">Allowed Categories</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the only categories recipients can swap into.
            </p>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
              {filteredCategories.map(category => {
                const isSelected = formData.allowedCategories.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategory(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                );
              })}
            </div>
            {filteredCategories.length === 0 && (
              <p className="text-sm text-gray-500 italic">No categories found matching your search.</p>
            )}
          </div>

          {/* Section 3: Global Exclusions & Restrictions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Global Exclusions & Restrictions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Apply Alcohol Exclusion Rule?
                  </label>
                  <p className="text-xs text-gray-500">
                    Hides any product globally tagged Contains Alcohol
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.applyAlcoholExclusion}
                    onChange={(e) => setFormData(prev => ({ ...prev, applyAlcoholExclusion: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Apply Low Margin Exclusion Rule?
                  </label>
                  <p className="text-xs text-gray-500">
                    Hides any product globally tagged Low Margin
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.applyLowMarginExclusion}
                    onChange={(e) => setFormData(prev => ({ ...prev, applyLowMarginExclusion: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Apply Combo Product Exclusion?
                  </label>
                  <p className="text-xs text-gray-500">
                    Hides products globally tagged Combo Product
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.applyComboProductExclusion}
                    onChange={(e) => setFormData(prev => ({ ...prev, applyComboProductExclusion: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Tenant Management */}
          {!isNew && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Tenant Management</h2>
              <p className="text-sm text-gray-600 mb-4">
                Manage which tenants are using this redemption catalog.
              </p>

              {/* Current Tenants */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Current Tenants ({getTenantsUsingSwapList(listId).length})
                </h3>
                {getTenantsUsingSwapList(listId).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No tenants using this catalog</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                    {getTenantsUsingSwapList(listId).map((tenant) => (
                      <div
                        key={tenant.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-xs text-gray-500">Country: {tenant.country}</div>
                        </div>
                        <button
                          onClick={() => {
                            removeTenantFromSwapList(listId, tenant.id);
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Tenant */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add Tenant</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedTenantToAdd}
                    onChange={(e) => setSelectedTenantToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select a tenant...</option>
                    {tenants
                      .filter(tenant => !getTenantsUsingSwapList(listId).some(t => t.id === tenant.id))
                      .map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.country})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedTenantToAdd) {
                        addTenantToSwapList(listId, selectedTenantToAdd);
                        setSelectedTenantToAdd("");
                      }
                    }}
                    disabled={!selectedTenantToAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {tenants.filter(tenant => !getTenantsUsingSwapList(listId).some(t => t.id === tenant.id)).length === 0 && (
                  <p className="text-xs text-gray-500 mt-2 italic">All tenants are already using this catalog</p>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              {isNew ? "Create List" : "Save Changes"}
            </button>
            <button
              onClick={() => router.push("/admin/redemption")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Sidebar: Summary & Preview (~30%) */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Summary & Preview</h2>

            {/* Status Badge */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SwapListStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>

            {/* Summary Details */}
            <div className="space-y-3 mb-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Tenant:</span>
                <p className="text-sm text-gray-900">
                  {selectedTenant?.name || "Not selected"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Currency:</span>
                <p className="text-sm text-gray-900">{formData.baseCurrency}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Allowed Categories:</span>
                <p className="text-sm text-gray-900">
                  {formData.allowedCategories.length === 0
                    ? "None selected"
                    : `${formData.allowedCategories.length} selected`}
                </p>
              </div>
            </div>

            {/* Tenants Using This Catalog */}
            {!isNew && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Tenants Using:</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {getTenantsUsingSwapList(listId).length}
                  </span>
                </div>
                {getTenantsUsingSwapList(listId).length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {getTenantsUsingSwapList(listId).slice(0, 3).map((tenant) => (
                        <span
                          key={tenant.id}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                        >
                          {tenant.name}
                        </span>
                      ))}
                      {getTenantsUsingSwapList(listId).length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                          +{getTenantsUsingSwapList(listId).length - 3} more
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setTenantsModalOpen(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View all tenants
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 italic">No tenants using this catalog yet</p>
                )}
              </div>
            )}

            {/* Preview Button */}
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Preview Resulting Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview Resulting Catalog</h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Products that match all currently selected rules:
              </p>
              {previewProducts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No products match the current filters.</p>
              ) : (
                <div className="space-y-2">
                  {previewProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border border-gray-200 rounded-md text-sm"
                    >
                      <div className="font-medium">{product.name}</div>
                      {product.sku && (
                        <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenants Using Modal */}
      {tenantsModalOpen && !isNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tenants Using This Redemption Catalog</h3>
              <button
                onClick={() => setTenantsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {getTenantsUsingSwapList(listId).length === 0 ? (
                <p className="text-sm text-gray-500 italic">No tenants are currently using this redemption catalog.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    {getTenantsUsingSwapList(listId).length} tenant{getTenantsUsingSwapList(listId).length !== 1 ? 's' : ''} using this catalog:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {getTenantsUsingSwapList(listId).map((tenant) => (
                      <div
                        key={tenant.id}
                        className="p-3 border border-gray-200 rounded-md flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-sm text-gray-900">{tenant.name}</div>
                          <div className="text-xs text-gray-500">Country: {tenant.country}</div>
                        </div>
                        <button
                          onClick={() => {
                            removeTenantFromSwapList(listId, tenant.id);
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


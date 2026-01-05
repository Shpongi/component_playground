"use client";

import { useMemo, useState, useEffect } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import type { Fee, FeeType, Catalog, Store, Tenant } from "../_components/AdminDataProvider";

// Tenant-Catalog Features Section Component
function TenantCatalogFeaturesSection({ tenant, catalogId, stores }: { tenant: Tenant; catalogId: string; stores: Store[] }) {
  const {
    tenantCatalogFeatureFlags,
    setTenantCatalogFeatureFlag,
    setTenantCatalogStoreDiscount,
    tenantCatalogStoreDiscounts,
    setTenantCatalogStoreVisibility,
    tenantCatalogHiddenStores,
    updateTenantCatalogStoreOrder,
    tenantCatalogStoreOrder,
    getEffectiveCatalogForTenant
  } = useAdminData();
  
  const flags = tenantCatalogFeatureFlags[tenant.id]?.[catalogId] || {};
  const hasAnyFeature = flags.discounts || flags.visibility || flags.order;
  
  return (
    <div className="bg-white rounded border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm text-gray-800">{tenant.name}</div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.discounts || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'discounts', e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-xs text-gray-600">Discounts</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.visibility || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'visibility', e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-xs text-gray-600">Visibility</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.order || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'order', e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-xs text-gray-600">Order</span>
          </label>
        </div>
      </div>
      
      {!hasAnyFeature && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border border-gray-200">
          Enable features above to customize this tenant's catalog settings.
        </div>
      )}
      
      {flags.discounts && (
        <TenantCatalogDiscountsSection tenant={tenant} catalogId={catalogId} stores={stores} />
      )}
      
      {flags.visibility && (
        <TenantCatalogVisibilitySection tenant={tenant} catalogId={catalogId} stores={stores} />
      )}
      
      {flags.order && (
        <TenantCatalogOrderSection tenant={tenant} catalogId={catalogId} />
      )}
    </div>
  );
}

function TenantCatalogDiscountsSection({ tenant, catalogId, stores }: { tenant: Tenant; catalogId: string; stores: Store[] }) {
  const { tenantCatalogStoreDiscounts, setTenantCatalogStoreDiscount } = useAdminData();
  const catalogDiscounts = tenantCatalogStoreDiscounts[tenant.id]?.[catalogId] || {};
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const tenantStores = stores.filter(s => s.country === tenant.country);
  const hasDiscounts = Object.keys(catalogDiscounts).length > 0;
  const storesWithDiscounts = Object.keys(catalogDiscounts);
  const availableStores = tenantStores
    .filter(s => !catalogDiscounts[s.name] || catalogDiscounts[s.name] === 0)
    .filter(s => searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  return (
    <div className="expandable-section mt-2">
      <button onClick={() => setExpanded(!expanded)} className="expandable-header">
        <span>Store Discounts</span>
        {hasDiscounts && <span className="badge badge-primary text-[10px]">{storesWithDiscounts.length}</span>}
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="expandable-content">
          {storesWithDiscounts.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Stores with Discounts ({storesWithDiscounts.length})</div>
              <div className="space-y-2">
                {storesWithDiscounts.map(storeName => (
                  <div key={storeName} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-xs text-gray-700 flex-1">{storeName}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={catalogDiscounts[storeName]}
                      onChange={(e) => setTenantCatalogStoreDiscount(tenant.id, catalogId, storeName, parseInt(e.target.value || '0', 10))}
                      className="input-sm w-20 h-7"
                    />
                    <span className="text-xs text-gray-500">%</span>
                    <button
                      onClick={() => setTenantCatalogStoreDiscount(tenant.id, catalogId, storeName, 0)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Add Discount to Store</div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores..."
              className="input input-sm mb-2"
            />
            {searchQuery && availableStores.length > 0 && (
              <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white">
                {availableStores.map(store => (
                  <button
                    key={store.name}
                    onClick={() => {
                      setTenantCatalogStoreDiscount(tenant.id, catalogId, store.name, 5);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TenantCatalogVisibilitySection({ tenant, catalogId, stores }: { tenant: Tenant; catalogId: string; stores: Store[] }) {
  const { tenantCatalogHiddenStores, setTenantCatalogStoreVisibility } = useAdminData();
  const hiddenStores = tenantCatalogHiddenStores[tenant.id]?.[catalogId] || new Set<string>();
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const tenantStores = stores.filter(s => s.country === tenant.country);
  const hiddenStoresList = Array.from(hiddenStores);
  const availableStores = tenantStores
    .filter(s => !hiddenStores.has(s.name))
    .filter(s => searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  return (
    <div className="expandable-section mt-2">
      <button onClick={() => setExpanded(!expanded)} className="expandable-header">
        <span>Store Visibility</span>
        {hiddenStores.size > 0 && <span className="badge badge-danger text-[10px]">{hiddenStores.size} hidden</span>}
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="expandable-content">
          {hiddenStoresList.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Hidden Stores ({hiddenStoresList.length})</div>
              <div className="flex flex-wrap gap-2">
                {hiddenStoresList.map(storeName => (
                  <div key={storeName} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md">
                    <span className="text-xs text-gray-700">{storeName}</span>
                    <button
                      onClick={() => setTenantCatalogStoreVisibility(tenant.id, catalogId, storeName, false)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Add Store to Hide</div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores..."
              className="input input-sm mb-2"
            />
            {searchQuery && availableStores.length > 0 && (
              <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white">
                {availableStores.map(store => (
                  <button
                    key={store.name}
                    onClick={() => {
                      setTenantCatalogStoreVisibility(tenant.id, catalogId, store.name, true);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TenantCatalogOrderSection({ tenant, catalogId }: { tenant: Tenant; catalogId: string }) {
  const { getEffectiveCatalogForTenant, updateTenantCatalogStoreOrder, tenantCatalogStoreOrder } = useAdminData();
  const [expanded, setExpanded] = useState(false);
  const customOrder = tenantCatalogStoreOrder[tenant.id]?.[catalogId];
  const hasCustomOrder = customOrder && customOrder.length > 0;
  
  const effectiveCatalog = getEffectiveCatalogForTenant(tenant.id, catalogId);
  const currentStoreOrder = effectiveCatalog.stores.map(s => s.name);
  
  const handleMoveStore = (storeName: string, direction: 'up' | 'down') => {
    const order = hasCustomOrder ? [...customOrder] : [...currentStoreOrder];
    const index = order.indexOf(storeName);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    updateTenantCatalogStoreOrder(tenant.id, catalogId, order);
  };
  
  const handleResetOrder = () => {
    updateTenantCatalogStoreOrder(tenant.id, catalogId, []);
  };
  
  return (
    <div className="expandable-section mt-2">
      <button onClick={() => setExpanded(!expanded)} className="expandable-header">
        <span>Store Order</span>
        {hasCustomOrder && <span className="badge badge-primary text-[10px]">Custom</span>}
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="expandable-content">
          {hasCustomOrder && (
            <button onClick={handleResetOrder} className="btn btn-secondary btn-xs mb-2">
              Reset to Default Order
            </button>
          )}
          <div className="space-y-1 border border-gray-200 rounded-md p-2 bg-gray-50">
            {currentStoreOrder.map((storeName, index) => (
              <div key={storeName} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                <div className="flex-1 text-xs text-gray-700">{storeName}</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveStore(storeName, 'up')}
                    disabled={index === 0}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveStore(storeName, 'down')}
                    disabled={index === currentStoreOrder.length - 1}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogsPage() {
  const { 
    catalogs, 
    stores, 
    getActiveStores,
    combos, 
    masterCombos,
    getMasterCombo,
    removeStoreFromCatalog, 
    setStoreDiscount, 
    setStoreCSS, 
    setStoreFee, 
    setCatalogFee, 
    moveStoreInCatalog, 
    getEffectiveCatalog, 
    getTenantsForCatalog, 
    tenants,
    setTenantCatalogStoreDiscount,
    tenantCatalogStoreDiscounts,
    setTenantCatalogStoreVisibility,
    tenantCatalogHiddenStores,
    updateTenantCatalogStoreOrder,
    tenantCatalogStoreOrder,
    tenantCatalogFeatureFlags,
    setTenantCatalogFeatureFlag,
    getEffectiveCatalogForTenant
  } = useAdminData();
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [storeSettingsOpen, setStoreSettingsOpen] = useState<Record<string, boolean>>({});
  const [selectedTenantToAddFeature, setSelectedTenantToAddFeature] = useState<Record<string, string>>({});
  const [expandedCatalogs, setExpandedCatalogs] = useState<Record<string, boolean>>({});

  const toggleCatalogExpansion = (catalogId: string) => {
    setExpandedCatalogs(prev => ({
      ...prev,
      [catalogId]: !prev[catalogId]
    }));
  };

  const settingsKey = (catalogId: string, storeName: string) => `${catalogId}::${storeName}`;

  // Get all catalogs (no branches)
  const catalogList = useMemo(() => {
    return catalogs.filter(c => !c.isBranch);
  }, [catalogs]);

  // Initialize expandedCatalogs: USD catalogs open by default, others closed
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    catalogList.forEach(catalog => {
      initialExpanded[catalog.id] = catalog.currency === "USD";
    });
    setExpandedCatalogs(prev => {
      // Only set initial state if not already set (preserve user interactions)
      const hasAnyExpanded = Object.keys(prev).length > 0;
      return hasAnyExpanded ? prev : initialExpanded;
    });
  }, [catalogList]);

  // Memoize effective catalogs for all catalogs to avoid calling hooks in render
  const effectiveCatalogs = useMemo(() => {
    const map: Record<string, ReturnType<typeof getEffectiveCatalog>> = {};
    catalogs.forEach(catalog => {
      map[catalog.id] = getEffectiveCatalog(catalog.id);
    });
    return map;
  }, [catalogs, getEffectiveCatalog]);


  const toggleStoresExpansion = (catalogId: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [catalogId]: !prev[catalogId]
    }));
  };

  const getCurrencySymbol = (currency: string) => {
    if (currency === "USD") return "$";
    if (currency === "CAD") return "C$";
    if (currency === "GBP") return "£";
    return currency;
  };


  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Catalogs</h1>
            <p className="text-sm text-gray-600">
              Manage catalog store assignments.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {catalogList.length} catalogs
          </div>
        </div>
      </header>
      
      {/* Catalog Tree View */}
      <div className="space-y-4">
        {catalogList.map((catalog) => {
          const effectiveCatalog = getEffectiveCatalog(catalog.id);
          const isCatalogExpanded = expandedCatalogs[catalog.id] === true; // USD expanded by default, others closed
          
          return (
            <div key={catalog.id} className="border border-gray-200 rounded-lg bg-white">
              {/* Catalog Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCatalogExpansion(catalog.id)}
                      className="text-gray-500 hover:text-gray-700"
                      title={isCatalogExpanded ? "Minimize catalog" : "Maximize catalog"}
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform ${isCatalogExpanded ? '' : 'rotate-180'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{catalog.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {effectiveCatalog.stores.length} stores
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                        {getTenantsForCatalog(catalog.id).length} tenants
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Catalog Content - Only show when expanded */}
                {isCatalogExpanded && (
                  <>
                    {/* Catalog-level Fee */}
                    {effectiveCatalog.catalogFee ? (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catalog-Level Fee</label>
                        <div className="flex items-center gap-3">
                          <select
                            value={effectiveCatalog.catalogFee.type}
                            onChange={(e) => {
                              setCatalogFee(catalog.id, {
                                type: e.target.value as FeeType,
                                value: effectiveCatalog.catalogFee?.value || 0
                              });
                            }}
                            className="text-sm border border-gray-300 rounded px-3 py-2 bg-white"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                          <input
                            type="number"
                            min={0}
                            step={effectiveCatalog.catalogFee.type === 'percentage' ? 0.1 : 1}
                            value={effectiveCatalog.catalogFee.value}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value === 0) {
                                setCatalogFee(catalog.id, null);
                              } else {
                                setCatalogFee(catalog.id, { type: effectiveCatalog.catalogFee!.type, value });
                              }
                            }}
                            className="w-32 text-sm border border-gray-300 rounded px-3 py-2"
                          />
                          <span className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded font-medium text-sm">
                            {effectiveCatalog.catalogFee.type === 'percentage' 
                              ? `+${effectiveCatalog.catalogFee.value}%` 
                              : `+${effectiveCatalog.catalogFee.value} ${effectiveCatalog.currency}`}
                          </span>
                          <button
                            onClick={() => setCatalogFee(catalog.id, null)}
                            className="ml-auto px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            Remove Fee
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <button
                          onClick={() => setCatalogFee(catalog.id, { type: 'percentage', value: 5 })}
                          className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200"
                        >
                          + Add Catalog-Level Fee
                        </button>
                      </div>
                    )}

                {/* Tenant-Specific Features Section */}
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-800">Tenant-Specific Features</h4>
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    Configure discounts, visibility, and store order for specific tenants using this catalog.
                  </div>
                  
                  {/* Add Tenant to Features */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Add Tenant</div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTenantToAddFeature[catalog.id] || ""}
                        onChange={(e) => setSelectedTenantToAddFeature(prev => ({ ...prev, [catalog.id]: e.target.value }))}
                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="">Select tenant...</option>
                        {tenants
                          .filter(tenant => tenant.country === catalog.country)
                          .filter(tenant => {
                            // Only show tenants that don't already have features enabled
                            const flags = tenantCatalogFeatureFlags[tenant.id]?.[catalog.id];
                            return !flags || (!flags.discounts && !flags.visibility && !flags.order);
                          })
                          .map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name} ({tenant.country})
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => {
                          const tenantId = selectedTenantToAddFeature[catalog.id];
                          if (tenantId) {
                            // Enable discounts feature by default when adding tenant
                            setTenantCatalogFeatureFlag(tenantId, catalog.id, 'discounts', true);
                            setSelectedTenantToAddFeature(prev => ({ ...prev, [catalog.id]: "" }));
                          }
                        }}
                        disabled={!selectedTenantToAddFeature[catalog.id]}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {/* Tenants with Features Enabled */}
                  {(() => {
                    const tenantsWithFeatures = getTenantsForCatalog(catalog.id).filter(tenant => {
                      const flags = tenantCatalogFeatureFlags[tenant.id]?.[catalog.id];
                      return flags && (flags.discounts || flags.visibility || flags.order);
                    });
                    
                    if (tenantsWithFeatures.length === 0) {
                      return (
                        <div className="text-xs text-gray-500 p-2 bg-white rounded border border-gray-200">
                          No tenants with features enabled. Add a tenant above to configure features.
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {tenantsWithFeatures.map(tenant => (
                          <TenantCatalogFeaturesSection
                            key={tenant.id}
                            tenant={tenant}
                            catalogId={catalog.id}
                            stores={stores}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Manage Stores Section */}
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-800">Manage Stores</h4>
                    <button
                      onClick={() => toggleStoresExpansion(catalog.id)}
                      className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {expandedStores[catalog.id] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {expandedStores[catalog.id] && (
                    <div className="mt-2 space-y-3">
                      {/* Current stores (effective for base == own stores) */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Current Stores ({effectiveCatalogs[catalog.id]?.stores.length || 0})
                        </div>
                        <div className="max-h-44 overflow-y-auto border border-gray-200 rounded bg-white p-2">
                          <div className="space-y-1">
                            {(effectiveCatalogs[catalog.id]?.stores || []).map((store, index) => {
                              const effective = effectiveCatalogs[catalog.id];
                              const currentDiscount = effective.storeDiscounts[store.name] || 0;
                              const currentCSS = effective.storeCSS[store.name] || "";
                              const key = settingsKey(catalog.id, store.name);
                              const open = !!storeSettingsOpen[key];
                              return (
                                <div key={`${catalog.id}-${store.name}-${index}`} className="space-y-1 border-b border-gray-100 pb-2 last:border-b-0">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{store.name}</span>
                                      {currentDiscount > 0 && (
                                        <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-[10px]">{currentDiscount}% off</span>
                                      )}
                                      {currentCSS && (
                                        <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">CSS</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => moveStoreInCatalog(catalog.id, store.name, 'up')}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        title="Move up"
                                      >▲</button>
                                      <button
                                        onClick={() => moveStoreInCatalog(catalog.id, store.name, 'down')}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        title="Move down"
                                      >▼</button>
                                      <button
                                        onClick={() => setStoreSettingsOpen(prev => ({ ...prev, [key]: !open }))}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                      >
                                        {open ? 'Hide' : 'Configure'}
                                      </button>
                                      <button
                                        onClick={() => removeStoreFromCatalog(catalog.id, store.name)}
                                        className="px-2 py-0.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                  {open && (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <label className="text-[11px] text-gray-600">Discount %</label>
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={currentDiscount}
                                          onChange={(e) => setStoreDiscount(catalog.id, store.name, parseInt(e.target.value || '0', 10))}
                                          className="w-16 h-6 text-xs border border-gray-200 rounded px-1"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] text-gray-600 mb-1">Custom CSS (JSON)</label>
                                        <textarea
                                          className="w-full text-[11px] border border-gray-200 rounded p-1 bg-white"
                                          rows={2}
                                          placeholder='{"backgroundColor":"#f0f0f0"}'
                                          value={(() => { try { return currentCSS; } catch { return ""; } })()}
                                          onChange={(e) => setStoreCSS(catalog.id, store.name, e.target.value)}
                                        />
                                      </div>
                                      {effective.storeFees[store.name] ? (
                                        <div>
                                          <label className="block text-[11px] text-gray-600 mb-1">Additional Fee</label>
                                          <div className="flex items-center gap-2">
                                            <select
                                              value={effective.storeFees[store.name].type}
                                              onChange={(e) => {
                                                setStoreFee(catalog.id, store.name, {
                                                  type: e.target.value as FeeType,
                                                  value: effective.storeFees[store.name].value
                                                });
                                              }}
                                              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                                            >
                                              <option value="percentage">%</option>
                                              <option value="fixed">Fixed</option>
                                            </select>
                                            <input
                                              type="number"
                                              min={0}
                                              step={effective.storeFees[store.name].type === 'percentage' ? 0.1 : 1}
                                              value={effective.storeFees[store.name].value}
                                              onChange={(e) => {
                                                const value = parseFloat(e.target.value) || 0;
                                                if (value === 0) {
                                                  setStoreFee(catalog.id, store.name, null);
                                                } else {
                                                  setStoreFee(catalog.id, store.name, { type: effective.storeFees[store.name].type, value });
                                                }
                                              }}
                                              className="flex-1 h-6 text-xs border border-gray-200 rounded px-1"
                                            />
                                            <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px]">
                                              {effective.storeFees[store.name].type === 'percentage' 
                                                ? `+${effective.storeFees[store.name].value}%` 
                                                : `+${effective.storeFees[store.name].value}`}
                                            </span>
                                            <button
                                              onClick={() => setStoreFee(catalog.id, store.name, null)}
                                              className="px-1 py-0.5 bg-red-100 text-red-800 text-[10px] rounded hover:bg-red-200"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <button
                                            onClick={() => setStoreFee(catalog.id, store.name, { type: 'percentage', value: 5 })}
                                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[11px] rounded hover:bg-yellow-200"
                                          >
                                            + Add Fee
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Combo Instance Form Modal */}
      {Object.entries(showComboInstanceForm).map(([catalogId, isOpen]) => {
        if (!isOpen) return null;
        const catalog = catalogs.find(c => c.id === catalogId);
        if (!catalog) return null;
        const formData = comboInstanceFormData[catalogId] || {
          masterComboId: null,
          displayName: "",
          imageUrl: "",
          customStoreNames: [],
          denominations: [],
          isActive: true,
        };
        // Sort master combos so "Default Combo Card" appears first
        const availableMasterCombos = masterCombos
          .filter(m => m.currency === catalog.currency && m.isActive)
          .sort((a, b) => {
            // Put "Default Combo Card" first
            if (a.name === "Default Combo Card" && b.name !== "Default Combo Card") return -1;
            if (b.name === "Default Combo Card" && a.name !== "Default Combo Card") return 1;
            return a.name.localeCompare(b.name);
          });
        const availableStores = stores.filter(s => s.country === catalog.country);

        return (
          <div
            key={catalogId}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowComboInstanceForm(prev => ({ ...prev, [catalogId]: false }));
            }}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Combo Card to {catalog.name}</h3>
                <button
                  onClick={() => {
                    setShowComboInstanceForm(prev => ({ ...prev, [catalogId]: false }));
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Base
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`combo-base-${catalogId}`}
                          checked={formData.masterComboId !== null}
                          onChange={() => {
                            setComboInstanceFormData(prev => ({
                              ...prev,
                              [catalogId]: { ...formData, masterComboId: availableMasterCombos[0]?.id || null }
                            }));
                          }}
                          className="text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">Use existing Default Combo</span>
                          <select
                            value={formData.masterComboId || ""}
                            onChange={(e) => {
                              setComboInstanceFormData(prev => ({
                                ...prev,
                                [catalogId]: { ...formData, masterComboId: e.target.value || null }
                              }));
                            }}
                            className="mt-1 w-full text-sm border border-gray-300 rounded px-2 py-1"
                            disabled={formData.masterComboId === null}
                          >
                            <option value="">Select a default combo</option>
                            {availableMasterCombos.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.storeNames.length} stores)
                              </option>
                            ))}
                          </select>
                        </div>
                      </label>
                      <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`combo-base-${catalogId}`}
                          checked={formData.masterComboId === null}
                          onChange={() => {
                            setComboInstanceFormData(prev => ({
                              ...prev,
                              [catalogId]: { ...formData, masterComboId: null, customStoreNames: [] }
                            }));
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-sm font-medium">Create custom combo (just for this tenant)</span>
                      </label>
                    </div>
                  </div>

                  {formData.masterComboId && (() => {
                    const master = getMasterCombo(formData.masterComboId);
                    return master ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          ✓ This combo includes {master.storeNames.length} stores from &quot;{master.name}&quot;
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Note: Changes to {master.name} will automatically update this combo instance.
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {formData.masterComboId === null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Stores <span className="text-red-500">*</span>
                      </label>
                      <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                        <div className="space-y-2">
                          {availableStores.map(store => (
                            <label
                              key={store.name}
                              className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.customStoreNames.includes(store.name)}
                                onChange={() => {
                                  const newStoreNames = formData.customStoreNames.includes(store.name)
                                    ? formData.customStoreNames.filter(n => n !== store.name)
                                    : [...formData.customStoreNames, store.name];
                                  setComboInstanceFormData(prev => ({
                                    ...prev,
                                    [catalogId]: { ...formData, customStoreNames: newStoreNames }
                                  }));
                                }}
                                className="rounded border-gray-300 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">{store.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => {
                        setComboInstanceFormData(prev => ({
                          ...prev,
                          [catalogId]: { ...formData, displayName: e.target.value }
                        }));
                      }}
                      placeholder="e.g., Holiday Combo, Premium Combo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setComboInstanceFormData(prev => ({
                          ...prev,
                          [catalogId]: { ...formData, imageUrl: e.target.value }
                        }));
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    {formData.imageUrl && (
                      <div className="mt-2 w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Denominations
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const allDenoms = [5, 10, 25, 50, 100, 200, 500];
                          const allSelected = allDenoms.every(d => formData.denominations.includes(d));
                          const newDenoms = allSelected ? [] : allDenoms;
                          setComboInstanceFormData(prev => ({
                            ...prev,
                            [catalogId]: { ...formData, denominations: newDenoms }
                          }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {[5, 10, 25, 50, 100, 200, 500].every(d => formData.denominations.includes(d)) ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 25, 50, 100, 200, 500].map(denom => (
                        <label
                          key={denom}
                          className="flex items-center space-x-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.denominations.includes(denom)}
                            onChange={() => {
                              const newDenoms = formData.denominations.includes(denom)
                                ? formData.denominations.filter(d => d !== denom)
                                : [...formData.denominations, denom].sort((a, b) => a - b);
                              setComboInstanceFormData(prev => ({
                                ...prev,
                                [catalogId]: { ...formData, denominations: newDenoms }
                              }));
                            }}
                            className="rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            {catalog.currency === "USD" ? "$" : catalog.currency === "CAD" ? "C$" : "£"}{denom}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowComboInstanceForm(prev => ({ ...prev, [catalogId]: false }));
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!formData.displayName.trim()) {
                      alert("Please provide a display name");
                      return;
                    }
                    if (formData.masterComboId === null && formData.customStoreNames.length === 0) {
                      alert("Please select at least one store for custom combo");
                      return;
                    }
                    createComboInstance({
                      catalogId,
                      masterComboId: formData.masterComboId,
                      displayName: formData.displayName.trim(),
                      imageUrl: formData.imageUrl || undefined,
                      customStoreNames: formData.masterComboId === null ? formData.customStoreNames : null,
                      denominations: formData.denominations,
                      isActive: formData.isActive,
                    });
                    setShowComboInstanceForm(prev => ({ ...prev, [catalogId]: false }));
                    setComboInstanceFormData(prev => {
                      const newData = { ...prev };
                      delete newData[catalogId];
                      return newData;
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Create Combo Card
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
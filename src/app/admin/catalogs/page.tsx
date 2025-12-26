"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import type { Fee, FeeType } from "../_components/AdminDataProvider";

export default function CatalogsPage() {
  const { 
    catalogs, 
    stores, 
    combos, 
    masterCombos,
    comboInstances,
    createComboInstance,
    updateComboInstance,
    deleteComboInstance,
    getComboInstancesForCatalog,
    getComboInstanceStores,
    getMasterCombo,
    addStoreToCatalog, 
    addStoresToCatalog, 
    removeStoreFromCatalog, 
    setStoreDiscount, 
    setStoreCSS, 
    setStoreFee, 
    setCatalogFee, 
    moveStoreInCatalog, 
    createBranch, 
    deleteBranch, 
    getEffectiveCatalog, 
    getTenantsForCatalog, 
    addTenantToCatalog, 
    removeTenantFromCatalog, 
    tenants 
  } = useAdminData();
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const [newBranchName, setNewBranchName] = useState<string>("");
  const [creatingBranchFor, setCreatingBranchFor] = useState<string | null>(null);
  const [expandedTenants, setExpandedTenants] = useState<Record<string, boolean>>({});
  const [selectedTenantToAdd, setSelectedTenantToAdd] = useState<Record<string, string>>({});
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [selectedStoreToAdd, setSelectedStoreToAdd] = useState<Record<string, string>>({});
  const [isAddingCombo, setIsAddingCombo] = useState<Record<string, boolean>>({});
  const [storeSettingsOpen, setStoreSettingsOpen] = useState<Record<string, boolean>>({});
  const [expandedCatalogs, setExpandedCatalogs] = useState<Record<string, boolean>>({});
  const [expandedComboInstances, setExpandedComboInstances] = useState<Record<string, boolean>>({});
  const [showComboInstanceForm, setShowComboInstanceForm] = useState<Record<string, boolean>>({});
  const [comboInstanceFormData, setComboInstanceFormData] = useState<Record<string, {
    masterComboId: string | null;
    displayName: string;
    imageUrl: string;
    customStoreNames: string[];
    denominations: number[];
    isActive: boolean;
  }>>({});

  const toggleCatalogExpansion = (catalogId: string) => {
    setExpandedCatalogs(prev => ({
      ...prev,
      [catalogId]: !prev[catalogId]
    }));
  };

  const settingsKey = (catalogId: string, storeName: string) => `${catalogId}::${storeName}`;

  // Organize catalogs into tree structure
  const catalogTree = useMemo(() => {
    const baseCatalogs = catalogs.filter(c => !c.isBranch);
    const branchCatalogs = catalogs.filter(c => c.isBranch);
    
    return baseCatalogs.map(base => ({
      ...base,
      branches: branchCatalogs.filter(branch => branch.parentId === base.id)
    }));
  }, [catalogs]);

  // Memoize effective catalogs for all catalogs to avoid calling hooks in render
  const effectiveCatalogs = useMemo(() => {
    const map: Record<string, ReturnType<typeof getEffectiveCatalog>> = {};
    catalogs.forEach(catalog => {
      map[catalog.id] = getEffectiveCatalog(catalog.id);
    });
    return map;
  }, [catalogs, getEffectiveCatalog]);

  const handleCreateBranch = (parentId: string) => {
    if (newBranchName.trim()) {
      createBranch(parentId, newBranchName.trim());
      setNewBranchName("");
      setCreatingBranchFor(null);
    }
  };

  const toggleBranchExpansion = (catalogId: string) => {
    setExpandedBranches(prev => ({
      ...prev,
      [catalogId]: !prev[catalogId]
    }));
  };

  const toggleTenantExpansion = (catalogId: string) => {
    setExpandedTenants(prev => ({
      ...prev,
      [catalogId]: !prev[catalogId]
    }));
  };

  const toggleStoresExpansion = (catalogId: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [catalogId]: !prev[catalogId]
    }));
  };

  const handleAddTenantToCatalog = (catalogId: string) => {
    const tenantId = selectedTenantToAdd[catalogId];
    if (tenantId) {
      addTenantToCatalog(catalogId, tenantId);
      setSelectedTenantToAdd(prev => ({ ...prev, [catalogId]: "" }));
    }
  };

  const getAvailableTenantsForCatalog = (catalog: any) => {
    return tenants.filter(tenant => 
      tenant.country === catalog.country && 
      getTenantsForCatalog(catalog.id).every(t => t.id !== tenant.id)
    );
  };

  const getAvailableStoresForCatalog = (catalog: any) => {
    const effective = getEffectiveCatalog(catalog.id).stores.map(s => s.name);
    return stores.filter(s => s.country === catalog.country && !effective.includes(s.name));
  };

  const getAvailableCombosForCatalog = (catalog: any) => {
    // Filter combos by currency matching the catalog's currency
    return combos.filter(combo => 
      combo.currency === catalog.currency && 
      combo.isActive &&
      // Check if any stores from the combo are not already in the catalog
      combo.storeNames.some(storeName => {
        const effective = getEffectiveCatalog(catalog.id).stores.map(s => s.name);
        return !effective.includes(storeName);
      })
    );
  };

  const handleAddStoreToCatalog = (catalogId: string) => {
    const storeName = selectedStoreToAdd[catalogId];
    if (storeName) {
      // Check if it's a combo (starts with "combo:")
      if (storeName.startsWith("combo:")) {
        const comboId = storeName.replace("combo:", "");
        const combo = combos.find(c => c.id === comboId);
        if (combo) {
          console.log(`Adding combo "${combo.name}" with stores:`, combo.storeNames);
          // Add all stores from the combo to the catalog in a single operation
          addStoresToCatalog(catalogId, combo.storeNames);
        } else {
          console.error(`Combo with id "${comboId}" not found`);
        }
      } else {
        // Regular store
        addStoreToCatalog(catalogId, storeName);
      }
      setSelectedStoreToAdd(prev => ({ ...prev, [catalogId]: "" }));
      setIsAddingCombo(prev => ({ ...prev, [catalogId]: false }));
    }
  };

  const getCurrencySymbol = (currency: string) => {
    if (currency === "USD") return "$";
    if (currency === "CAD") return "C$";
    if (currency === "GBP") return "£";
    return currency;
  };

  const handleEditComboInstance = (instance: any) => {
    setComboInstanceFormData(prev => ({
      ...prev,
      [instance.catalogId]: {
        masterComboId: instance.masterComboId || null,
        displayName: instance.displayName,
        imageUrl: instance.imageUrl || "",
        customStoreNames: instance.customStoreNames || [],
        denominations: instance.denominations || [],
        isActive: instance.isActive,
      }
    }));
    setShowComboInstanceForm(prev => ({ ...prev, [instance.catalogId]: true }));
  };

  const handleDeleteComboInstance = (instanceId: string) => {
    if (confirm("Are you sure you want to delete this combo card?")) {
      deleteComboInstance(instanceId);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Catalogs</h1>
            <p className="text-sm text-gray-600">
              Manage catalog branches and store assignments. Create branches from base catalogs.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {catalogTree.length} base catalogs
          </div>
        </div>
      </header>
      
      {/* Catalog Tree View */}
      <div className="space-y-4">
        {catalogTree.map((baseCatalog) => {
          const isExpanded = expandedBranches[baseCatalog.id];
          const effectiveCatalog = getEffectiveCatalog(baseCatalog.id);
          const isCatalogExpanded = expandedCatalogs[baseCatalog.id] !== false; // default to expanded
          
          return (
            <div key={baseCatalog.id} className="border border-gray-200 rounded-lg bg-white">
              {/* Base Catalog Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCatalogExpansion(baseCatalog.id)}
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
                    <button
                      onClick={() => toggleBranchExpansion(baseCatalog.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{baseCatalog.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Base
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {effectiveCatalog.stores.length} stores
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                        {getTenantsForCatalog(baseCatalog.id).length} tenants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCreatingBranchFor(baseCatalog.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200"
                    >
                      + Create Branch
                    </button>
                    <button
                      onClick={() => toggleTenantExpansion(baseCatalog.id)}
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded hover:bg-purple-200"
                    >
                      Manage Tenants
                    </button>
                    <span className="text-sm text-gray-500">
                      {baseCatalog.branches.length} branches
                    </span>
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
                              setCatalogFee(baseCatalog.id, {
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
                                setCatalogFee(baseCatalog.id, null);
                              } else {
                                setCatalogFee(baseCatalog.id, { type: effectiveCatalog.catalogFee!.type, value });
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
                            onClick={() => setCatalogFee(baseCatalog.id, null)}
                            className="ml-auto px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                          >
                            Remove Fee
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <button
                          onClick={() => setCatalogFee(baseCatalog.id, { type: 'percentage', value: 5 })}
                          className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200"
                        >
                          + Add Catalog-Level Fee
                        </button>
                      </div>
                    )}

                    {/* Branch Creation Form */}
                    {creatingBranchFor === baseCatalog.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter branch name..."
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateBranch(baseCatalog.id)}
                      />
                      <button
                        onClick={() => handleCreateBranch(baseCatalog.id)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setCreatingBranchFor(null);
                          setNewBranchName("");
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Tenant Management Section */}
                {expandedTenants[baseCatalog.id] && (
                  <div className="mt-3 p-3 bg-purple-50 rounded border">
                    <h4 className="text-sm font-medium text-purple-800 mb-3">Tenant Management</h4>
                    
                    {/* Current Tenants */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Current Tenants ({getTenantsForCatalog(baseCatalog.id).length})</div>
                      {getTenantsForCatalog(baseCatalog.id).length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No tenants assigned</p>
                      ) : (
                        <div className="space-y-1">
                          {getTenantsForCatalog(baseCatalog.id).map(tenant => (
                            <div key={tenant.id} className="flex items-center justify-between bg-white rounded p-2 border">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{tenant.name}</span>
                                <span className="px-1 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                                  {tenant.country}
                                </span>
                              </div>
                              <button
                                onClick={() => removeTenantFromCatalog(baseCatalog.id, tenant.id)}
                                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
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
                      <div className="text-xs font-medium text-gray-700 mb-2">Add Tenant</div>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTenantToAdd[baseCatalog.id] || ""}
                          onChange={(e) => setSelectedTenantToAdd(prev => ({ ...prev, [baseCatalog.id]: e.target.value }))}
                          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
                        >
                          <option value="">Select tenant...</option>
                          {getAvailableTenantsForCatalog(baseCatalog).map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name} ({tenant.country})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddTenantToCatalog(baseCatalog.id)}
                          disabled={!selectedTenantToAdd[baseCatalog.id]}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Combo Instances Section */}
                {(() => {
                  const comboInstancesForCatalog = getComboInstancesForCatalog(baseCatalog.id);
                  return (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Combo Cards in this Catalog</h3>
                        <button
                          onClick={() => {
                            setComboInstanceFormData(prev => ({
                              ...prev,
                              [baseCatalog.id]: {
                                displayName: "",
                                imageUrl: "",
                                denominations: [],
                                masterComboId: null,
                                customStoreNames: [],
                                isActive: true,
                              }
                            }));
                            setShowComboInstanceForm(prev => ({ ...prev, [baseCatalog.id]: true }));
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          + Add New Combo to Catalog
                        </button>
                      </div>
                      {comboInstancesForCatalog.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No combo cards in this catalog yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {comboInstancesForCatalog.map(instance => {
                            const source = instance.masterComboId ? getMasterCombo(instance.masterComboId) : null;
                            const storeNames = getComboInstanceStores(instance.id);
                            return (
                              <div key={instance.id} className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-800">{instance.displayName}</div>
                                  <div className="text-xs text-gray-600">
                                    {source ? `Based on: ${source.name}` : "Custom"} ({storeNames.length} stores)
                                  </div>
                                  {instance.denominations.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {instance.denominations.map(d => (
                                        <span key={d} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          {getCurrencySymbol(baseCatalog.currency)}{d}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditComboInstance(instance)}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComboInstance(instance.id)}
                                    className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-xs font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Manage Stores Section */}
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-800">Manage Stores</h4>
                    <button
                      onClick={() => toggleStoresExpansion(baseCatalog.id)}
                      className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {expandedStores[baseCatalog.id] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {expandedStores[baseCatalog.id] && (
                    <div className="mt-2 space-y-3">
                      {/* Current stores (effective for base == own stores) */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Current Stores ({effectiveCatalogs[baseCatalog.id]?.stores.length || 0})
                        </div>
                        <div className="max-h-44 overflow-y-auto border border-gray-200 rounded bg-white p-2">
                          <div className="space-y-1">
                            {(effectiveCatalogs[baseCatalog.id]?.stores || []).map((store, index) => {
                              const effective = effectiveCatalogs[baseCatalog.id];
                              const currentDiscount = effective.storeDiscounts[store.name] || 0;
                              const currentCSS = effective.storeCSS[store.name] || "";
                              const key = settingsKey(baseCatalog.id, store.name);
                              const open = !!storeSettingsOpen[key];
                              return (
                                <div key={`${baseCatalog.id}-${store.name}-${index}`} className="space-y-1 border-b border-gray-100 pb-2 last:border-b-0">
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
                                        onClick={() => moveStoreInCatalog(baseCatalog.id, store.name, 'up')}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        title="Move up"
                                      >▲</button>
                                      <button
                                        onClick={() => moveStoreInCatalog(baseCatalog.id, store.name, 'down')}
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
                                        onClick={() => removeStoreFromCatalog(baseCatalog.id, store.name)}
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
                                          onChange={(e) => setStoreDiscount(baseCatalog.id, store.name, parseInt(e.target.value || '0', 10))}
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
                                          onChange={(e) => setStoreCSS(baseCatalog.id, store.name, e.target.value)}
                                        />
                                      </div>
                                      {effective.storeFees[store.name] ? (
                                        <div>
                                          <label className="block text-[11px] text-gray-600 mb-1">Additional Fee</label>
                                          <div className="flex items-center gap-2">
                                            <select
                                              value={effective.storeFees[store.name].type}
                                              onChange={(e) => {
                                                setStoreFee(baseCatalog.id, store.name, {
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
                                                  setStoreFee(baseCatalog.id, store.name, null);
                                                } else {
                                                  setStoreFee(baseCatalog.id, store.name, { type: effective.storeFees[store.name].type, value });
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
                                              onClick={() => setStoreFee(baseCatalog.id, store.name, null)}
                                              className="px-1 py-0.5 bg-red-100 text-red-800 text-[10px] rounded hover:bg-red-200"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <button
                                            onClick={() => setStoreFee(baseCatalog.id, store.name, { type: 'percentage', value: 5 })}
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

                      {/* Add store */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Add Store or Combo (filtered by country/currency)</div>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedStoreToAdd[baseCatalog.id] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedStoreToAdd(prev => ({ ...prev, [baseCatalog.id]: value }));
                              setIsAddingCombo(prev => ({ ...prev, [baseCatalog.id]: value.startsWith("combo:") }));
                            }}
                            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                          >
                            <option value="">Select a store or combo</option>
                            <optgroup label="Stores">
                              {getAvailableStoresForCatalog(baseCatalog).map(s => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                              ))}
                            </optgroup>
                            {getAvailableCombosForCatalog(baseCatalog).length > 0 && (
                              <optgroup label="Combos">
                                {getAvailableCombosForCatalog(baseCatalog).map(combo => (
                                  <option key={combo.id} value={`combo:${combo.id}`}>
                                    {combo.name} ({combo.storeNames.length} stores)
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                          <button
                            onClick={() => handleAddStoreToCatalog(baseCatalog.id)}
                            disabled={!selectedStoreToAdd[baseCatalog.id]}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isAddingCombo[baseCatalog.id] ? "Add all stores from this combo" : "Add store"}
                          >
                            {isAddingCombo[baseCatalog.id] ? "Add Combo" : "Add"}
                          </button>
                        </div>
                        {isAddingCombo[baseCatalog.id] && selectedStoreToAdd[baseCatalog.id] && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            This will add all stores from the selected combo to the catalog.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
              
              {/* Branches */}
              {isCatalogExpanded && isExpanded && (
                <div className="p-4 space-y-3">
                  {baseCatalog.branches.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No branches created yet</p>
                  ) : (
                    baseCatalog.branches.map((branch) => {
                      const branchEffective = effectiveCatalogs[branch.id];
                      const isBranchExpanded = expandedCatalogs[branch.id] === true; // default to minimized
                      
                      return (
                        <div key={branch.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                          <div 
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-100 -m-3 p-3 rounded"
                            onClick={() => toggleCatalogExpansion(branch.id)}
                            title={isBranchExpanded ? "Click to minimize" : "Click to maximize"}
                          >
                            <div className="flex items-center gap-2">
                              <svg 
                                className={`w-4 h-4 transition-transform text-gray-500 ${isBranchExpanded ? '' : 'rotate-180'}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                              </svg>
                              <h4 className="font-medium">{branch.name}</h4>
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                Branch
                              </span>
                              <span className="text-xs text-gray-500">
                                {branchEffective.stores.length} stores
                              </span>
                              <span className="text-xs text-purple-600">
                                {getTenantsForCatalog(branch.id).length} tenants
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBranch(branch.id);
                                }}
                                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          
                          {/* Branch Content - Only show when expanded */}
                          {isBranchExpanded && (
                            <>
                              {/* Catalog-level Fee for Branch */}
                              {branch.branchChanges.catalogFeeOverride || branchEffective.catalogFee ? (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catalog-Level Fee {branch.branchChanges.catalogFeeOverride && '(Branch Override)'}
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={branchEffective.catalogFee?.type || 'percentage'}
                                      onChange={(e) => {
                                        setCatalogFee(branch.id, {
                                          type: e.target.value as FeeType,
                                          value: branchEffective.catalogFee?.value || 0
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
                                      step={branchEffective.catalogFee?.type === 'percentage' ? 0.1 : 1}
                                      value={branchEffective.catalogFee?.value || ''}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        if (value === 0) {
                                          setCatalogFee(branch.id, null);
                                        } else {
                                          setCatalogFee(branch.id, { type: branchEffective.catalogFee!.type, value });
                                        }
                                      }}
                                      className="w-32 text-sm border border-gray-300 rounded px-3 py-2"
                                    />
                                    {branchEffective.catalogFee && (
                                      <span className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded font-medium text-sm">
                                        {branchEffective.catalogFee.type === 'percentage' 
                                          ? `+${branchEffective.catalogFee.value}%` 
                                          : `+${branchEffective.catalogFee.value} ${branchEffective.currency}`}
                                      </span>
                                    )}
                                    {branch.branchChanges.catalogFeeOverride && (
                                      <button
                                        onClick={() => setCatalogFee(branch.id, null)}
                                        className="ml-auto px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                                      >
                                        Remove Override
                                      </button>
                                    )}
                                    {!branch.branchChanges.catalogFeeOverride && branchEffective.catalogFee && (
                                      <span className="text-xs text-gray-500 italic ml-2">(inherited from base)</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <button
                                    onClick={() => setCatalogFee(branch.id, { type: 'percentage', value: 5 })}
                                    className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200"
                                  >
                                    + Add Catalog-Level Fee Override
                                  </button>
                                </div>
                              )}

                              {/* Branch Changes Summary */}
                              <div className="mt-2 text-xs text-gray-600">
                                {branch.branchChanges.addedStores.length > 0 && (
                                  <span className="mr-3">+{branch.branchChanges.addedStores.length} stores</span>
                                )}
                                {branch.branchChanges.removedStores.length > 0 && (
                                  <span className="mr-3">-{branch.branchChanges.removedStores.length} stores</span>
                                )}
                                {Object.keys(branch.branchChanges.discountOverrides).length > 0 && (
                                  <span className="mr-3">{Object.keys(branch.branchChanges.discountOverrides).length} discount changes</span>
                                )}
                                {Object.keys(branch.branchChanges.cssOverrides).length > 0 && (
                                  <span className="mr-3">{Object.keys(branch.branchChanges.cssOverrides).length} CSS changes</span>
                                )}
                                {Object.keys(branch.branchChanges.feeOverrides).length > 0 && (
                                  <span className="mr-3">{Object.keys(branch.branchChanges.feeOverrides).length} fee changes</span>
                                )}
                                {branch.branchChanges.catalogFeeOverride && (
                                  <span>Catalog fee override</span>
                                )}
                              </div>

                              {/* Manage Stores for Branch */}
                              <div className="mt-3 p-3 bg-white rounded border">
                            <div className="text-xs font-medium text-gray-800 mb-2">Manage Stores</div>
                            {/* Current effective stores */}
                            <div className="mb-2">
                              <div className="text-[11px] text-gray-600 mb-1">Current Stores ({branchEffective.stores.length})</div>
                              <div className="max-h-36 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-2">
                                <div className="space-y-1">
                                  {branchEffective.stores.map((store, index) => {
                                    const currentDiscount = branchEffective.storeDiscounts[store.name] || 0;
                                    const currentCSS = branchEffective.storeCSS[store.name] || "";
                                    const key = settingsKey(branch.id, store.name);
                                    const open = !!storeSettingsOpen[key];
                                    return (
                                      <div key={`${branch.id}-${store.name}-${index}`} className="space-y-1 border-b border-gray-100 pb-2 last:border-b-0">
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
                                              onClick={() => moveStoreInCatalog(branch.id, store.name, 'up')}
                                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                              title="Move up"
                                            >▲</button>
                                            <button
                                              onClick={() => moveStoreInCatalog(branch.id, store.name, 'down')}
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
                                              onClick={() => removeStoreFromCatalog(branch.id, store.name)}
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
                                                onChange={(e) => setStoreDiscount(branch.id, store.name, parseInt(e.target.value || '0', 10))}
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
                                                onChange={(e) => setStoreCSS(branch.id, store.name, e.target.value)}
                                              />
                                            </div>
                                            {branchEffective.storeFees[store.name] ? (
                                              <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">
                                                  Additional Fee {branch.branchChanges.feeOverrides[store.name] && '(Override)'}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                  <select
                                                    value={branchEffective.storeFees[store.name].type}
                                                    onChange={(e) => {
                                                      setStoreFee(branch.id, store.name, {
                                                        type: e.target.value as FeeType,
                                                        value: branchEffective.storeFees[store.name].value
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
                                                    step={branchEffective.storeFees[store.name].type === 'percentage' ? 0.1 : 1}
                                                    value={branchEffective.storeFees[store.name].value}
                                                    onChange={(e) => {
                                                      const value = parseFloat(e.target.value) || 0;
                                                      if (value === 0) {
                                                        setStoreFee(branch.id, store.name, null);
                                                      } else {
                                                        setStoreFee(branch.id, store.name, { type: branchEffective.storeFees[store.name].type, value });
                                                      }
                                                    }}
                                                    className="flex-1 h-6 text-xs border border-gray-200 rounded px-1"
                                                  />
                                                  <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[10px]">
                                                    {branchEffective.storeFees[store.name].type === 'percentage' 
                                                      ? `+${branchEffective.storeFees[store.name].value}%` 
                                                      : `+${branchEffective.storeFees[store.name].value}`}
                                                  </span>
                                                  {branch.branchChanges.feeOverrides[store.name] && (
                                                    <button
                                                      onClick={() => setStoreFee(branch.id, store.name, null)}
                                                      className="px-1 py-0.5 bg-red-100 text-red-800 text-[10px] rounded hover:bg-red-200"
                                                    >
                                                      Remove
                                                    </button>
                                                  )}
                                                  {!branch.branchChanges.feeOverrides[store.name] && (
                                                    <span className="text-[10px] text-gray-500 italic">(inherited)</span>
                                                  )}
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                <button
                                                  onClick={() => setStoreFee(branch.id, store.name, { type: 'percentage', value: 5 })}
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

                            {/* Add store */}
                            <div>
                              <div className="text-[11px] text-gray-600 mb-1">Add Store or Combo (filtered by country/currency)</div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={selectedStoreToAdd[branch.id] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedStoreToAdd(prev => ({ ...prev, [branch.id]: value }));
                                    setIsAddingCombo(prev => ({ ...prev, [branch.id]: value.startsWith("combo:") }));
                                  }}
                                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                                >
                                  <option value="">Select a store or combo</option>
                                  <optgroup label="Stores">
                                    {getAvailableStoresForCatalog(branch).map(s => (
                                      <option key={s.name} value={s.name}>{s.name}</option>
                                    ))}
                                  </optgroup>
                                  {getAvailableCombosForCatalog(branch).length > 0 && (
                                    <optgroup label="Combos">
                                      {getAvailableCombosForCatalog(branch).map(combo => (
                                        <option key={combo.id} value={`combo:${combo.id}`}>
                                          {combo.name} ({combo.storeNames.length} stores)
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                                <button
                                  onClick={() => handleAddStoreToCatalog(branch.id)}
                                  disabled={!selectedStoreToAdd[branch.id]}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={isAddingCombo[branch.id] ? "Add all stores from this combo" : "Add store"}
                                >
                                  {isAddingCombo[branch.id] ? "Add Combo" : "Add"}
                                </button>
                              </div>
                              {isAddingCombo[branch.id] && selectedStoreToAdd[branch.id] && (
                                <p className="text-[10px] text-gray-500 mt-1">
                                  This will add all stores from the selected combo to the catalog.
                                </p>
                              )}
                            </div>
                          </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
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
        const availableMasterCombos = masterCombos.filter(m => m.currency === catalog.currency && m.isActive);
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
                          <span className="text-sm font-medium">Use existing Master Combo</span>
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
                            <option value="">Select a master combo</option>
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
                          ✓ This combo includes {master.storeNames.length} stores from "{master.name}"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Denominations
                    </label>
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
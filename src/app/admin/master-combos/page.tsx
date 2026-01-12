"use client";

import { useState, useMemo } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import type { MasterCombo, Currency } from "../_components/AdminDataProvider";

type Country = "US" | "CA" | "GB";

export default function MasterCombosPage() {
  const { 
    masterCombos, 
    stores,
    createMasterCombo, 
    updateMasterCombo, 
    deleteMasterCombo, 
    toggleMasterComboActive 
  } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [editingCombo, setEditingCombo] = useState<MasterCombo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD" as Currency,
    storeNames: [] as string[],
    isActive: true,
    imageUrl: "",
  });

  // Get stores by currency
  const getStoresByCurrency = (currency: Currency) => {
    const countryMap: Record<Currency, Country> = {
      USD: "US",
      CAD: "CA",
      GBP: "GB",
    };
    return stores
      .filter(s => s.country === countryMap[currency])
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get pricing type for a store (same logic as stores page)
  const getStorePricingType = (storeName: string, country: Country): "Variable" | "Fixed" | null => {
    // Deterministic pseudo-random assignment based on store name and country
    const key = `${country}-${storeName}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 2 === 0 ? "Variable" : "Fixed";
  };

  // Get denomination options for Fixed pricing stores
  const getFixedPricingOptions = (storeName: string, country: Country): string => {
    const key = `${country}-${storeName}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) | 0;
    }
    // Use hash to deterministically assign one of three options
    const optionIndex = Math.abs(hash) % 3;
    const options = [
      [5, 15, 25, 50],
      [25, 50, 75],
      [10, 50, 100, 150, 200]
    ];
    return options[optionIndex].join(", ");
  };

  const availableStores = useMemo(() => getStoresByCurrency(formData.currency), [formData.currency, stores]);

  const handleCreate = () => {
    if (!formData.name.trim() || formData.storeNames.length === 0) {
      alert("Please provide a default combo name and select at least one store");
      return;
    }
    if (masterCombos.some(c => c.name.toLowerCase() === formData.name.trim().toLowerCase())) {
      alert("A default combo with this name already exists. Please choose a unique name.");
      return;
    }
    createMasterCombo({
      name: formData.name.trim(),
      currency: formData.currency,
      storeNames: formData.storeNames,
      isActive: formData.isActive,
      imageUrl: formData.imageUrl.trim() || undefined,
    });
    setFormData({ name: "", currency: "USD", storeNames: [], isActive: true, imageUrl: "" });
    setShowForm(false);
  };

  const handleUpdate = () => {
    if (!editingCombo || formData.storeNames.length === 0) {
      alert("Please select at least one store");
      return;
    }
    updateMasterCombo(editingCombo.id, {
      currency: formData.currency,
      storeNames: formData.storeNames,
      isActive: formData.isActive,
      imageUrl: formData.imageUrl.trim() || undefined,
    });
    setEditingCombo(null);
    setFormData({ name: "", currency: "USD", storeNames: [], isActive: true, imageUrl: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this default combo? This will also delete all combo instances based on it.")) {
      deleteMasterCombo(id);
    }
  };

  const handleEdit = (combo: MasterCombo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      currency: combo.currency,
      storeNames: [...combo.storeNames],
      isActive: combo.isActive,
      imageUrl: combo.imageUrl || "",
    });
    setShowForm(true);
  };

  const toggleStore = (storeName: string) => {
    setFormData(prev => ({
      ...prev,
      storeNames: prev.storeNames.includes(storeName)
        ? prev.storeNames.filter(n => n !== storeName)
        : [...prev.storeNames, storeName],
    }));
  };

  const handleAddAllStores = () => {
    setFormData(prev => ({
      ...prev,
      storeNames: availableStores.map(s => s.name),
    }));
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Default Combos</h1>
            <p className="text-sm text-gray-600">
              Create global combo templates that define store lists. These can be used by tenants to create branded combo instances.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCombo(null);
              setFormData({ name: "", currency: "USD", storeNames: [], isActive: true, imageUrl: "" });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + Create Default Combo
          </button>
        </div>
      </header>

      {/* Default Combos List - Only show "Default Combo Card" (one per currency) */}
      {(() => {
        const defaultCombos = masterCombos.filter(mc => mc.name === "Default Combo Card");
        return defaultCombos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
            <p>No default combos created yet. Create your first default combo to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {defaultCombos.map((combo) => (
            <div
              key={combo.id}
              className={`rounded-lg border p-4 shadow-sm transition-all ${
                combo.isActive
                  ? "border-gray-200 bg-white"
                  : "border-gray-300 bg-gray-50 opacity-60"
              }`}
            >
              {/* Combo Image */}
              {combo.imageUrl && combo.imageUrl.trim() !== "" && (
                <div className="mb-3 w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <img
                    src={combo.imageUrl}
                    alt={combo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="text-xs text-gray-400 text-center p-4">Image failed to load</div>';
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900">{combo.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium border-purple-200 bg-purple-50 text-purple-700">
                      {combo.currency}
                    </span>
                    {!combo.isActive && (
                      <span className="text-xs text-gray-500">Inactive</span>
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={combo.isActive}
                    onChange={() => toggleMasterComboActive(combo.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">
                  {combo.storeNames.length} store{combo.storeNames.length !== 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {combo.storeNames.slice(0, 5).map((storeName) => (
                    <span
                      key={storeName}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium"
                    >
                      {storeName}
                    </span>
                  ))}
                  {combo.storeNames.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                      +{combo.storeNames.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(combo)}
                  className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(combo.id)}
                  className="px-3 py-1.5 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        );
      })()}

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowForm(false);
            setEditingCombo(null);
            setFormData({ name: "", currency: "USD", storeNames: [], isActive: true, imageUrl: "" });
          }}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingCombo ? "Edit Default Combo" : "Create Default Combo"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCombo(null);
                  setFormData({ name: "", currency: "USD", storeNames: [], isActive: true, imageUrl: "" });
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Combo Name <span className="text-red-500">*</span>
                    {editingCombo && (
                      <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Master Top 20"
                    disabled={!!editingCombo}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      editingCombo ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                  {!editingCombo && (
                    <p className="text-xs text-gray-500 mt-1">
                      This name cannot be changed after creation. Choose carefully.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => {
                      const newCurrency = e.target.value as Currency;
                      setFormData(prev => ({
                        ...prev,
                        currency: newCurrency,
                        storeNames: [],
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="USD">USD (US Stores)</option>
                    <option value="CAD">CAD (CA Stores)</option>
                    <option value="GBP">GBP (UK Stores)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Stores <span className="text-red-500">*</span>
                    </label>
                    {availableStores.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddAllStores}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium"
                      >
                        Add All ({availableStores.length})
                      </button>
                    )}
                  </div>
                  <div className="border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto bg-gray-50">
                    {availableStores.length === 0 ? (
                      <p className="text-sm text-gray-500">No stores available for this currency.</p>
                    ) : (
                      <div className="space-y-2">
                        {availableStores.map((store) => {
                          const countryMap: Record<Currency, Country> = {
                            USD: "US",
                            CAD: "CA",
                            GBP: "GB",
                          };
                          const country = countryMap[formData.currency];
                          const pricingType = getStorePricingType(store.name, country);
                          const fixedOptions = pricingType === "Fixed" ? getFixedPricingOptions(store.name, country) : "";
                          
                          return (
                            <label
                              key={store.name}
                              className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.storeNames.includes(store.name)}
                                onChange={() => toggleStore(store.name)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 flex-1">{store.name}</span>
                              {pricingType && (
                                <span
                                  className={`inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium cursor-help ${
                                    pricingType === "Variable"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-slate-200 bg-slate-50 text-slate-700"
                                  }`}
                                  title={pricingType === "Variable" ? "0-2000$" : fixedOptions}
                                >
                                  {pricingType}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {formData.storeNames.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.storeNames.length} store{formData.storeNames.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCombo(null);
                  setFormData({ name: "", currency: "USD", storeNames: [], isActive: true, imageUrl: "" });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingCombo ? handleUpdate : handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {editingCombo ? "Update Default Combo" : "Create Default Combo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


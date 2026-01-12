"use client";

import { useMemo, useState, useEffect } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import type { Fee, FeeType, Catalog, Store, Tenant } from "../_components/AdminDataProvider";

// Tenant-Catalog Features Section Component
function TenantCatalogFeaturesSection({ tenant, catalogId, stores }: { tenant: Tenant; catalogId: string; stores: Store[] }) {
  const {
    tenantCatalogFeatureFlags,
    setTenantCatalogFeatureFlag,
    tenantCatalogSelectedEvent,
    setTenantCatalogSelectedEvent,
    createTenantCatalogEvent,
    deleteTenantCatalogEvent,
    getTenantCatalogEvents,
    getEffectiveCatalogForTenant
  } = useAdminData();
  
  const events = getTenantCatalogEvents(tenant.id, catalogId);
  const selectedEventId = tenantCatalogSelectedEvent[tenant.id]?.[catalogId] || 'default';
  const [newEventName, setNewEventName] = useState("");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventNameError, setEventNameError] = useState("");
  
  const flags = tenantCatalogFeatureFlags[tenant.id]?.[catalogId] || {};
  const hasAnyFeature = flags.discounts || flags.order || flags.stores || flags.forceSupplier;

  const handleCreateEvent = () => {
    const trimmedName = newEventName.trim();
    if (!trimmedName) {
      setEventNameError("Event name cannot be empty");
      return;
    }
    
    // Check if event name already exists (case-insensitive)
    const nameExists = events.some(event => 
      event.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (nameExists) {
      setEventNameError("An event with this name already exists");
      return;
    }
    
    // Clear any previous error
    setEventNameError("");
    createTenantCatalogEvent(tenant.id, catalogId, trimmedName);
    setNewEventName("");
    setShowCreateEvent(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm(`Are you sure you want to delete this event? All configurations (discounts, stores, order) for this event will be removed.`)) {
      deleteTenantCatalogEvent(tenant.id, catalogId, eventId);
    }
  };
  
  const enabledFeaturesCount = [
    flags.discounts,
    flags.order,
    flags.stores,
    flags.forceSupplier
  ].filter(Boolean).length;
  
  const handleRemoveTenant = () => {
    if (confirm(`Are you sure you want to remove "${tenant.name}" from Tenant-Specific Features? All customizations will be lost.`)) {
      // Disable all features to effectively remove the tenant
      setTenantCatalogFeatureFlag(tenant.id, catalogId, 'discounts', false);
      setTenantCatalogFeatureFlag(tenant.id, catalogId, 'order', false);
      setTenantCatalogFeatureFlag(tenant.id, catalogId, 'stores', false);
      setTenantCatalogFeatureFlag(tenant.id, catalogId, 'forceSupplier', false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-base text-gray-900">{tenant.name}</div>
              <div className="text-xs text-gray-600">{tenant.country}</div>
            </div>
            {enabledFeaturesCount > 0 && (
              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {enabledFeaturesCount} {enabledFeaturesCount === 1 ? 'feature' : 'features'} enabled
              </div>
            )}
          </div>
          <button
            onClick={handleRemoveTenant}
            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-xs font-medium border border-red-200 transition-colors"
            title="Remove tenant from features"
          >
            Remove
          </button>
        </div>
      </div>
      
      {/* Event Selector */}
      <div className="px-4 py-3 border-b border-gray-200 bg-purple-50">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Event</label>
          {!showCreateEvent && (
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
            >
              + New Event
            </button>
          )}
        </div>
        
        {showCreateEvent && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newEventName}
                onChange={(e) => {
                  setNewEventName(e.target.value);
                  setEventNameError(""); // Clear error when user types
                }}
                placeholder="Event name..."
                className={`flex-1 px-2 py-1 text-xs border rounded ${
                  eventNameError 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateEvent()}
              />
              <button
                onClick={handleCreateEvent}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateEvent(false);
                  setNewEventName("");
                  setEventNameError("");
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
            {eventNameError && (
              <div className="mt-1 text-xs text-red-600">
                {eventNameError}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setTenantCatalogSelectedEvent(tenant.id, catalogId, e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          
          {selectedEventId !== 'default' && (
            <button
              onClick={() => handleDeleteEvent(selectedEventId)}
              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-600">
          Each event can have its own discounts, stores, and order configuration.
        </div>
      </div>
      
      {/* Feature Toggles */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Feature Toggles</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={flags.discounts || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'discounts', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Discounts</span>
            {flags.discounts && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>}
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={flags.order || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'order', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Order</span>
            {flags.order && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>}
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={flags.stores || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'stores', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Stores</span>
            {flags.stores && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>}
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={flags.forceSupplier || false}
              onChange={(e) => setTenantCatalogFeatureFlag(tenant.id, catalogId, 'forceSupplier', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Force Supplier</span>
            {flags.forceSupplier && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>}
          </label>
        </div>
      </div>
      
      {/* Feature Sections */}
      <div className="p-4 space-y-3">
        {!hasAnyFeature && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-sm text-gray-500 mb-1">No features enabled</div>
            <div className="text-xs text-gray-400">Enable features above to customize this tenant's catalog settings</div>
          </div>
        )}
        
        {flags.discounts && (
          <div className="border-l-4 border-blue-500 pl-3">
            <TenantCatalogDiscountsSection tenant={tenant} catalogId={catalogId} eventId={selectedEventId} stores={stores} />
          </div>
        )}
        
        {flags.order && (
          <div className="border-l-4 border-purple-500 pl-3">
            <TenantCatalogOrderSection tenant={tenant} catalogId={catalogId} eventId={selectedEventId} />
          </div>
        )}
        
        {flags.stores && (
          <div className="border-l-4 border-orange-500 pl-3">
            <TenantCatalogStoresSection tenant={tenant} catalogId={catalogId} eventId={selectedEventId} />
          </div>
        )}
        
        {flags.forceSupplier && (
          <div className="border-l-4 border-red-500 pl-3">
            <TenantCatalogForceSupplierSection tenant={tenant} catalogId={catalogId} />
          </div>
        )}
      </div>
    </div>
  );
}

function TenantCatalogDiscountsSection({ tenant, catalogId, eventId, stores }: { tenant: Tenant; catalogId: string; eventId: string; stores: Store[] }) {
  const { 
    tenantCatalogEvents, 
    setTenantCatalogStoreDiscount
  } = useAdminData();
  
  const catalogEvents = tenantCatalogEvents[tenant.id]?.[catalogId] || {};
  // If event doesn't exist yet (especially default), use empty structure
  // It will be created automatically when first discount is set
  const eventData = catalogEvents[eventId] || { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
  const catalogDiscounts = eventData.discounts || {};
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
                      onChange={(e) => setTenantCatalogStoreDiscount(tenant.id, catalogId, eventId, storeName, parseInt(e.target.value || '0', 10))}
                      className="input-sm w-20 h-7"
                    />
                    <span className="text-xs text-gray-500">%</span>
                    <button
                      onClick={() => setTenantCatalogStoreDiscount(tenant.id, catalogId, eventId, storeName, 0)}
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
                      setTenantCatalogStoreDiscount(tenant.id, catalogId, eventId, store.name, 5);
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

function TenantCatalogOrderSection({ tenant, catalogId, eventId }: { tenant: Tenant; catalogId: string; eventId: string }) {
  const { getEffectiveCatalogForTenant, updateTenantCatalogStoreOrder, tenantCatalogEvents } = useAdminData();
  const [expanded, setExpanded] = useState(false);
  const catalogEvents = tenantCatalogEvents[tenant.id]?.[catalogId] || {};
  const eventData = catalogEvents[eventId] || { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
  const customOrder = eventData.order || [];
  const hasCustomOrder = customOrder.length > 0;
  
  const effectiveCatalog = getEffectiveCatalogForTenant(tenant.id, catalogId);
  const currentStoreOrder = effectiveCatalog.stores.map(s => s.name);
  
  const handleMoveStore = (storeName: string, direction: 'up' | 'down') => {
    const order = hasCustomOrder ? [...customOrder] : [...currentStoreOrder];
    const index = order.indexOf(storeName);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    updateTenantCatalogStoreOrder(tenant.id, catalogId, eventId, order);
  };
  
  const handleResetOrder = () => {
    updateTenantCatalogStoreOrder(tenant.id, catalogId, eventId, []);
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

function TenantCatalogStoresSection({ tenant, catalogId, eventId }: { tenant: Tenant; catalogId: string; eventId: string }) {
  const {
    getEffectiveCatalog,
    comboInstances,
    getComboInstancesForCatalog,
    tenantCatalogEvents,
    addTenantCatalogStore,
    removeTenantCatalogStore,
    addTenantCatalogComboInstance,
    removeTenantCatalogComboInstance,
    stores,
    catalogs
  } = useAdminData();
  
  const [expanded, setExpanded] = useState(false);
  const catalog = getEffectiveCatalog(catalogId);
  const catalogComboInstances = getComboInstancesForCatalog(catalogId);
  const catalogEvents = tenantCatalogEvents[tenant.id]?.[catalogId] || {};
  // If event doesn't exist yet (especially default), use empty structure
  // It will be created automatically when first store is added
  const eventData = catalogEvents[eventId] || { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
  const tenantStoresRaw = eventData.stores;
  
  // Ensure we always have valid arrays, filter out any invalid entries
  // Also filter out stores/combo instances that no longer exist in the catalog
  const tenantStores = {
    stores: Array.isArray(tenantStoresRaw?.stores) 
      ? tenantStoresRaw.stores.filter(Boolean).filter(storeName => 
          catalog.stores.some(s => s.name === storeName)
        )
      : [],
    comboInstances: Array.isArray(tenantStoresRaw?.comboInstances) 
      ? tenantStoresRaw.comboInstances.filter(Boolean).filter(comboInstanceId => 
          catalogComboInstances.some(ci => ci.id === comboInstanceId)
        )
      : []
  };
  
  // Get available stores (stores in catalog but not in tenant's list)
  const availableStores = catalog.stores.filter(store => !tenantStores.stores.includes(store.name));
  
  // Get available combo instances (combo instances in catalog but not in tenant's list)
  const availableComboInstances = catalogComboInstances.filter(ci => !tenantStores.comboInstances.includes(ci.id));
  
  return (
    <div className="expandable-section mt-2">
      <button onClick={() => setExpanded(!expanded)} className="expandable-header">
        <span>Stores & Combos</span>
        <span className="badge badge-primary text-[10px]">
          {tenantStores.stores.length + tenantStores.comboInstances.length} / {catalog.stores.length + catalogComboInstances.length}
        </span>
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="expandable-content">
          {/* Current Stores & Combos */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Current Stores & Combos ({tenantStores.stores.length + tenantStores.comboInstances.length})
            </div>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-white p-2 space-y-1">
              {/* Regular Stores */}
              {tenantStores.stores.map(storeName => {
                const store = catalog.stores.find(s => s.name === storeName);
                if (!store) return null;
                return (
                  <div key={`tenant-store-${tenant.id}-${catalogId}-${storeName}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{storeName}</span>
                    <button
                      onClick={() => removeTenantCatalogStore(tenant.id, catalogId, eventId, storeName)}
                      className="px-2 py-0.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {/* Combo Instances */}
              {tenantStores.comboInstances.map(comboInstanceId => {
                const comboInstance = catalogComboInstances.find(ci => ci.id === comboInstanceId);
                if (!comboInstance) return null;
                return (
                  <div key={`tenant-combo-${tenant.id}-${catalogId}-${comboInstanceId}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{comboInstance.displayName}</span>
                      <span className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px]">Combo</span>
                    </div>
                    <button
                      onClick={() => removeTenantCatalogComboInstance(tenant.id, catalogId, eventId, comboInstanceId)}
                      className="px-2 py-0.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {tenantStores.stores.length === 0 && tenantStores.comboInstances.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  No stores or combos assigned. Add them below.
                </div>
              )}
            </div>
          </div>
          
          {/* Available Stores & Combos */}
          {(availableStores.length > 0 || availableComboInstances.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-700">
                  Available Stores & Combos ({availableStores.length + availableComboInstances.length})
                </div>
                <button
                  onClick={() => {
                    // Add all available stores
                    availableStores.forEach(store => {
                      addTenantCatalogStore(tenant.id, catalogId, eventId, store.name);
                    });
                    // Add all available combo instances
                    availableComboInstances.forEach(comboInstance => {
                      addTenantCatalogComboInstance(tenant.id, catalogId, eventId, comboInstance.id);
                    });
                  }}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs font-medium"
                >
                  Add All
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-white p-2 space-y-1">
                {/* Regular Stores */}
                {availableStores.map(store => (
                  <div key={`available-store-${tenant.id}-${catalogId}-${store.name}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{store.name}</span>
                    <button
                      onClick={() => addTenantCatalogStore(tenant.id, catalogId, eventId, store.name)}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Add
                    </button>
                  </div>
                ))}
                {/* Combo Instances */}
                {availableComboInstances.map(comboInstance => (
                  <div key={`available-combo-${tenant.id}-${catalogId}-${comboInstance.id}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{comboInstance.displayName}</span>
                      <span className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px]">Combo</span>
                    </div>
                    <button
                      onClick={() => addTenantCatalogComboInstance(tenant.id, catalogId, eventId, comboInstance.id)}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TenantCatalogForceSupplierSection({ tenant, catalogId }: { tenant: Tenant; catalogId: string }) {
  const {
    tenantCatalogForcedSupplier,
    setTenantCatalogForcedSupplier,
    getEffectiveCatalogForTenant
  } = useAdminData();
  
  const forcedSupplier = tenantCatalogForcedSupplier[tenant.id]?.[catalogId] ?? null;
  
  // Get the effective catalog for this tenant (applies all filters including forced supplier)
  const effectiveCatalog = getEffectiveCatalogForTenant(tenant.id, catalogId);
  const availableStoresCount = effectiveCatalog.stores.length;
  
  return (
    <div className="expandable-section mt-2">
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="text-xs font-medium text-blue-800 mb-2">
          Force Supplier
        </div>
        <div className="text-xs text-blue-700 mb-3">
          This tenant will only be able to select stores from the selected supplier.
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Select Supplier
          </label>
          <select
            value={forcedSupplier ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setTenantCatalogForcedSupplier(tenant.id, catalogId, value === "" ? null : parseInt(value));
            }}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">No supplier forced</option>
            <option value="1">Supplier 1</option>
            <option value="2">Supplier 2</option>
            <option value="3">Supplier 3</option>
            <option value="4">Supplier 4</option>
            <option value="5">Supplier 5</option>
          </select>
        </div>
        {forcedSupplier !== null && (
          <div className="mt-3 p-2 bg-white border border-blue-300 rounded">
            <div className="text-xs text-blue-800 mb-1">
              <strong>Supplier {forcedSupplier}</strong> is forced for this tenant.
            </div>
            <div className="text-xs font-semibold text-blue-900">
              Available Stores: <span className="text-base">{availableStoresCount}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Tenant will only be able to select from these {availableStoresCount} stores.
            </div>
          </div>
        )}
      </div>
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
    addStoreToCatalog,
    createComboInstance,
    getComboInstancesForCatalog,
    deleteComboInstance,
    comboInstances,
    setStoreDiscount, 
    setStoreCSS, 
    setStoreFee, 
    setCatalogFee, 
    moveStoreInCatalog, 
    getEffectiveCatalog, 
    getTenantsForCatalog, 
    tenants,
    setTenantCatalogStoreDiscount,
    updateTenantCatalogStoreOrder,
    tenantCatalogFeatureFlags,
    setTenantCatalogFeatureFlag,
    getEffectiveCatalogForTenant,
    activeCatalogByTenant,
    isStoreActive,
    storeSuppliers
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
          const isActiveCatalog = Object.values(activeCatalogByTenant).includes(catalog.id);
          // Get total stores count (including inactive) from the base catalog
          const totalStoresCount = catalog.stores.length;
          const activeStoresCount = effectiveCatalog.stores.length;
          
          return (
            <div key={catalog.id} className={`border rounded-lg bg-white ${isActiveCatalog ? 'border-blue-500 border-2' : 'border-gray-200'}`}>
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
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded" title={`${activeStoresCount} active out of ${totalStoresCount} total stores`}>
                        {activeStoresCount} / {totalStoresCount} stores
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                        {getTenantsForCatalog(catalog.id).length} tenants
                      </span>
                      {isActiveCatalog && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!effectiveCatalog.catalogFee && (
                      <button
                        onClick={() => setCatalogFee(catalog.id, { type: 'percentage', value: 5 })}
                        className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200"
                      >
                        + Add Catalog-Level Discount
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Catalog Content - Only show when expanded */}
                {isCatalogExpanded && (
                  <>
                    {/* Catalog-level Discount */}
                    {effectiveCatalog.catalogFee && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catalog-Level Discount</label>
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
                            Remove Discount
                          </button>
                        </div>
                      </div>
                    )}

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
                        {(() => {
                          const catalogComboInstances = getComboInstancesForCatalog(catalog.id);
                          const totalStores = (effectiveCatalogs[catalog.id]?.stores.length || 0) + catalogComboInstances.length;
                          
                          return (
                            <>
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                Current Stores ({totalStores})
                              </div>
                              <div className="max-h-44 overflow-y-auto border border-gray-200 rounded bg-white p-2">
                                <div className="space-y-1">
                                  {/* Combo Instances */}
                                  {catalogComboInstances.map((comboInstance) => (
                                    <div key={`combo-instance-${catalog.id}-${comboInstance.id}`} className="space-y-1 border-b border-gray-100 pb-2 last:border-b-0">
                                      <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{comboInstance.displayName}</span>
                                          <span className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px]">Combo</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to remove "${comboInstance.displayName}" from this catalog?`)) {
                                              deleteComboInstance(comboInstance.id);
                                            }
                                          }}
                                          className="px-2 py-0.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {/* Regular stores */}
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
                                            {/* Supplier Availability */}
                                            <div className="mb-2">
                                              <label className="block text-[11px] text-gray-600 mb-1">Supplier Availability</label>
                                              <div className="flex items-center gap-2 flex-wrap">
                                                {[1, 2, 3, 4, 5].map(supplierId => {
                                                  const storeKey = `${store.country}-${store.name}`;
                                                  const supplierData = storeSuppliers[storeKey];
                                                  const offeringSuppliers = supplierData?.offeringSuppliers || [1, 2, 3, 4, 5];
                                                  const isAvailable = offeringSuppliers.includes(supplierId);
                                                  
                                                  return (
                                                    <div key={supplierId} className="flex items-center gap-1">
                                                      <span className="text-[10px] text-gray-500">S{supplierId}:</span>
                                                      <span className={`text-[10px] font-medium ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {isAvailable ? 'Available' : 'N/A'}
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
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
                            </>
                          );
                        })()}
                      </div>
                      
                      {/* Available stores not in catalog */}
                      {(() => {
                        const effective = effectiveCatalogs[catalog.id];
                        const storesInCatalog = new Set(effective?.stores.map(s => s.name) || []);
                        
                        // Get available regular stores
                        const availableStores = stores
                          .filter(s => s.country === catalog.country && isStoreActive(s.name, s.country))
                          .filter(s => !storesInCatalog.has(s.name));
                        
                        // Get available Default Combo Cards (matching currency)
                        // Check if combo instance already exists for this catalog
                        const existingComboInstances = getComboInstancesForCatalog(catalog.id);
                        const existingMasterComboIds = new Set(existingComboInstances.map(ci => ci.masterComboId).filter(Boolean));
                        const existingComboInstanceNames = new Set(existingComboInstances.map(ci => ci.displayName));
                        
                        const availableDefaultCombos = masterCombos
                          .filter(mc => mc.name === "Default Combo Card" && mc.currency === catalog.currency && mc.isActive)
                          .filter(mc => !existingMasterComboIds.has(mc.id));
                        
                        // Get available combo instances from other catalogs (same currency) that can be added to this catalog
                        const availableComboInstances = comboInstances
                          .filter(ci => {
                            const ciCatalog = catalogs.find(c => c.id === ci.catalogId);
                            return ciCatalog && 
                                   ciCatalog.currency === catalog.currency && 
                                   ci.catalogId !== catalog.id &&
                                   !existingComboInstanceNames.has(ci.displayName) &&
                                   ci.isActive;
                          });
                        
                        const totalAvailable = availableStores.length + availableDefaultCombos.length + availableComboInstances.length;
                        
                        if (totalAvailable === 0) return null;
                        
                        return (
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Available Stores ({totalAvailable})
                            </div>
                            <div className="max-h-44 overflow-y-auto border border-gray-200 rounded bg-white p-2">
                              <div className="space-y-1">
                                {/* Existing Combo Instances from other catalogs */}
                                {availableComboInstances.map((comboInstance) => (
                                  <div key={`available-combo-instance-${catalog.id}-${comboInstance.id}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">{comboInstance.displayName}</span>
                                      <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">Combo</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        // Create a new combo instance for this catalog based on the existing one
                                        createComboInstance({
                                          catalogId: catalog.id,
                                          masterComboId: comboInstance.masterComboId,
                                          displayName: comboInstance.displayName,
                                          customStoreNames: comboInstance.customStoreNames,
                                          imageUrl: comboInstance.imageUrl,
                                          denominations: comboInstance.denominations,
                                          isActive: comboInstance.isActive,
                                        });
                                      }}
                                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                                    >
                                      Add
                                    </button>
                                  </div>
                                ))}
                                {/* Default Combo Cards */}
                                {availableDefaultCombos.map((combo) => (
                                  <div key={`available-combo-${catalog.id}-${combo.id}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">{combo.name}</span>
                                      <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">Default Combo</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        // Create a combo instance for this catalog
                                        createComboInstance({
                                          catalogId: catalog.id,
                                          masterComboId: combo.id,
                                          displayName: combo.name,
                                          customStoreNames: null,
                                          denominations: [25, 50, 100],
                                          isActive: true,
                                        });
                                      }}
                                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                                    >
                                      Add
                                    </button>
                                  </div>
                                ))}
                                {/* Regular stores */}
                                {availableStores.map((store) => (
                                  <div key={`available-${catalog.id}-${store.name}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0">
                                    <span className="font-medium text-gray-700">{store.name}</span>
                                    <button
                                      onClick={() => addStoreToCatalog(catalog.id, store.name)}
                                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                                    >
                                      Add
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Tenant-Specific Features Section */}
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-800">Tenant-Specific Features</h4>
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    Configure discounts, store order, stores, and supplier settings for specific tenants using this catalog.
                  </div>
                  
                  {/* Tenants with Features Enabled */}
                  {(() => {
                    const tenantsWithFeatures = getTenantsForCatalog(catalog.id).filter(tenant => {
                      const flags = tenantCatalogFeatureFlags[tenant.id]?.[catalog.id];
                      return flags && (flags.discounts || flags.order || flags.stores || flags.forceSupplier);
                    });
                    
                    if (tenantsWithFeatures.length === 0) {
                      return (
                        <div className="text-xs text-gray-500 p-2 bg-white rounded border border-gray-200 mb-3">
                          No tenants with features enabled. Add a tenant below to configure features.
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4 mb-3">
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
                  
                  {/* Add Tenant to Features */}
                  <div>
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
                            // Only show tenants that don't already have any features enabled
                            const flags = tenantCatalogFeatureFlags[tenant.id]?.[catalog.id];
                            return !flags || (!flags.discounts && !flags.order && !flags.stores && !flags.forceSupplier);
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
                </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import CreateButton from "../_components/CreateButton";

type Country = "US" | "CA" | "GB";

type Store = { 
  id: string;
  name: string; 
  country: Country;
  isActive: boolean;
  isCombo?: boolean;
  isComboInstance?: boolean;
  comboInstanceId?: string;
  storeType: "Close" | "Open" | "Combo";
};


const topUSBrands = [
  "Amazon", "Apple", "Google", "Microsoft", "Walmart", "Coca-Cola", "Disney", "Nike", "McDonald's", "Starbucks",
  "Facebook", "Tesla", "AT&T", "Verizon", "Target", "Home Depot", "Costco", "UPS", "FedEx", "IBM",
  "Intel", "Oracle", "Cisco", "Adobe", "Netflix", "PayPal", "Visa", "Mastercard", "American Express", "JPMorgan Chase",
  "Bank of America", "Wells Fargo", "Goldman Sachs", "Morgan Stanley", "Citigroup", "Ford", "General Motors", "Chevrolet", "Toyota", "Honda",
  "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Hyundai", "Kia", "Nissan", "Subaru", "Mazda", "Jeep",
  "Dodge", "Ram", "GMC", "Cadillac", "Buick", "Lincoln", "Chrysler", "Pepsi", "PepsiCo", "Frito-Lay",
  "Taco Bell", "KFC", "Pizza Hut", "Burger King", "Subway", "Domino's", "Dunkin'", "Chipotle", "Panera Bread", "Olive Garden",
  "Red Lobster", "Outback Steakhouse", "Applebee's", "TGI Friday's", "Buffalo Wild Wings", "Hooters", "IHOP", "Denny's", "Waffle House", "Cracker Barrel",
  "Best Buy", "Lowe's", "Macy's", "Kohl's", "Nordstrom", "TJ Maxx", "Marshalls", "Ross", "Burlington", "Dillard's",
  "Sephora", "Ulta", "CVS", "Walgreens", "Rite Aid", "Kroger", "Safeway", "Albertsons", "Whole Foods", "Trader Joe's",
  "Publix", "Wegmans", "H-E-B", "Meijer", "Giant Eagle", "Stop & Shop", "Food Lion", "Harris Teeter", "Hy-Vee", "King Soopers",
];

const topUKBrands = [
  "Tesco", "Sainsbury's", "Asda", "Morrisons", "Aldi", "Lidl", "Marks & Spencer", "Waitrose", "Co-op", "Iceland",
  "Boots", "Superdrug", "Lloyds Pharmacy", "HSBC", "Barclays", "NatWest", "Lloyds Bank", "Santander UK", "Nationwide", "TSB",
  "British Airways", "EasyJet", "Ryanair", "Virgin Atlantic", "TUI", "Thomas Cook", "FirstGroup", "Stagecoach", "National Express", "Arriva",
  "BT", "Vodafone UK", "EE", "O2", "Three UK", "Sky", "Virgin Media", "TalkTalk", "Plusnet", "BT Sport",
];

const topCABrands = [
  "Loblaws", "Sobeys", "Metro", "Canadian Tire", "Shoppers Drug Mart", "Rexall", "London Drugs", "Costco Canada", "Walmart Canada", "Home Depot Canada",
];

function generateStores(): Store[] {
  const stores: Store[] = [];
  
  // Stores that must be available in all three currencies (USD, GBP, CAD)
  const multiCurrencyStores = [
    "Burger King",
    "Airbnb",
    "Amazon",
    "Booking.com",
    "Domino's",
    "Disney",
    "McDonald's",
    "Mastercard",
    "Netflix",
    "Nike"
  ];
  
  // First, add multi-currency stores for all three countries
  let storeIdCounter = 1;
  multiCurrencyStores.forEach(brandName => {
    const storeType: "Close" | "Open" | "Combo" = brandName.toLowerCase().includes("visa") ? "Open" : "Close";
    
    // Add for US (USD)
    stores.push({
      id: `us-${storeIdCounter++}`,
      name: brandName,
      country: "US",
      isActive: true,
      storeType,
    });
    
    // Add for CA (CAD)
    stores.push({
      id: `ca-${storeIdCounter++}`,
      name: brandName,
      country: "CA",
      isActive: true,
      storeType,
    });
    
    // Add for GB (GBP)
    stores.push({
      id: `gb-${storeIdCounter++}`,
      name: brandName,
      country: "GB",
      isActive: true,
      storeType,
    });
  });
  
  // Then add remaining US stores (excluding multi-currency ones already added)
  const usBrandsToAdd = topUSBrands.filter(brand => !multiCurrencyStores.includes(brand));
  for (let i = 0; i < 110; i++) {
    const brandName = usBrandsToAdd[i % usBrandsToAdd.length];
    const storeType: "Close" | "Open" | "Combo" = brandName.toLowerCase().includes("visa") ? "Open" : "Close";
    stores.push({
      id: `us-${storeIdCounter++}`,
      name: brandName,
      country: "US",
      isActive: true,
      storeType,
    });
  }
  
  // Then add remaining UK stores (excluding multi-currency ones already added)
  const ukBrandsToAdd = topUKBrands.filter(brand => !multiCurrencyStores.includes(brand));
  for (let i = 0; i < 40; i++) {
    const brandName = ukBrandsToAdd[i % ukBrandsToAdd.length];
    const storeType: "Close" | "Open" | "Combo" = brandName.toLowerCase().includes("visa") ? "Open" : "Close";
    stores.push({
      id: `gb-${storeIdCounter++}`,
      name: brandName,
      country: "GB",
      isActive: true,
      storeType,
    });
  }
  
  // Add some CA stores (excluding multi-currency ones already added)
  const caBrandsToAdd = [...usBrandsToAdd, ...ukBrandsToAdd].filter(brand => !multiCurrencyStores.includes(brand));
  for (let i = 0; i < 30; i++) {
    const brandName = caBrandsToAdd[i % caBrandsToAdd.length];
    const storeType: "Close" | "Open" | "Combo" = brandName.toLowerCase().includes("visa") ? "Open" : "Close";
    stores.push({
      id: `ca-${storeIdCounter++}`,
      name: brandName,
      country: "CA",
      isActive: true,
      storeType,
    });
  }
  
  return stores;
}

export default function StoresPage() {
  const { 
    stores: adminStores, 
    isStoreActive, 
    toggleStoreActive,
    combos,
    toggleComboActive,
    masterCombos,
    comboInstances,
    catalogs,
    createComboInstance,
    updateComboInstance,
    deleteComboInstance,
    getMasterCombo,
    getComboInstanceStores,
    duplicateComboInstance,
    duplicateStore,
    storeSuppliers,
    setStoreSupplierDiscount,
    setStoreSelectedSupplier,
    setStoreSecondarySupplier,
    getStoreSupplierData,
    getStoreContent,
    setStoreContent,
    getStoreImage,
    setStoreImage,
    getStoreExpirationDate,
    getComboInstanceDiscount,
    setComboInstanceDiscount,
    getComboInstanceExpirationDate,
    setComboInstanceExpirationDate,
    addStoreToCatalog
  } = useAdminData();
  
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [storeTypeFilter, setStoreTypeFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [supplierModalOpen, setSupplierModalOpen] = useState<Record<string, boolean>>({});
  const [selectedCurrencyForStore, setSelectedCurrencyForStore] = useState<Record<string, Currency>>({}); // storeName -> selected currency tab
  const [contentModalOpen, setContentModalOpen] = useState<Record<string, boolean>>({});
  const [contentFormData, setContentFormData] = useState<Record<string, { description: string; termsAndConditions: string }>>({});
  const [imageModalOpen, setImageModalOpen] = useState<Record<string, boolean>>({});
  const [imageFormData, setImageFormData] = useState<Record<string, string>>({});
  const [comboEditModalOpen, setComboEditModalOpen] = useState<Record<string, boolean>>({});
  const [comboEditStoreNames, setComboEditStoreNames] = useState<Record<string, string[]>>({});
  const [dbCardsModalOpen, setDbCardsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingComboInstance, setEditingComboInstance] = useState<string | null>(null);
  const [duplicateStoreName, setDuplicateStoreName] = useState<Record<string, string>>({});
  const [duplicateComboName, setDuplicateComboName] = useState<Record<string, string>>({});
  const [showDuplicateStoreModal, setShowDuplicateStoreModal] = useState<Record<string, boolean>>({});
  const [showDuplicateComboModal, setShowDuplicateComboModal] = useState<Record<string, boolean>>({});
  const [storeFormData, setStoreFormData] = useState({
    storeType: "regular" as "regular" | "combo",
    storeName: "",
    country: "US" as Country,
    currency: "USD" as "USD" | "CAD" | "GBP",
    catalogId: "",
    masterComboId: "" as string | null,
    customStoreNames: [] as string[],
    imageUrl: "",
    denominations: [25, 50, 100] as number[],
    isActive: true,
    supplierMargins: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
    offeringSuppliers: [1, 2, 3, 4, 5] as number[],
    selectedSupplier: null as number | null,
    secondarySupplier: null as number | null,
  });
  
  // Group stores by name (one store can be configured for multiple currencies)
  const groupedStores = useMemo(() => {
    const groups: Record<string, {
      name: string;
      currencies: Currency[];
      storeType: "Close" | "Open" | "Combo";
      isComboInstance?: boolean;
      comboInstanceId?: string;
    }> = {};
    
    // Group regular stores by name
    adminStores.forEach(s => {
      const storeType: "Close" | "Open" | "Combo" = s.name.toLowerCase().includes("visa") ? "Open" : "Close";
      const currency: Currency = s.country === "US" ? "USD" : s.country === "CA" ? "CAD" : "GBP";
      
      if (!groups[s.name]) {
        groups[s.name] = {
          name: s.name,
          currencies: [],
          storeType,
        };
      }
      if (!groups[s.name].currencies.includes(currency)) {
        groups[s.name].currencies.push(currency);
      }
    });
    
    // Add combo instances
    comboInstances.forEach(instance => {
      const catalog = catalogs.find(c => c.id === instance.catalogId);
      const currency: Currency = catalog?.currency || "USD";
      
      if (!groups[instance.displayName]) {
        groups[instance.displayName] = {
          name: instance.displayName,
          currencies: [],
          storeType: "Combo",
          isComboInstance: true,
          comboInstanceId: instance.id,
        };
      }
      if (!groups[instance.displayName].currencies.includes(currency)) {
        groups[instance.displayName].currencies.push(currency);
      }
    });
    
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [adminStores, comboInstances, catalogs]);
  
  const stores: Store[] = useMemo(() => {
    // For backward compatibility, still create individual store entries
    // but we'll display them grouped in the UI
    const regularStores = adminStores.map(s => {
      const storeType: "Close" | "Open" | "Combo" = s.name.toLowerCase().includes("visa") ? "Open" : "Close";
      
      return {
        id: `${s.country.toLowerCase()}-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: s.name,
        country: s.country,
        isActive: isStoreActive(s.name, s.country),
        isCombo: false,
        storeType,
      };
    });
    
    const comboInstanceStores = comboInstances.map(instance => {
      const catalog = catalogs.find(c => c.id === instance.catalogId);
      const country = catalog?.country || 'US';
      
      return {
        id: `combo-instance-${instance.id}`,
        name: instance.displayName,
        country: country,
        isActive: instance.isActive,
        isCombo: true,
        isComboInstance: true,
        comboInstanceId: instance.id,
        storeType: "Combo" as const,
      };
    });
    
    const allStores = [...regularStores, ...comboInstanceStores];
    return allStores.sort((a, b) => a.name.localeCompare(b.name));
  }, [adminStores, isStoreActive, comboInstances, catalogs]);

  // Filter grouped stores by currency, store type, and selected supplier
  const filteredGroupedStores = useMemo(() => {
    let filtered = groupedStores;
    
    // Filter by currency
    if (currencyFilter !== "all") {
      filtered = filtered.filter(group => 
        group.currencies.includes(currencyFilter as Currency)
      );
    }
    
    // Filter by store type
    if (storeTypeFilter !== "all") {
      filtered = filtered.filter(group => group.storeType === storeTypeFilter);
    }
    
    // Filter by selected supplier
    if (supplierFilter !== "all" && !filtered.some(g => g.isComboInstance)) {
      if (supplierFilter === "none") {
        filtered = filtered.filter(group => {
          if (group.isComboInstance) return false;
          // Check if any currency has no supplier selected
          return group.currencies.some(currency => {
            const supplierData = getStoreSupplierData(group.name, currency);
            return !supplierData || supplierData.selectedSupplier === null;
          });
        });
      } else {
        const supplierId = parseInt(supplierFilter);
        filtered = filtered.filter(group => {
          if (group.isComboInstance) return false;
          // Check if any currency has this supplier selected
          return group.currencies.some(currency => {
            const supplierData = getStoreSupplierData(group.name, currency);
            return supplierData?.selectedSupplier === supplierId;
          });
        });
      }
    }
    
    return filtered;
  }, [groupedStores, currencyFilter, storeTypeFilter, supplierFilter, getStoreSupplierData]);
  
  // Keep filteredStores for backward compatibility with modals
  const filteredStores = useMemo(() => {
    let filtered = stores;
    
    // Filter by currency
    if (currencyFilter !== "all") {
      filtered = filtered.filter(store => {
        if (store.isComboInstance) {
          const instance = comboInstances.find(ci => ci.id === store.comboInstanceId);
          if (instance) {
            const catalog = catalogs.find(c => c.id === instance.catalogId);
            return catalog?.currency === currencyFilter;
          }
          return false;
        } else {
          const countryToCurrency: Record<Country, string> = {
            "US": "USD",
            "CA": "CAD",
            "GB": "GBP"
          };
          return countryToCurrency[store.country] === currencyFilter;
        }
      });
    }
    
    // Filter by store type
    if (storeTypeFilter !== "all") {
      filtered = filtered.filter(store => store.storeType === storeTypeFilter);
    }
    
    // Filter by selected supplier
    if (supplierFilter !== "all") {
      if (supplierFilter === "none") {
        filtered = filtered.filter(store => {
          if (store.isComboInstance) return false;
          const currency: Currency = store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP";
          const supplierData = getStoreSupplierData(store.name, currency);
          return !supplierData || supplierData.selectedSupplier === null;
        });
      } else {
        const supplierId = parseInt(supplierFilter);
        filtered = filtered.filter(store => {
          if (store.isComboInstance) return false;
          const currency: Currency = store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP";
          const supplierData = getStoreSupplierData(store.name, currency);
          return supplierData?.selectedSupplier === supplierId;
        });
      }
    }
    
    return filtered;
  }, [stores, currencyFilter, storeTypeFilter, supplierFilter, comboInstances, catalogs, getStoreSupplierData]);

  // DB Cards data structure
  type DBCardData = {
    storeName: string;
    qtyInDB: number;
    value: number;
  };
  
  // Generate dummy DB cards data (deterministic based on store name)
  const dbCardsData: DBCardData[] = useMemo(() => {
    const data: DBCardData[] = [];
    const stores = filteredStores.filter(s => !s.isComboInstance);
    
    stores.forEach(store => {
      // Use deterministic hash based on store name for consistent data
      const hashKey = `${store.country}-${store.name}`;
      let hash = 0;
      for (let i = 0; i < hashKey.length; i++) {
        hash = (hash * 31 + hashKey.charCodeAt(i)) | 0;
      }
      
      // Generate deterministic quantity between 10 and 500
      const qty = (Math.abs(hash) % 490) + 10;
      // Generate deterministic value per card between $5 and $200
      const valuePerCard = ((Math.abs(hash * 7) % 195) + 5);
      const totalValue = qty * valuePerCard;
      
      data.push({
        storeName: store.name,
        qtyInDB: qty,
        value: totalValue
      });
    });
    
    // Sort by store name alphabetically
    return data.sort((a, b) => a.storeName.localeCompare(b.storeName));
  }, [filteredStores]);
  
  const totalDBCards = useMemo(() => {
    return dbCardsData.reduce((sum, card) => sum + card.qtyInDB, 0);
  }, [dbCardsData]);
  
  const totalValueOfCards = useMemo(() => {
    return dbCardsData.reduce((sum, card) => sum + card.value, 0);
  }, [dbCardsData]);

  const handleToggleStoreActive = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      if (store.isComboInstance) {
        // Toggle combo instance active state
        const instance = comboInstances.find(ci => ci.id === store.comboInstanceId);
        if (instance) {
          updateComboInstance(instance.id, { isActive: !instance.isActive });
        }
      } else {
        toggleStoreActive(store.name, store.country);
      }
    }
  };
  
  // Populate form when editing
  useEffect(() => {
    if (editingStore && showStoreForm) {
      const storeKey = `${editingStore.country}-${editingStore.name}`;
      const supplierData = storeSuppliers[storeKey] || { selectedSupplier: null, secondarySupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
      const currency = editingStore.country === "US" ? "USD" : editingStore.country === "CA" ? "CAD" : "GBP";
      
      setStoreFormData({
        storeType: "regular",
        storeName: editingStore.name,
        country: editingStore.country,
        currency,
        catalogId: "",
        masterComboId: null,
        customStoreNames: [],
        imageUrl: "",
        denominations: [25, 50, 100],
        isActive: editingStore.isActive,
        supplierMargins: supplierData.discounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        offeringSuppliers: supplierData.offeringSuppliers || [1, 2, 3, 4, 5],
        selectedSupplier: supplierData.selectedSupplier,
        secondarySupplier: supplierData.secondarySupplier,
      });
    } else if (editingComboInstance && showStoreForm) {
      const instance = comboInstances.find(ci => ci.id === editingComboInstance);
      if (instance) {
        const catalog = catalogs.find(c => c.id === instance.catalogId);
        const currency = catalog?.currency || "USD";
        const country = currency === "USD" ? "US" : currency === "CAD" ? "CA" : "GB";
        
        setStoreFormData({
          storeType: "combo",
          storeName: instance.displayName,
          country,
          currency,
          catalogId: instance.catalogId,
          masterComboId: instance.masterComboId,
          customStoreNames: instance.customStoreNames || [],
          imageUrl: instance.imageUrl || "",
          denominations: instance.denominations,
          isActive: instance.isActive,
          supplierMargins: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          offeringSuppliers: [1, 2, 3, 4, 5],
          selectedSupplier: null,
          secondarySupplier: null,
        });
      }
    }
  }, [editingStore, editingComboInstance, showStoreForm, storeSuppliers, comboInstances, catalogs]);

  const handleCreateStore = () => {
    if (editingComboInstance) {
      // Update combo instance
      const instance = comboInstances.find(ci => ci.id === editingComboInstance);
      if (!instance) return;
      
      updateComboInstance(editingComboInstance, {
        displayName: storeFormData.storeName,
        imageUrl: storeFormData.imageUrl || undefined,
        denominations: storeFormData.denominations,
        isActive: storeFormData.isActive,
        customStoreNames: storeFormData.customStoreNames.length > 0 ? storeFormData.customStoreNames : (instance.masterComboId ? null : []),
      });
      
      alert(`Combo card "${storeFormData.storeName}" has been updated.`);
      setShowStoreForm(false);
      setEditingComboInstance(null);
      return;
    }
    
    if (storeFormData.storeType === "regular") {
      // For regular stores, find the store in the system and set up supplier data
      if (!storeFormData.storeName) {
        alert("Please provide a store name");
        return;
      }
      
      // Find the store in the admin stores list
      const existingStore = adminStores.find(s => 
        s.name === storeFormData.storeName && s.country === storeFormData.country
      );
      
      if (!existingStore) {
        alert(`Store "${storeFormData.storeName}" not found in ${storeFormData.country} stores. Please use an existing store name.`);
        return;
      }
      
      // Ensure at least one supplier is offering
      if (storeFormData.offeringSuppliers.length === 0) {
        alert("Please select at least one available supplier");
        return;
      }
      
      // Set up supplier data
      const storeKey = `${storeFormData.country}-${storeFormData.storeName}`;
      const discounts: Record<number, number> = {};
      
      // Set margins for offering suppliers
      storeFormData.offeringSuppliers.forEach(supplierId => {
        discounts[supplierId] = storeFormData.supplierMargins[supplierId] || 0;
      });
      
      // Determine selected supplier (primary)
      let selectedSupplier = storeFormData.selectedSupplier;
      if (selectedSupplier && !storeFormData.offeringSuppliers.includes(selectedSupplier)) {
        // If selected supplier is not offering, select the one with highest margin
        let highestMargin = 0;
        let bestSupplier: number | null = null;
        storeFormData.offeringSuppliers.forEach(supplierId => {
          const margin = discounts[supplierId] || 0;
          if (margin > highestMargin) {
            highestMargin = margin;
            bestSupplier = supplierId;
          }
        });
        selectedSupplier = bestSupplier;
      } else if (!selectedSupplier && storeFormData.offeringSuppliers.length > 0) {
        // If no supplier selected, select the one with highest margin
        let highestMargin = 0;
        let bestSupplier: number | null = null;
        storeFormData.offeringSuppliers.forEach(supplierId => {
          const margin = discounts[supplierId] || 0;
          if (margin > highestMargin) {
            highestMargin = margin;
            bestSupplier = supplierId;
          }
        });
        selectedSupplier = bestSupplier;
      }
      
      // Initialize supplier data using the existing functions
      // First, set all the discounts
      storeFormData.offeringSuppliers.forEach(supplierId => {
        setStoreSupplierDiscount(storeFormData.storeName, storeFormData.country, supplierId, discounts[supplierId] || 0);
      });
      
      // Then set the selected supplier
      if (selectedSupplier !== null) {
        setStoreSelectedSupplier(storeFormData.storeName, storeFormData.country, selectedSupplier);
      }
      
      // Set secondary supplier if specified
      if (storeFormData.secondarySupplier && 
          storeFormData.offeringSuppliers.includes(storeFormData.secondarySupplier) &&
          storeFormData.secondarySupplier !== selectedSupplier) {
        setStoreSecondarySupplier(storeFormData.storeName, storeFormData.country, storeFormData.secondarySupplier);
      }
      
      // Note: UK stores get expiration date automatically (not editable)
      // The expiration date is calculated deterministically based on store name
      
      // Find catalog and add store to it
      const catalog = catalogs.find(c => 
        c.currency === storeFormData.currency && !c.isBranch && c.name.includes("Default")
      );
      
      if (catalog) {
        if (!editingStore) {
          addStoreToCatalog(catalog.id, storeFormData.storeName);
        }
      }
      
      if (editingStore) {
        alert(`Store "${storeFormData.storeName}" has been updated.`);
        setShowStoreForm(false);
        setEditingStore(null);
      } else {
        alert(`Store "${storeFormData.storeName}" has been set up with supplier data.`);
      }
    } else {
      // Combo store
      if (!storeFormData.storeName) {
        alert("Please provide a combo name");
      return;
    }
      
      // Find catalog based on currency
      const catalog = catalogs.find(c => {
        const currencyMap: Record<string, string> = {
          'USD': 'USD',
          'CAD': 'CAD',
          'GBP': 'GBP'
        };
        return c.currency === currencyMap[storeFormData.currency] && !c.isBranch && c.name.includes("Default");
      });
      
      if (!catalog) {
        alert("Could not find a catalog for the selected currency");
      return;
    }
      
      if (!storeFormData.masterComboId && storeFormData.customStoreNames.length === 0) {
        alert("Please either select a default combo or add custom stores");
      return;
    }
      
      createComboInstance({
        catalogId: catalog.id,
        masterComboId: storeFormData.masterComboId,
        displayName: storeFormData.storeName,
        customStoreNames: storeFormData.masterComboId ? null : storeFormData.customStoreNames,
        imageUrl: storeFormData.imageUrl || undefined,
        denominations: storeFormData.denominations,
        isActive: storeFormData.isActive,
      });
    }
    
    // Reset form
    setStoreFormData({
      storeType: "regular",
      storeName: "",
      country: "US",
      currency: "USD",
      catalogId: "",
      masterComboId: null,
      customStoreNames: [],
      imageUrl: "",
      denominations: [25, 50, 100],
      isActive: true,
      supplierMargins: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      offeringSuppliers: [1, 2, 3, 4, 5],
      selectedSupplier: null,
      secondarySupplier: null,
    });
    setShowStoreForm(false);
  };

  const activeCount = useMemo(() => filteredStores.filter(s => s.isActive).length, [filteredStores]);
  const inactiveCount = filteredStores.length - activeCount;

  // Helper to determine pricing type (Variable / Fixed) for each non-combo store.
  // Combos have no pricing type.
  const getStorePricingType = (store: Store): "Variable" | "Fixed" | null => {
    if (store.isComboInstance || store.storeType === "Combo") {
      return null;
    }
    // Deterministic pseudo-random assignment based on store name and country
    const key = `${store.country}-${store.name}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 2 === 0 ? "Variable" : "Fixed";
  };

  // Get denomination options for Fixed pricing stores
  const getFixedPricingOptions = (store: Store): string => {
    if (store.isComboInstance || store.storeType === "Combo") {
      return "";
    }
    const key = `${store.country}-${store.name}`;
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

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stores</h1>
            <p className="text-sm text-gray-600">
              {filteredStores.length} stores total • {activeCount} active • {inactiveCount} inactive
            </p>
          </div>
          <CreateButton onClick={() => setShowStoreForm(true)}>
            Create Store
          </CreateButton>
        </div>
      </header>

      {/* DB Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setDbCardsModalOpen(true)}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total DB Cards</h3>
              <p className="text-3xl font-bold text-gray-900">{totalDBCards.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Value of Total Cards</h3>
              <p className="text-3xl font-bold text-gray-900">${totalValueOfCards.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Currency:
          </label>
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="all">All</option>
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Store Type:
          </label>
          <select
            value={storeTypeFilter}
            onChange={(e) => setStoreTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="all">All</option>
            <option value="Close">Close</option>
            <option value="Open">Open</option>
            <option value="Combo">Combo</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Selected Supplier:
          </label>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="all">All</option>
            <option value="1">Supplier 1</option>
            <option value="2">Supplier 2</option>
            <option value="3">Supplier 3</option>
            <option value="4">Supplier 4</option>
            <option value="5">Supplier 5</option>
            <option value="none">No Supplier</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGroupedStores.map((group) => {
          // Create a store object for display purposes
          const store = {
            id: group.isComboInstance ? `combo-${group.comboInstanceId}` : group.name.toLowerCase().replace(/\s+/g, '-'),
            name: group.name,
            country: "US" as Country, // Default for display
            isActive: group.isComboInstance 
              ? comboInstances.find(ci => ci.id === group.comboInstanceId)?.isActive ?? true
              : adminStores.some(s => s.name === group.name && isStoreActive(s.name, s.country)),
            isCombo: group.isComboInstance ?? false,
            isComboInstance: group.isComboInstance,
            comboInstanceId: group.comboInstanceId,
            storeType: group.storeType,
          };
          
          // Get the first available currency for image/logo
          const firstCurrency = group.currencies[0] || "USD";
          const countryForDisplay: Country = firstCurrency === "USD" ? "US" : firstCurrency === "CAD" ? "CA" : "GB";
          
          // Get selected currency for this store (default to first currency)
          const selectedCurrency = selectedCurrencyForStore[group.name] || group.currencies[0] || "USD";
          // Get brand logo URL from official sources or Wikipedia
          const getBrandLogoUrl = (brandName: string): string => {
            const logoMap: Record<string, string> = {
              "Amazon": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
              "Apple": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
              "Google": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
              "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
              "Walmart": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
              "Coca-Cola": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg",
              "Disney": "https://upload.wikimedia.org/wikipedia/commons/d/df/Walt_Disney_Company_logo.svg",
              "Nike": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
              "McDonald's": "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
              "Starbucks": "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
              "Facebook": "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
              "Tesla": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
              "AT&T": "https://upload.wikimedia.org/wikipedia/commons/9/9b/ATT_logo_2016.svg",
              "Verizon": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Verizon_Communications_logo.svg",
              "Target": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
              "Home Depot": "https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg",
              "Costco": "https://upload.wikimedia.org/wikipedia/commons/5/59/Costco_Wholesale_logo_2010-10-26.svg",
              "UPS": "https://upload.wikimedia.org/wikipedia/commons/a/ae/UPS_logo.svg",
              "FedEx": "https://upload.wikimedia.org/wikipedia/commons/a/ac/FedEx_Express_logo.svg",
              "IBM": "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
              "Intel": "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg",
              "Oracle": "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
              "Cisco": "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
              "Adobe": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo.svg",
              "Netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
              "PayPal": "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
              "Visa": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
              "Mastercard": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Mastercard_logo.svg",
              "American Express": "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo.svg",
              "JPMorgan Chase": "https://upload.wikimedia.org/wikipedia/commons/3/36/JP_Morgan_Chase_%282016%29.svg",
              "Bank of America": "https://upload.wikimedia.org/wikipedia/commons/1/16/Bank_of_America_logo.svg",
              "Wells Fargo": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Wells_Fargo_%282018%29.svg",
              "Goldman Sachs": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Goldman_Sachs.svg",
              "Morgan Stanley": "https://upload.wikimedia.org/wikipedia/commons/9/9f/Morgan_Stanley_logo.svg",
              "Citigroup": "https://upload.wikimedia.org/wikipedia/commons/4/40/Citibank.svg",
              "Ford": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg",
              "General Motors": "https://upload.wikimedia.org/wikipedia/commons/9/91/General_Motors_logo.svg",
              "Chevrolet": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Chevrolet_logo.svg",
              "Toyota": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Toyota_logo.svg",
              "Honda": "https://upload.wikimedia.org/wikipedia/commons/7/82/Honda_Logo.svg",
              "BMW": "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg",
              "Mercedes-Benz": "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg",
              "Audi": "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi_logo.svg",
              "Volkswagen": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
              "Hyundai": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Hyundai_Motor_Company_logo.svg",
              "Kia": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Kia_logo.svg",
              "Nissan": "https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_logo.svg",
              "Subaru": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Subaru_logo.svg",
              "Mazda": "https://upload.wikimedia.org/wikipedia/commons/4/41/Mazda_logo.svg",
              "Jeep": "https://upload.wikimedia.org/wikipedia/commons/7/75/Jeep_logo.svg",
              "Dodge": "https://upload.wikimedia.org/wikipedia/commons/7/74/Dodge_logo.svg",
              "Ram": "https://upload.wikimedia.org/wikipedia/commons/4/47/Ram_Trucks_logo.svg",
              "GMC": "https://upload.wikimedia.org/wikipedia/commons/6/69/GMC_logo.svg",
              "Cadillac": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Cadillac_logo.svg",
              "Buick": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Buick_logo.svg",
              "Lincoln": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Lincoln_Motor_Company_Logo.svg",
              "Chrysler": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Chrysler_logo.svg",
              "Pepsi": "https://upload.wikimedia.org/wikipedia/commons/8/84/Pepsi_logo.svg",
              "PepsiCo": "https://upload.wikimedia.org/wikipedia/commons/3/36/PepsiCo_logo.svg",
              "Frito-Lay": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Frito-Lay_logo.svg",
              "Taco Bell": "https://upload.wikimedia.org/wikipedia/commons/7/73/Taco_Bell_logo.svg",
              "KFC": "https://upload.wikimedia.org/wikipedia/en/9/9a/KFC_logo.svg",
              "Pizza Hut": "https://upload.wikimedia.org/wikipedia/commons/7/73/Pizza_Hut_logo.svg",
              "Burger King": "https://upload.wikimedia.org/wikipedia/commons/8/85/Burger_King_logo_%281999%29.svg",
              "Subway": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Subway_restaurant_logo.svg",
              "Domino's": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Domino%27s_pizza_logo.svg",
              "Dunkin'": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Dunkin%27_logo.svg",
              "Chipotle": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Chipotle_Mexican_Grill_logo.svg",
              "Panera Bread": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Panera_Bread_logo.svg",
              "Olive Garden": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Olive_Garden_logo.svg",
              "Red Lobster": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Red_Lobster_logo.svg",
              "Outback Steakhouse": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Outback_Steakhouse_logo.svg",
              "Applebee's": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Applebee%27s_logo.svg",
              "TGI Friday's": "https://upload.wikimedia.org/wikipedia/commons/4/4a/TGI_Fridays_logo.svg",
              "Buffalo Wild Wings": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Buffalo_Wild_Wings_logo.svg",
              "Hooters": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Hooters_logo.svg",
              "IHOP": "https://upload.wikimedia.org/wikipedia/commons/8/8a/IHOP_logo.svg",
              "Denny's": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Denny%27s_logo.svg",
              "Waffle House": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Waffle_House_logo.svg",
              "Cracker Barrel": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Cracker_Barrel_logo.svg",
              "Best Buy": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Best_Buy_logo.svg",
              "Lowe's": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Lowe%27s_logo.svg",
              "Macy's": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Macy%27s_logo.svg",
              "Kohl's": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Kohl%27s_logo.svg",
              "Nordstrom": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Nordstrom_logo.svg",
              "TJ Maxx": "https://upload.wikimedia.org/wikipedia/commons/7/7a/TJ_Maxx_logo.svg",
              "Marshalls": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Marshalls_logo.svg",
              "Ross": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Ross_Stores_logo.svg",
              "Burlington": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Burlington_Stores_logo.svg",
              "Dillard's": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Dillard%27s_logo.svg",
              "Sephora": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Sephora_logo.svg",
              "Ulta": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Ulta_Beauty_logo.svg",
              "CVS": "https://upload.wikimedia.org/wikipedia/commons/7/7a/CVS_Health_logo.svg",
              "Walgreens": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Walgreens_logo.svg",
              "Rite Aid": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Rite_Aid_logo.svg",
              "Kroger": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Kroger_logo.svg",
              "Safeway": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Safeway_logo.svg",
              "Albertsons": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Albertsons_logo.svg",
              "Whole Foods": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Whole_Foods_Market_logo.svg",
              "Trader Joe's": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Trader_Joe%27s_logo.svg",
              "Publix": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Publix_logo.svg",
              "Wegmans": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Wegmans_logo.svg",
              "H-E-B": "https://upload.wikimedia.org/wikipedia/commons/9/9a/H-E-B_logo.svg",
              "Meijer": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Meijer_logo.svg",
              "Giant Eagle": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Giant_Eagle_logo.svg",
              "Stop & Shop": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Stop_%26_Shop_logo.svg",
              "Food Lion": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Food_Lion_logo.svg",
              "Harris Teeter": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Harris_Teeter_logo.svg",
              "Hy-Vee": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Hy-Vee_logo.svg",
              "King Soopers": "https://upload.wikimedia.org/wikipedia/commons/8/8a/King_Soopers_logo.svg",
              "Tesco": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Tesco_logo.svg",
              "Sainsbury's": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Sainsbury%27s_logo.svg",
              "Asda": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Asda_logo.svg",
              "Morrisons": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Morrisons_logo.svg",
              "Aldi": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Aldi_logo.svg",
              "Lidl": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Lidl_logo.svg",
              "Marks & Spencer": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Marks_%26_Spencer_logo.svg",
              "Waitrose": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Waitrose_logo.svg",
              "Co-op": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Co-op_logo.svg",
              "Iceland": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Iceland_%28supermarket%29_logo.svg",
              "Boots": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Boots_logo.svg",
              "Superdrug": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Superdrug_logo.svg",
              "Lloyds Pharmacy": "https://upload.wikimedia.org/wikipedia/commons/7/7a/LloydsPharmacy_logo.svg",
              "HSBC": "https://upload.wikimedia.org/wikipedia/commons/9/9a/HSBC_logo.svg",
              "Barclays": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Barclays_logo.svg",
              "NatWest": "https://upload.wikimedia.org/wikipedia/commons/7/7a/NatWest_logo.svg",
              "Lloyds Bank": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Lloyds_Bank_logo.svg",
              "Santander UK": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Santander_UK_logo.svg",
              "Nationwide": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Nationwide_logo.svg",
              "TSB": "https://upload.wikimedia.org/wikipedia/commons/9/9a/TSB_Bank_logo.svg",
              "British Airways": "https://upload.wikimedia.org/wikipedia/commons/8/8a/British_Airways_logo.svg",
              "EasyJet": "https://upload.wikimedia.org/wikipedia/commons/7/7a/EasyJet_logo.svg",
              "Ryanair": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Ryanair_logo.svg",
              "Virgin Atlantic": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Virgin_Atlantic_logo.svg",
              "TUI": "https://upload.wikimedia.org/wikipedia/commons/7/7a/TUI_Group_logo.svg",
              "Thomas Cook": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Thomas_Cook_logo.svg",
              "FirstGroup": "https://upload.wikimedia.org/wikipedia/commons/8/8a/FirstGroup_logo.svg",
              "Stagecoach": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Stagecoach_logo.svg",
              "National Express": "https://upload.wikimedia.org/wikipedia/commons/9/9a/National_Express_logo.svg",
              "Arriva": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Arriva_logo.svg",
              "BT": "https://upload.wikimedia.org/wikipedia/commons/7/7a/BT_Group_logo.svg",
              "Vodafone UK": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Vodafone_logo.svg",
              "EE": "https://upload.wikimedia.org/wikipedia/commons/8/8a/EE_logo.svg",
              "O2": "https://upload.wikimedia.org/wikipedia/commons/7/7a/O2_logo.svg",
              "Three UK": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Three_UK_logo.svg",
              "Sky": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Sky_logo.svg",
              "Virgin Media": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Virgin_Media_logo.svg",
              "TalkTalk": "https://upload.wikimedia.org/wikipedia/commons/9/9a/TalkTalk_logo.svg",
              "Plusnet": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Plusnet_logo.svg",
              "BT Sport": "https://upload.wikimedia.org/wikipedia/commons/7/7a/BT_Sport_logo.svg",
              "Loblaws": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Loblaws_logo.svg",
              "Sobeys": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Sobeys_logo.svg",
              "Metro": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Metro_Inc_logo.svg",
              "Canadian Tire": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Canadian_Tire_logo.svg",
              "Shoppers Drug Mart": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Shoppers_Drug_Mart_logo.svg",
              "Rexall": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Rexall_logo.svg",
              "London Drugs": "https://upload.wikimedia.org/wikipedia/commons/9/9a/London_Drugs_logo.svg",
              "Costco Canada": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Costco_Wholesale_logo_2010-10-26.svg",
              "Walmart Canada": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
              "Home Depot Canada": "https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg",
            };
            // Fallback to Clearbit if logo not found in map
            return logoMap[brandName] || `https://logo.clearbit.com/${brandName.toLowerCase().replace(/\s+/g, "").replace("'", "")}.com`;
          };

          // Get combo image if it's a combo instance
          let logoUrl: string;
          const pricingType = getStorePricingType(store);
          
          // Check if there's an uploaded image
          const currency: Currency = store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP";
          const uploadedImage = getStoreImage(store.name, currency, !!store.isComboInstance, store.comboInstanceId);
          
          if (uploadedImage) {
            logoUrl = uploadedImage;
          } else if (group.isComboInstance && group.comboInstanceId) {
            const instance = comboInstances.find(ci => ci.id === group.comboInstanceId);
            logoUrl = instance?.imageUrl || getBrandLogoUrl(group.name);
          } else {
            logoUrl = getBrandLogoUrl(group.name);
          }
          const initials = group.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div 
              key={group.name} 
              className={`rounded-lg border p-4 shadow-sm transition-all ${
                store.isActive 
                  ? "border-gray-200 bg-white" 
                  : "border-gray-300 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                  <img
                    src={logoUrl}
                    alt={group.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to initials if logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xs font-semibold text-gray-600">${initials}</span>`;
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-medium text-gray-900 truncate">{group.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Show all currencies for this store */}
                    {group.currencies.map(currency => (
                      <span key={currency} className={`inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium ${
                        currency === "USD" 
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : currency === "GBP"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-green-200 bg-green-50 text-green-700"
                      }`}>
                        {currency}
                      </span>
                    ))}
                    <span className={`inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium ${
                      store.storeType === "Combo"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : store.storeType === "Open"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}>
                      {store.storeType}
                    </span>
                    {pricingType && (
                      <span
                        className={`inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium cursor-help ${
                          pricingType === "Variable"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                        title={pricingType === "Variable" ? "0-2000$" : getFixedPricingOptions(store)}
                      >
                        {pricingType}
                      </span>
                    )}
                    {!store.isActive && (
                      <span className="text-xs text-gray-500">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
              {!group.isComboInstance && (() => {
                // Multi-currency stores that should show currency tabs
                const multiCurrencyStoreNames = [
                  "Burger King",
                  "Airbnb",
                  "Amazon",
                  "Booking.com",
                  "Domino's",
                  "Disney",
                  "McDonald's",
                  "Mastercard",
                  "Netflix",
                  "Nike"
                ];
                
                const isMultiCurrencyStore = multiCurrencyStoreNames.includes(group.name);
                // For multi-currency stores, always show tabs (they should have all 3 currencies)
                // If they don't have all 3 yet, ensure they're available
                const currenciesToShow: Currency[] = isMultiCurrencyStore 
                  ? ["USD", "CAD", "GBP"] 
                  : group.currencies;
                const shouldShowTabs = isMultiCurrencyStore;
                
                return (
                  <div className="mb-3">
                    {/* Currency tabs - only for multi-currency stores */}
                    {shouldShowTabs && (() => {
                      const currentSelectedCurrency = selectedCurrencyForStore[group.name] || "USD";
                      return (
                        <div className="flex gap-1 mb-3 border-b border-gray-200">
                          {currenciesToShow.map(currency => (
                            <button
                              key={currency}
                              onClick={() => setSelectedCurrencyForStore(prev => ({ ...prev, [group.name]: currency }))}
                              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                                currentSelectedCurrency === currency
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {currency}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  
                    {/* Show configuration for selected currency */}
                    {(() => {
                      // For multi-currency stores, use selected currency or default to USD
                      // For other stores, use their currency
                      const currencyToUse = shouldShowTabs 
                        ? (selectedCurrencyForStore[group.name] || "USD")
                        : (group.currencies[0] || "USD");
                      const supplierData = getStoreSupplierData(group.name, currencyToUse) || { selectedSupplier: null, secondarySupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
                      const selectedSupplier = supplierData.selectedSupplier;
                      const offeringCount = (supplierData.offeringSuppliers || [1, 2, 3, 4, 5]).length;
                      const selectedMargin = selectedSupplier !== null && selectedSupplier !== undefined 
                        ? supplierData.discounts[selectedSupplier] || 0 
                        : null;
                      
                      return (
                        <>
                          {selectedSupplier !== null && selectedSupplier !== undefined && selectedMargin !== null ? (
                            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                              <div className="text-xs font-medium text-green-800">
                                Supplier {selectedSupplier} Selected {shouldShowTabs && `(${currencyToUse})`}
                              </div>
                              <div className="text-xs text-green-700 mt-0.5">
                                Margin: {selectedMargin.toFixed(2)}%
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2 text-xs text-gray-500">
                              No supplier selected {shouldShowTabs && `for ${currencyToUse}`}
                            </div>
                          )}
                          {offeringCount < 5 && (
                            <div className="text-xs text-gray-500 mb-1">
                              {offeringCount}/5 suppliers available
                            </div>
                          )}
                          <button
                            onClick={() => setSupplierModalOpen(prev => ({ ...prev, [`${store.id}-${currencyToUse}`]: true }))}
                            className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 border border-blue-200"
                          >
                            Manage Suppliers {shouldShowTabs && `(${currencyToUse})`}
                          </button>
                          {currencyToUse === "GBP" && (() => {
                            const expirationMonths = getStoreExpirationDate(group.name, currencyToUse);
                            return (
                              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                                <div className="text-xs font-medium text-gray-700">
                                  Expiration Date: <span className="font-semibold">{expirationMonths} Month{expirationMonths !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">Auto-assigned (not editable)</div>
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>
                );
              })()}
              {store.isComboInstance && store.comboInstanceId && (() => {
                const comboStores = getComboInstanceStores(store.comboInstanceId);
                const instance = comboInstances.find(ci => ci.id === store.comboInstanceId);
                const isBasedOnDefaults = instance?.masterComboId !== null && instance?.customStoreNames === null;
                const discount = getComboInstanceDiscount(store.comboInstanceId);
                const expirationMonths = getComboInstanceExpirationDate(store.comboInstanceId);
                
                return (
                  <div className="mb-3 space-y-2">
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-purple-800">
                          Stores in Combo: <span className="font-bold text-base">{comboStores.length}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          isBasedOnDefaults 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {isBasedOnDefaults ? "Based on Defaults" : "Custom"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discount ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setComboInstanceDiscount(store.comboInstanceId, null);
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                                setComboInstanceDiscount(store.comboInstanceId, numValue);
                              }
                            }
                          }}
                          placeholder="0-100"
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <select
                        value={expirationMonths || ""}
                        onChange={(e) => {
                          const months = e.target.value ? parseInt(e.target.value) : null;
                          setComboInstanceExpirationDate(store.comboInstanceId, months);
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="">Not set</option>
                        <option value="1">1 Month</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="24">24 Months</option>
                      </select>
                    </div>
                  </div>
                );
              })()}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2 flex-1 flex-wrap">
                    <button
                      onClick={() => {
                        // Use selected currency for multi-currency stores, otherwise use store's currency
                        const multiCurrencyStoreNames = [
                          "Burger King", "Airbnb", "Amazon", "Booking.com", "Domino's",
                          "Disney", "McDonald's", "Mastercard", "Netflix", "Nike"
                        ];
                        const isMultiCurrency = multiCurrencyStoreNames.includes(group.name);
                        const currency: Currency = isMultiCurrency && selectedCurrencyForStore[group.name]
                          ? selectedCurrencyForStore[group.name]
                          : (store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP");
                        const content = getStoreContent(group.name, currency, !!store.isComboInstance, store.comboInstanceId);
                        setContentFormData(prev => ({
                          ...prev,
                          [`${store.id}-${currency}`]: { ...content }
                        }));
                        setContentModalOpen(prev => ({ ...prev, [`${store.id}-${currency}`]: true }));
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 border border-purple-200"
                    >
                      Edit T&C & Description
                    </button>
                    <button
                      onClick={() => {
                        // Use selected currency for multi-currency stores, otherwise use store's currency
                        const multiCurrencyStoreNames = [
                          "Burger King", "Airbnb", "Amazon", "Booking.com", "Domino's",
                          "Disney", "McDonald's", "Mastercard", "Netflix", "Nike"
                        ];
                        const isMultiCurrency = multiCurrencyStoreNames.includes(group.name);
                        const currency: Currency = isMultiCurrency && selectedCurrencyForStore[group.name]
                          ? selectedCurrencyForStore[group.name]
                          : (store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP");
                        const currentImage = getStoreImage(group.name, currency, !!store.isComboInstance, store.comboInstanceId);
                        setImageFormData(prev => ({
                          ...prev,
                          [`${store.id}-${currency}`]: currentImage || ""
                        }));
                        setImageModalOpen(prev => ({ ...prev, [`${store.id}-${currency}`]: true }));
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 border border-indigo-200"
                    >
                      {uploadedImage ? "Update Image" : "Upload Image"}
                    </button>
                    {store.isComboInstance && store.comboInstanceId && (
                      <button
                        onClick={() => {
                          const comboStores = getComboInstanceStores(store.comboInstanceId!);
                          setComboEditStoreNames(prev => ({
                            ...prev,
                            [store.comboInstanceId!]: [...comboStores]
                          }));
                          setComboEditModalOpen(prev => ({ ...prev, [store.comboInstanceId!]: true }));
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 border border-green-200"
                      >
                        Edit Stores
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (store.isComboInstance && store.comboInstanceId) {
                          setEditingComboInstance(store.comboInstanceId);
                        } else {
                          setEditingStore(store);
                        }
                        setShowStoreForm(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 border border-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (store.isComboInstance && store.comboInstanceId) {
                          setShowDuplicateComboModal(prev => ({ ...prev, [store.comboInstanceId!]: true }));
                          setDuplicateComboName(prev => ({ ...prev, [store.comboInstanceId!]: `${store.name} Copy` }));
                        } else {
                          setShowDuplicateStoreModal(prev => ({ ...prev, [store.id]: true }));
                          setDuplicateStoreName(prev => ({ ...prev, [store.id]: `${store.name} Copy` }));
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded hover:bg-orange-100 border border-orange-200"
                    >
                      Duplicate
                    </button>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={store.isActive}
                      onChange={() => handleToggleStoreActive(store.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Management Modals */}
      {filteredStores
        .filter(store => !store.isComboInstance)
        .flatMap(store => {
          // Get currency from store's country
          const currency: Currency = store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP";
          const modalKey = `${store.id}-${currency}`;
          if (!supplierModalOpen[modalKey]) return [];
          
          const supplierData = getStoreSupplierData(store.name, currency) || { selectedSupplier: null, secondarySupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
          const offeringSuppliers = supplierData.offeringSuppliers || [1, 2, 3, 4, 5];
          
          return [{
            store,
            currency,
            modalKey,
            supplierData,
            offeringSuppliers
          }];
        })
        .map(({ store, currency, modalKey, supplierData, offeringSuppliers }) => {

        return (
          <div key={`supplier-modal-${modalKey}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Manage Suppliers - {store.name} ({currency})</h2>
                <button
                  onClick={() => setSupplierModalOpen(prev => ({ ...prev, [modalKey]: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(supplierId => {
                  const isOffering = offeringSuppliers.includes(supplierId);
                  const discount = supplierData.discounts[supplierId] || 0;
                  const isSelected = supplierData.selectedSupplier === supplierId;
                  
                  if (!isOffering) {
                    return (
                      <div key={supplierId} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-medium text-gray-500">Supplier {supplierId}</h3>
                            <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-200 rounded">
                              Not Offering
                            </span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 italic">This supplier is not available for this store and cannot be selected.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Margin (%)
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                            N/A
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={supplierId} className={`border rounded-lg p-4 ${isSelected ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-medium text-gray-900">Supplier {supplierId}</h3>
                          {isSelected && (
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                              Selected
                            </span>
                          )}
                          {!isSelected && supplierData.selectedSupplier !== null && (
                            <span className="text-xs text-gray-500">
                              (Click to replace current selection)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            // Only one supplier can be selected at a time - selecting a new one automatically deselects the previous
                            setStoreSelectedSupplier(store.name, currency, isSelected ? null : supplierId);
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded ${
                            isSelected
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isSelected ? "Deselect" : "Select"}
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Margin (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={discount}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setStoreSupplierDiscount(store.name, currency, supplierId, value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSupplierModalOpen(prev => ({ ...prev, [modalKey]: false }))}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Store Content (T&C & Description) Modals */}
      {filteredStores.map(store => {
        // Check for multi-currency stores and use currency-based modal key
        const multiCurrencyStoreNames = [
          "Burger King", "Airbnb", "Amazon", "Booking.com", "Domino's",
          "Disney", "McDonald's", "Mastercard", "Netflix", "Nike"
        ];
        const isMultiCurrency = multiCurrencyStoreNames.includes(store.name);
        const currency: Currency = isMultiCurrency && selectedCurrencyForStore[store.name]
          ? selectedCurrencyForStore[store.name]
          : (store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP");
        const modalKey = isMultiCurrency ? `${store.id}-${currency}` : store.id;
        const isOpen = contentModalOpen[modalKey];
        if (!isOpen) return null;

        const formData = contentFormData[modalKey] || getStoreContent(store.name, currency, !!store.isComboInstance, store.comboInstanceId);

        return (
          <div key={`content-modal-${modalKey}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Content - {store.name} {isMultiCurrency && `(${currency})`}</h2>
                <button
                  onClick={() => setContentModalOpen(prev => ({ ...prev, [modalKey]: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setContentFormData(prev => ({
                      ...prev,
                      [modalKey]: { ...formData, description: e.target.value }
                    }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter store description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setContentFormData(prev => ({
                      ...prev,
                      [modalKey]: { ...formData, termsAndConditions: e.target.value }
                    }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setContentModalOpen(prev => ({ ...prev, [modalKey]: false }))}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStoreContent(
                      store.name,
                      currency,
                      !!store.isComboInstance,
                      store.comboInstanceId,
                      formData
                    );
                    setContentModalOpen(prev => ({ ...prev, [modalKey]: false }));
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Store Image Upload Modals */}
      {filteredStores.map(store => {
        // Check for multi-currency stores and use currency-based modal key
        const multiCurrencyStoreNames = [
          "Burger King", "Airbnb", "Amazon", "Booking.com", "Domino's",
          "Disney", "McDonald's", "Mastercard", "Netflix", "Nike"
        ];
        const isMultiCurrency = multiCurrencyStoreNames.includes(store.name);
        const currency: Currency = isMultiCurrency && selectedCurrencyForStore[store.name]
          ? selectedCurrencyForStore[store.name]
          : (store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP");
        const modalKey = isMultiCurrency ? `${store.id}-${currency}` : store.id;
        const isOpen = imageModalOpen[modalKey];
        if (!isOpen) return null;

        const formData = imageFormData[modalKey] || "";

        return (
          <div key={`image-modal-${modalKey}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload/Update Image - {store.name} {isMultiCurrency && `(${currency})`}</h2>
                <button
                  onClick={() => setImageModalOpen(prev => ({ ...prev, [modalKey]: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData}
                    onChange={(e) => setImageFormData(prev => ({
                      ...prev,
                      [modalKey]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter a URL to an image or upload a file</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Upload File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setImageFormData(prev => ({
                            ...prev,
                            [modalKey]: base64String
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                {formData && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div className="border border-gray-300 rounded p-4 bg-gray-50 flex items-center justify-center">
                      <img
                        src={formData}
                        alt="Preview"
                        className="max-w-full max-h-64 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<p class="text-sm text-red-500">Failed to load image</p>';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setImageModalOpen(prev => ({ ...prev, [modalKey]: false }))}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                {formData && (
                  <button
                    onClick={() => {
                      setStoreImage(
                        store.name,
                        currency,
                        !!store.isComboInstance,
                        store.comboInstanceId,
                        null
                      );
                      setImageModalOpen(prev => ({ ...prev, [modalKey]: false }));
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                  >
                    Remove Image
                  </button>
                )}
                <button
                  onClick={() => {
                    setStoreImage(
                      store.name,
                      currency,
                      !!store.isComboInstance,
                      store.comboInstanceId,
                      formData || null
                    );
                    setImageModalOpen(prev => ({ ...prev, [modalKey]: false }));
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Edit Combo Stores Modals */}
      {filteredStores
        .filter(store => store.isComboInstance && store.comboInstanceId)
        .map(store => {
          const comboInstance = comboInstances.find(ci => ci.id === store.comboInstanceId);
          if (!comboInstance) return null;
          
          const isOpen = comboEditModalOpen[comboInstance.id];
          if (!isOpen) return null;
          
          const formData = comboEditStoreNames[comboInstance.id] || [];
          const catalog = catalogs.find(c => c.id === comboInstance.catalogId);
          const availableStores = adminStores.filter(s => 
            s.country === catalog?.country && isStoreActive(s.name, s.country)
          );
          
          return (
            <div key={`combo-edit-modal-${comboInstance.id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Edit Stores - {comboInstance.displayName}</h2>
                  <button
                    onClick={() => setComboEditModalOpen(prev => ({ ...prev, [comboInstance.id]: false }))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {comboInstance.masterComboId 
                      ? "Select stores to override the default combo. Custom stores will replace the default selection."
                      : "Select stores to include in this combo. This combo is not based on defaults, so you can customize the store selection."
                    }
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500">
                      Selected: {formData.length} store{formData.length !== 1 ? 's' : ''}
                    </div>
                    {availableStores.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setComboEditStoreNames(prev => ({
                            ...prev,
                            [comboInstance.id]: availableStores.map(s => s.name)
                          }));
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium"
                      >
                        Add All ({availableStores.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-3 max-h-96 overflow-y-auto bg-gray-50">
                  <div className="space-y-2">
                    {availableStores.map(store => {
                      const isSelected = formData.includes(store.name);
                      return (
                        <label key={store.name} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setComboEditStoreNames(prev => ({
                                  ...prev,
                                  [comboInstance.id]: [...(prev[comboInstance.id] || []), store.name]
                                }));
                              } else {
                                setComboEditStoreNames(prev => ({
                                  ...prev,
                                  [comboInstance.id]: (prev[comboInstance.id] || []).filter(n => n !== store.name)
                                }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{store.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setComboEditModalOpen(prev => ({ ...prev, [comboInstance.id]: false }));
                      setComboEditStoreNames(prev => {
                        const updated = { ...prev };
                        delete updated[comboInstance.id];
                        return updated;
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateComboInstance(comboInstance.id, {
                        customStoreNames: formData.length > 0 ? formData : (comboInstance.masterComboId ? null : [])
                      });
                      setComboEditModalOpen(prev => ({ ...prev, [comboInstance.id]: false }));
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          );
        })}

      {/* Create/Edit Store Form Modal */}
      {showStoreForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingStore ? "Edit Store" : editingComboInstance ? "Edit Combo Card" : "Create Store"}
            </h2>
            
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Type <span className="text-red-500">*</span>
                  </label>
                <select
                  value={storeFormData.storeType}
                  onChange={(e) => setStoreFormData(prev => ({ 
                    ...prev, 
                    storeType: e.target.value as "regular" | "combo"
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="regular">Regular Store</option>
                  <option value="combo">Combo Store</option>
                </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {storeFormData.storeType === "combo" ? "Combo Name" : "Store Name"} <span className="text-red-500">*</span>
                  </label>
                  <input
                  type="text"
                  value={storeFormData.storeName}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, storeName: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder={storeFormData.storeType === "combo" ? "Enter combo name" : "Enter store name"}
                />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                  value={storeFormData.currency}
                    onChange={(e) => {
                    const currency = e.target.value as "USD" | "CAD" | "GBP";
                    const countryMap: Record<string, Country> = {
                      'USD': 'US',
                      'CAD': 'CA',
                      'GBP': 'GB'
                    };
                    setStoreFormData(prev => ({ 
                        ...prev,
                      currency,
                      country: countryMap[currency]
                      }));
                    }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="GBP">GBP</option>
                  </select>
                </div>

              {storeFormData.storeType === "regular" && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Supplier Management</h3>
                    
                    {/* Offering Suppliers */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Suppliers
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(supplierId => (
                          <label key={supplierId} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={storeFormData.offeringSuppliers.includes(supplierId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStoreFormData(prev => ({
                                    ...prev,
                                    offeringSuppliers: [...prev.offeringSuppliers, supplierId]
                                  }));
                                } else {
                                  setStoreFormData(prev => ({
                                    ...prev,
                                    offeringSuppliers: prev.offeringSuppliers.filter(id => id !== supplierId),
                                    selectedSupplier: prev.selectedSupplier === supplierId ? null : prev.selectedSupplier,
                                    secondarySupplier: prev.secondarySupplier === supplierId ? null : prev.secondarySupplier,
                                  }));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Supplier {supplierId}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Supplier Margins */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Margins (%)
                      </label>
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(supplierId => {
                          const isOffering = storeFormData.offeringSuppliers.includes(supplierId);
                          return (
                            <div key={supplierId} className="flex items-center gap-3">
                              <label className="w-24 text-sm text-gray-600">
                                Supplier {supplierId}:
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                value={storeFormData.supplierMargins[supplierId] || 0}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  if (isOffering) {
                                    setStoreFormData(prev => ({
                                      ...prev,
                                      supplierMargins: {
                                        ...prev.supplierMargins,
                                        [supplierId]: value
                                      }
                                    }));
                                  }
                                }}
                                disabled={!isOffering}
                                className={`flex-1 px-3 py-2 border border-gray-300 rounded text-sm ${
                                  !isOffering ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                }`}
                                placeholder="0"
                              />
                              {!isOffering && (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Supplier */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Supplier (Primary)
                      </label>
                      <select
                        value={storeFormData.selectedSupplier || ""}
                        onChange={(e) => setStoreFormData(prev => ({
                          ...prev,
                          selectedSupplier: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">None</option>
                        {storeFormData.offeringSuppliers.map(supplierId => (
                          <option key={supplierId} value={supplierId}>
                            Supplier {supplierId} ({storeFormData.supplierMargins[supplierId] || 0}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Secondary Supplier */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Supplier
                      </label>
                      <select
                        value={storeFormData.secondarySupplier || ""}
                        onChange={(e) => setStoreFormData(prev => ({
                          ...prev,
                          secondarySupplier: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">None</option>
                        {storeFormData.offeringSuppliers
                          .filter(id => id !== storeFormData.selectedSupplier)
                          .map(supplierId => (
                            <option key={supplierId} value={supplierId}>
                              Supplier {supplierId} ({storeFormData.supplierMargins[supplierId] || 0}%)
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {storeFormData.storeType === "combo" && (
                <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base on Default Combo
                    </label>
                    <select
                      value={storeFormData.masterComboId || ""}
                      onChange={(e) => setStoreFormData(prev => ({ 
                        ...prev, 
                        masterComboId: e.target.value || null,
                        customStoreNames: e.target.value ? [] : prev.customStoreNames
                      }))}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Custom (no default)</option>
                      {masterCombos
                        .filter(mc => mc.name === "Default Combo Card" && mc.currency === storeFormData.currency && mc.isActive)
                        .map(mc => (
                          <option key={mc.id} value={mc.id}>
                            Default Combo Card ({mc.currency})
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  {!storeFormData.masterComboId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Stores <span className="text-red-500">*</span>
                      </label>
                      <div className="border border-gray-300 rounded p-2 max-h-40 overflow-y-auto">
                        {adminStores
                          .filter(s => s.country === storeFormData.country)
                          .map(store => (
                            <label key={store.name} className="flex items-center gap-2 p-1">
                            <input
                              type="checkbox"
                                checked={storeFormData.customStoreNames.includes(store.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setStoreFormData(prev => ({
                                      ...prev,
                                      customStoreNames: [...prev.customStoreNames, store.name]
                                    }));
                                  } else {
                                    setStoreFormData(prev => ({
                                      ...prev,
                                      customStoreNames: prev.customStoreNames.filter(n => n !== store.name)
                                    }));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{store.name}</span>
                          </label>
                        ))}
                      </div>
                  </div>
                  )}
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={storeFormData.imageUrl}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Denominations (optional)
                </label>
                <input
                  type="text"
                  value={storeFormData.denominations.join(", ")}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (!raw) {
                      // Empty input means variable pricing (no fixed denominations)
                      setStoreFormData(prev => ({ ...prev, denominations: [] }));
                      return;
                    }
                    const values = raw.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                    setStoreFormData(prev => ({ ...prev, denominations: values }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="25, 50, 100 (leave empty for variable pricing)"
                />
                </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={storeFormData.isActive}
                    onChange={(e) => setStoreFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateStore}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center justify-center gap-2 font-medium"
              >
                {editingStore || editingComboInstance ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{editingComboInstance ? "Update Combo Card" : "Update Store"}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Store</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowStoreForm(false);
                  setStoreFormData({
                    storeType: "regular",
                    storeName: "",
                    country: "US",
                    currency: "USD",
                    catalogId: "",
                    masterComboId: null,
                    customStoreNames: [],
                    imageUrl: "",
                    denominations: [25, 50, 100],
                    isActive: true,
                    supplierMargins: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    offeringSuppliers: [1, 2, 3, 4, 5],
                    selectedSupplier: null,
                    secondarySupplier: null,
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
      </div>
      )}

      {/* DB Cards Detail Modal */}
      {dbCardsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">DB Cards Details</h2>
              <button
                onClick={() => setDbCardsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total DB Cards</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDBCards.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${totalValueOfCards.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Store Name</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Qty in DB</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dbCardsData.map((card, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{card.storeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{card.qtyInDB.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">${card.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{totalDBCards.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">${totalValueOfCards.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDbCardsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Store Modal */}
      {Object.entries(showDuplicateStoreModal).map(([storeId, isOpen]) => {
        if (!isOpen) return null;
        const store = filteredStores.find(s => s.id === storeId);
        if (!store || store.isComboInstance) return null;
        
        return (
          <div key={storeId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Duplicate Store</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={duplicateStoreName[storeId] || ""}
                    onChange={(e) => setDuplicateStoreName(prev => ({ ...prev, [storeId]: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter new store name"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDuplicateStoreModal(prev => ({ ...prev, [storeId]: false }));
                      setDuplicateStoreName(prev => {
                        const updated = { ...prev };
                        delete updated[storeId];
                        return updated;
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const newName = duplicateStoreName[storeId]?.trim();
                      if (!newName) {
                        alert("Please enter a new store name");
                        return;
                      }
                      try {
                        duplicateStore(store.name, store.country, newName);
                        const catalog = catalogs.find(c => 
                          c.currency === (store.country === "US" ? "USD" : store.country === "CA" ? "CAD" : "GBP") && 
                          !c.isBranch && 
                          c.name.includes("Default")
                        );
                        if (catalog) {
                          addStoreToCatalog(catalog.id, newName);
                        }
                        alert(`Store "${newName}" has been duplicated.`);
                        setShowDuplicateStoreModal(prev => ({ ...prev, [storeId]: false }));
                        setDuplicateStoreName(prev => {
                          const updated = { ...prev };
                          delete updated[storeId];
                          return updated;
                        });
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Failed to duplicate store");
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Duplicate Combo Instance Modal */}
      {Object.entries(showDuplicateComboModal).map(([comboId, isOpen]) => {
        if (!isOpen) return null;
        const instance = comboInstances.find(ci => ci.id === comboId);
        if (!instance) return null;
        
        return (
          <div key={comboId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Duplicate Combo Card</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Combo Card Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={duplicateComboName[comboId] || ""}
                    onChange={(e) => setDuplicateComboName(prev => ({ ...prev, [comboId]: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter new combo card name"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDuplicateComboModal(prev => ({ ...prev, [comboId]: false }));
                      setDuplicateComboName(prev => {
                        const updated = { ...prev };
                        delete updated[comboId];
                        return updated;
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const newName = duplicateComboName[comboId]?.trim();
                      if (!newName) {
                        alert("Please enter a new combo card name");
                        return;
                      }
                      try {
                        duplicateComboInstance(comboId, newName);
                        alert(`Combo card "${newName}" has been duplicated.`);
                        setShowDuplicateComboModal(prev => ({ ...prev, [comboId]: false }));
                        setDuplicateComboName(prev => {
                          const updated = { ...prev };
                          delete updated[comboId];
                          return updated;
                        });
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Failed to duplicate combo card");
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

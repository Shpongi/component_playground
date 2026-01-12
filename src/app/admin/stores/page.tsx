"use client";

import { useState, useMemo, useEffect } from "react";
import { useAdminData } from "../_components/AdminDataProvider";

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
  
  // 110 US stores
  for (let i = 0; i < 110; i++) {
    const brandName = topUSBrands[i % topUSBrands.length];
    const storeType: "Close" | "Open" | "Combo" = brandName.toLowerCase().includes("visa") ? "Open" : "Close";
    stores.push({
      id: `us-${i + 1}`,
      name: brandName,
      country: "US",
      isActive: true,
      storeType,
    });
  }
  
  // 40 UK stores
  for (let i = 0; i < 40; i++) {
    const brandName = topUKBrands[i % topUKBrands.length];
    const storeType: "Close" | "Open" | "Combo" = brandName.toLowerCase().includes("visa") ? "Open" : "Close";
    stores.push({
      id: `gb-${i + 1}`,
      name: brandName,
      country: "GB",
      isActive: true,
      storeType,
    });
  }
  
  // Note: 110 + 40 = 150, so 0 CA stores. If you want CA stores, we can adjust to 100 US, 40 UK, 10 CA
  
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
    storeSuppliers,
    setStoreSupplierDiscount,
    setStoreSelectedSupplier,
    setStoreSecondarySupplier,
    getStoreContent,
    setStoreContent,
    getStoreImage,
    setStoreImage,
    addStoreToCatalog
  } = useAdminData();
  
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [storeTypeFilter, setStoreTypeFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [supplierModalOpen, setSupplierModalOpen] = useState<Record<string, boolean>>({});
  const [contentModalOpen, setContentModalOpen] = useState<Record<string, boolean>>({});
  const [contentFormData, setContentFormData] = useState<Record<string, { description: string; termsAndConditions: string }>>({});
  const [imageModalOpen, setImageModalOpen] = useState<Record<string, boolean>>({});
  const [imageFormData, setImageFormData] = useState<Record<string, string>>({});
  const [dbCardsModalOpen, setDbCardsModalOpen] = useState(false);
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
  
  const stores: Store[] = useMemo(() => {
    // Map regular stores
    const regularStores = adminStores.map(s => {
      // Determine store type: "Visa" stores are "Open", others are "Close"
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
    
    // Map combo instances as stores
    const comboInstanceStores = comboInstances.map(instance => {
      // Get catalog to determine country
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
    
    // Sort alphabetically by name
    return allStores.sort((a, b) => a.name.localeCompare(b.name));
  }, [adminStores, isStoreActive, comboInstances, catalogs]);

  // Filter stores by currency, store type, and selected supplier
  const filteredStores = useMemo(() => {
    let filtered = stores;
    
    // Filter by currency
    if (currencyFilter !== "all") {
      filtered = filtered.filter(store => {
        if (store.isComboInstance) {
          // For combo instances, get currency from their catalog
          const instance = comboInstances.find(ci => ci.id === store.comboInstanceId);
          if (instance) {
            const catalog = catalogs.find(c => c.id === instance.catalogId);
            return catalog?.currency === currencyFilter;
          }
          return false;
        } else {
          // For regular stores, check if they have a currency property
          const adminStore = adminStores.find(s => s.name === store.name && s.country === store.country);
          if (adminStore && (adminStore as any).currency) {
            return (adminStore as any).currency === currencyFilter;
          }
          // If no currency property, map country to currency
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
          if (store.isComboInstance) return false; // Combo stores don't have suppliers
          const storeKey = `${store.country}-${store.name}`;
          const supplierData = storeSuppliers[storeKey];
          return !supplierData || supplierData.selectedSupplier === null;
        });
      } else {
        const supplierId = parseInt(supplierFilter);
        filtered = filtered.filter(store => {
          if (store.isComboInstance) return false; // Combo stores don't have suppliers
          const storeKey = `${store.country}-${store.name}`;
          const supplierData = storeSuppliers[storeKey];
          return supplierData?.selectedSupplier === supplierId;
        });
      }
    }
    
    return filtered;
  }, [stores, currencyFilter, storeTypeFilter, supplierFilter, comboInstances, catalogs, adminStores, storeSuppliers]);

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
  
  const handleCreateStore = () => {
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
      
      // Find catalog and add store to it
      const catalog = catalogs.find(c => 
        c.currency === storeFormData.currency && !c.isBranch && c.name.includes("Default")
      );
      
      if (catalog) {
        addStoreToCatalog(catalog.id, storeFormData.storeName);
      }
      
      alert(`Store "${storeFormData.storeName}" has been set up with supplier data.`);
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
          <button
            onClick={() => setShowStoreForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            + Create Store
          </button>
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
        {filteredStores.map((store) => {
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
          const uploadedImage = getStoreImage(store.name, store.country, !!store.isComboInstance, store.comboInstanceId);
          
          if (uploadedImage) {
            logoUrl = uploadedImage;
          } else if (store.isComboInstance && store.comboInstanceId) {
            const instance = comboInstances.find(ci => ci.id === store.comboInstanceId);
            logoUrl = instance?.imageUrl || getBrandLogoUrl(store.name);
          } else {
            logoUrl = getBrandLogoUrl(store.name);
          }
          const initials = store.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div 
              key={store.id} 
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
                    alt={store.name}
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
                  <h2 className="text-base font-medium text-gray-900 truncate">{store.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium ${
                      store.country === "US" 
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : store.country === "GB"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}>
                {store.country}
              </span>
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
              {!store.isComboInstance && (() => {
                const storeKey = `${store.country}-${store.name}`;
                const supplierData = storeSuppliers[storeKey] || { selectedSupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
                const selectedSupplier = supplierData.selectedSupplier;
                const offeringCount = (supplierData.offeringSuppliers || [1, 2, 3, 4, 5]).length;
                const selectedMargin = selectedSupplier !== null && selectedSupplier !== undefined 
                  ? supplierData.discounts[selectedSupplier] || 0 
                  : null;
                return (
                  <div className="mb-3">
                    {selectedSupplier !== null && selectedSupplier !== undefined && selectedMargin !== null ? (
                      <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="text-xs font-medium text-green-800">
                          Supplier {selectedSupplier} Selected
                        </div>
                        <div className="text-xs text-green-700 mt-0.5">
                          Margin: {selectedMargin.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2 text-xs text-gray-500">
                        No supplier selected
                      </div>
                    )}
                    {offeringCount < 5 && (
                      <div className="text-xs text-gray-500 mb-1">
                        {offeringCount}/5 suppliers available
                      </div>
                    )}
                    <button
                      onClick={() => setSupplierModalOpen(prev => ({ ...prev, [store.id]: true }))}
                      className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 border border-blue-200"
                    >
                      Manage Suppliers
                    </button>
                  </div>
                );
              })()}
              <div className="flex items-center justify-between mt-3 gap-2">
                <div className="flex gap-2 flex-1">
                  <button
                    onClick={() => {
                      const content = getStoreContent(store.name, store.country, !!store.isComboInstance, store.comboInstanceId);
                      setContentFormData(prev => ({
                        ...prev,
                        [store.id]: { ...content }
                      }));
                      setContentModalOpen(prev => ({ ...prev, [store.id]: true }));
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 border border-purple-200"
                  >
                    Edit T&C & Description
                  </button>
                  <button
                    onClick={() => {
                      const currentImage = getStoreImage(store.name, store.country, !!store.isComboInstance, store.comboInstanceId);
                      setImageFormData(prev => ({
                        ...prev,
                        [store.id]: currentImage || ""
                      }));
                      setImageModalOpen(prev => ({ ...prev, [store.id]: true }));
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 border border-indigo-200"
                  >
                    {uploadedImage ? "Update Image" : "Upload Image"}
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
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
          );
        })}
      </div>

      {/* Supplier Management Modals */}
      {filteredStores.filter(s => !s.isComboInstance).map(store => {
        const storeKey = `${store.country}-${store.name}`;
        const supplierData = storeSuppliers[storeKey] || { selectedSupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
        const isOpen = supplierModalOpen[store.id];
        if (!isOpen) return null;

        const offeringSuppliers = supplierData.offeringSuppliers || [1, 2, 3, 4, 5];

        return (
          <div key={`supplier-modal-${store.id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Manage Suppliers - {store.name}</h2>
                <button
                  onClick={() => setSupplierModalOpen(prev => ({ ...prev, [store.id]: false }))}
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
                            setStoreSelectedSupplier(store.name, store.country, isSelected ? null : supplierId);
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
                            setStoreSupplierDiscount(store.name, store.country, supplierId, value);
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
                  onClick={() => setSupplierModalOpen(prev => ({ ...prev, [store.id]: false }))}
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
        const isOpen = contentModalOpen[store.id];
        if (!isOpen) return null;

        const formData = contentFormData[store.id] || getStoreContent(store.name, store.country, !!store.isComboInstance, store.comboInstanceId);

        return (
          <div key={`content-modal-${store.id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Content - {store.name}</h2>
                <button
                  onClick={() => setContentModalOpen(prev => ({ ...prev, [store.id]: false }))}
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
                      [store.id]: { ...formData, description: e.target.value }
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
                      [store.id]: { ...formData, termsAndConditions: e.target.value }
                    }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setContentModalOpen(prev => ({ ...prev, [store.id]: false }))}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStoreContent(
                      store.name,
                      store.country,
                      !!store.isComboInstance,
                      store.comboInstanceId,
                      formData
                    );
                    setContentModalOpen(prev => ({ ...prev, [store.id]: false }));
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
        const isOpen = imageModalOpen[store.id];
        if (!isOpen) return null;

        const formData = imageFormData[store.id] || "";

        return (
          <div key={`image-modal-${store.id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload/Update Image - {store.name}</h2>
                <button
                  onClick={() => setImageModalOpen(prev => ({ ...prev, [store.id]: false }))}
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
                      [store.id]: e.target.value
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
                            [store.id]: base64String
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
                  onClick={() => setImageModalOpen(prev => ({ ...prev, [store.id]: false }))}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                {formData && (
                  <button
                    onClick={() => {
                      setStoreImage(
                        store.name,
                        store.country,
                        !!store.isComboInstance,
                        store.comboInstanceId,
                        null
                      );
                      setImageModalOpen(prev => ({ ...prev, [store.id]: false }));
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
                      store.country,
                      !!store.isComboInstance,
                      store.comboInstanceId,
                      formData || null
                    );
                    setImageModalOpen(prev => ({ ...prev, [store.id]: false }));
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

      {/* Create Store Form Modal */}
      {showStoreForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create Store</h2>
            
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
                  Denominations
                </label>
                <input
                  type="text"
                  value={storeFormData.denominations.join(", ")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                    setStoreFormData(prev => ({ ...prev, denominations: values.length > 0 ? values : [25, 50, 100] }));
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="25, 50, 100"
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Create Store
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
    </section>
  );
}

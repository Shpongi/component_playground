"use client";

import { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";

export type Country = "US" | "CA" | "GB";
export type Currency = "USD" | "CAD" | "GBP";

export type Product = { 
  id: string; 
  name: string; 
  sku?: string;
  category?: string;
  comboProduct?: boolean;
  containsAlcohol?: boolean;
  lowMargin?: boolean;
};
export type Store = { name: string; country: Country; products: Product[] };
export type FeeType = 'percentage' | 'fixed';

export type Category = {
  id: string;
  name: string;
};

export type SwapListStatus = 'DRAFT' | 'ACTIVE';

export type SwapList = {
  id: string;
  name: string;
  tenantId: string;
  baseCurrency: Currency;
  allowedCategories: string[]; // category IDs
  applyAlcoholExclusion: boolean;
  applyLowMarginExclusion: boolean;
  applyComboProductExclusion: boolean;
  status: SwapListStatus;
  dateModified: Date;
};

// Default Combo - Global template
export type MasterCombo = {
  id: string;
  name: string; // Internal name, e.g., "Master Top 20"
  currency: Currency;
  storeNames: string[];
  isActive: boolean;
  imageUrl?: string;
  dateModified: Date;
};

// Combo Instance - Catalog-specific instance
export type ComboInstance = {
  id: string;
  catalogId: string;
  masterComboId: string | null; // null if custom combo
  displayName: string; // Tenant-specific display name
  imageUrl?: string;
  customStoreNames: string[] | null; // Only used if masterComboId is null
  denominations: number[];
  isActive: boolean;
  dateModified: Date;
};

// Legacy Combo type for backward compatibility (will be migrated)
export type Combo = {
  id: string;
  name: string;
  currency: Currency;
  storeNames: string[];
  isActive: boolean;
  imageUrl?: string;
  denominations: number[];
};

export type Fee = {
  type: FeeType;
  value: number;
};

export type Catalog = {
  id: string;
  name: string;
  country: Country;
  currency: Currency;
  stores: Store[];
  storeDiscounts: Record<string, number>; // storeName -> discount percentage (0-100)
  storeCSS: Record<string, string>; // storeName -> custom CSS styles
  storeFees: Record<string, Fee>; // storeName -> additional fee
  catalogFee?: Fee; // catalog-level fee
  isBranch: boolean; // true if this is a branch catalog
  parentId?: string; // ID of parent catalog (for branches)
  branchChanges: {
    addedStores: string[]; // store names added in this branch
    removedStores: string[]; // store names removed in this branch
    discountOverrides: Record<string, number>; // discount changes from parent
    cssOverrides: Record<string, string>; // CSS changes from parent
    feeOverrides: Record<string, Fee>; // fee changes from parent (per store)
    catalogFeeOverride?: Fee; // catalog-level fee override for branch
    storeOrder?: string[]; // optional explicit order of effective stores for this branch
  };
};
export type Tenant = { id: string; name: string; country: Country };

type AdminDataContextValue = {
  tenants: Tenant[];
  stores: Store[];
  catalogs: Catalog[];
  activeCatalogByTenant: Record<string, string>;
  setActiveCatalogForTenant: (tenantId: string, catalogId: string) => void;
  addStoreToCatalog: (catalogId: string, storeName: string) => void;
  addStoresToCatalog: (catalogId: string, storeNames: string[]) => void;
  removeStoreFromCatalog: (catalogId: string, storeName: string) => void;
  setStoreDiscount: (catalogId: string, storeName: string, discount: number) => void;
  setStoreCSS: (catalogId: string, storeName: string, css: string) => void;
  createBranch: (parentId: string, branchName: string) => string;
  deleteBranch: (branchId: string) => void;
  getEffectiveCatalog: (catalogId: string) => Catalog;
  getEffectiveCatalogForTenant: (tenantId: string, catalogId: string) => Catalog;
  getTenantsForCatalog: (catalogId: string) => Tenant[];
  addTenantToCatalog: (catalogId: string, tenantId: string) => void;
  removeTenantFromCatalog: (catalogId: string, tenantId: string) => void;
  // Events wrap all features (discounts, stores, order)
  tenantCatalogEvents: Record<string, Record<string, Record<string, {
    discounts: Record<string, number>; // storeName -> discount
    stores: { stores: string[]; comboInstances: string[] };
    order: string[];
  }>>>; // tenantId -> catalogId -> eventId -> { discounts, stores, order }
  tenantCatalogSelectedEvent: Record<string, Record<string, string>>; // tenantId -> catalogId -> eventId
  setTenantCatalogSelectedEvent: (tenantId: string, catalogId: string, eventId: string) => void;
  createTenantCatalogEvent: (tenantId: string, catalogId: string, eventName: string) => string;
  deleteTenantCatalogEvent: (tenantId: string, catalogId: string, eventId: string) => void;
  getTenantCatalogEvents: (tenantId: string, catalogId: string) => Array<{ id: string; name: string }>;
  // Event-based feature functions
  setTenantCatalogStoreDiscount: (tenantId: string, catalogId: string, eventId: string, storeName: string, discount: number) => void;
  updateTenantCatalogStoreOrder: (tenantId: string, catalogId: string, eventId: string, storeOrder: string[]) => void;
  addTenantCatalogStore: (tenantId: string, catalogId: string, eventId: string, storeName: string) => void;
  removeTenantCatalogStore: (tenantId: string, catalogId: string, eventId: string, storeName: string) => void;
  addTenantCatalogComboInstance: (tenantId: string, catalogId: string, eventId: string, comboInstanceId: string) => void;
  removeTenantCatalogComboInstance: (tenantId: string, catalogId: string, eventId: string, comboInstanceId: string) => void;
  // Legacy/global features (not event-based)
  setTenantCatalogStoreVisibility: (tenantId: string, catalogId: string, storeName: string, hidden: boolean) => void;
  tenantCatalogHiddenStores: Record<string, Record<string, Set<string>>>;
  tenantCatalogFeatureFlags: Record<string, Record<string, { discounts?: boolean; visibility?: boolean; order?: boolean; stores?: boolean; forceSupplier?: boolean }>>;
  setTenantCatalogFeatureFlag: (tenantId: string, catalogId: string, feature: 'discounts' | 'visibility' | 'order' | 'stores' | 'forceSupplier', enabled: boolean) => void;
  tenantCatalogForcedSupplier: Record<string, Record<string, number | null>>; // tenantId -> catalogId -> supplierId
  setTenantCatalogForcedSupplier: (tenantId: string, catalogId: string, supplierId: number | null) => void;
  moveStoreInCatalog: (catalogId: string, storeName: string, direction: 'up' | 'down') => void;
  // Supplier management for stores
  storeSuppliers: Record<string, { selectedSupplier: number | null; secondarySupplier: number | null; discounts: Record<number, number>; offeringSuppliers: number[] }>; // storeKey -> { selectedSupplier, secondarySupplier, discounts, offeringSuppliers }
  setStoreSupplierDiscount: (storeName: string, country: Country, supplierId: number, discount: number) => void;
  setStoreSelectedSupplier: (storeName: string, country: Country, supplierId: number | null) => void;
  setStoreSecondarySupplier: (storeName: string, country: Country, supplierId: number | null) => void;
  // Store content management (Description & T&C)
  getStoreContent: (storeName: string, country: Country, isComboInstance: boolean, comboInstanceId?: string) => { description: string; termsAndConditions: string };
  setStoreContent: (storeName: string, country: Country, isComboInstance: boolean, comboInstanceId: string | undefined, content: { description: string; termsAndConditions: string }) => void;
  // Store image management
  getStoreImage: (storeName: string, country: Country, isComboInstance: boolean, comboInstanceId?: string) => string | null;
  setStoreImage: (storeName: string, country: Country, isComboInstance: boolean, comboInstanceId: string | undefined, imageUrl: string | null) => void;
  // Tenant notes/descriptions
  getTenantNotes: (tenantId: string) => string;
  setTenantNotes: (tenantId: string, notes: string) => void;
  setStoreFee: (catalogId: string, storeName: string, fee: Fee | null) => void;
  setCatalogFee: (catalogId: string, fee: Fee | null) => void;
  // Redemption/SwapList management
  categories: Category[];
  swapLists: SwapList[];
  createSwapList: (swapList: Omit<SwapList, 'id' | 'dateModified'>) => string;
  updateSwapList: (id: string, updates: Partial<SwapList>) => void;
  deleteSwapList: (id: string) => void;
  getSwapList: (id: string) => SwapList | undefined;
  // Product swap eligibility
  updateProductSwapEligibility: (productId: string, updates: { comboProduct?: boolean; containsAlcohol?: boolean; lowMargin?: boolean }) => void;
  getProduct: (productId: string) => Product | undefined;
  // Catalog swap rules
  catalogSwapRules: Record<string, string>; // catalogId -> swapListId
  setCatalogSwapRule: (catalogId: string, swapListId: string | null) => void;
  // Preview filtered products
  getFilteredProductsForSwapList: (swapListId: string) => Product[];
  // Get tenants using a swap list
  getTenantsUsingSwapList: (swapListId: string) => Tenant[];
  // Add/remove tenants from swap list
  addTenantToSwapList: (swapListId: string, tenantId: string) => void;
  removeTenantFromSwapList: (swapListId: string, tenantId: string) => void;
  // Default Combo management
  masterCombos: MasterCombo[];
  createMasterCombo: (combo: Omit<MasterCombo, 'id' | 'dateModified'>) => string;
  updateMasterCombo: (id: string, updates: Partial<MasterCombo>) => void;
  deleteMasterCombo: (id: string) => void;
  getMasterCombo: (id: string) => MasterCombo | undefined;
  toggleMasterComboActive: (id: string) => void;
  // Combo Instance management
  comboInstances: ComboInstance[];
  createComboInstance: (instance: Omit<ComboInstance, 'id' | 'dateModified'>) => string;
  updateComboInstance: (id: string, updates: Partial<ComboInstance>) => void;
  deleteComboInstance: (id: string) => void;
  getComboInstance: (id: string) => ComboInstance | undefined;
  getComboInstancesForCatalog: (catalogId: string) => ComboInstance[];
  getComboInstancesForTenant: (tenantId: string, catalogId: string) => ComboInstance[];
  getComboInstanceStores: (instanceId: string) => string[];
  // Legacy combo management (for backward compatibility)
  combos: Combo[];
  createCombo: (combo: Omit<Combo, 'id'>) => string;
  updateCombo: (id: string, updates: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  getCombo: (id: string) => Combo | undefined;
  toggleComboActive: (id: string) => void;
  // Internal state access for preview
  productSwapEligibility: Record<string, { comboProduct?: boolean; containsAlcohol?: boolean; lowMargin?: boolean }>;
  // Store active state management
  isStoreActive: (storeName: string, country: Country) => boolean;
  toggleStoreActive: (storeName: string, country: Country) => void;
  getActiveStores: () => Store[];
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

const sampleProductNames = [
  "Classic Tee",
  "Running Shoes",
  "Water Bottle",
  "Hoodie",
  "Backpack",
  "Socks Pack",
  "Bluetooth Earbuds",
  "Fitness Tracker",
  "Baseball Cap",
  "Yoga Mat",
  "Coffee Beans",
  "Organic Granola",
  "Ceramic Plate",
  "Throw Pillow",
  "LED Light Bulbs",
];

function generateProducts(prefix: string, count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const name = sampleProductNames[(i + prefix.length) % sampleProductNames.length];
    return { id: `${prefix}-${i + 1}`, name };
  });
}

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
  "Marriott", "Hilton", "Holiday Inn", "Hyatt", "Sheraton", "Westin", "Radisson", "Best Western", "Comfort Inn", "Days Inn",
  "Delta", "American Airlines", "United Airlines", "Southwest", "JetBlue", "Alaska Airlines", "Spirit", "Frontier", "Hawaiian Airlines", "Allegiant",
  "Uber", "Lyft", "DoorDash", "Grubhub", "Instacart", "Postmates", "Airbnb", "Booking.com", "Expedia", "TripAdvisor",
  "eBay", "Etsy", "Wayfair", "Overstock", "Zappos", "Shopify", "Square", "Stripe", "Zoom", "Slack",
  "Salesforce", "Workday", "ServiceNow", "Splunk", "Tableau", "Snowflake", "Datadog", "Twilio", "Okta", "CrowdStrike",
];

function generateBaseStores(): Store[] {
  // Use first 4 brands as base stores
  return [
    {
      name: topUSBrands[0], // Amazon
      country: "US",
      products: [
        { id: `${topUSBrands[0].toLowerCase()}-1`, name: "Echo Dot" },
        { id: `${topUSBrands[0].toLowerCase()}-2`, name: "Fire TV Stick" },
        { id: `${topUSBrands[0].toLowerCase()}-3`, name: "Kindle Paperwhite" },
        { id: `${topUSBrands[0].toLowerCase()}-4`, name: "Ring Doorbell" },
        { id: `${topUSBrands[0].toLowerCase()}-5`, name: "Alexa Speaker" },
      ],
    },
    {
      name: topUSBrands[1], // Apple
      country: "US",
      products: [
        { id: `${topUSBrands[1].toLowerCase()}-1`, name: "iPhone 15" },
        { id: `${topUSBrands[1].toLowerCase()}-2`, name: "MacBook Pro" },
        { id: `${topUSBrands[1].toLowerCase()}-3`, name: "AirPods Pro" },
        { id: `${topUSBrands[1].toLowerCase()}-4`, name: "iPad Air" },
        { id: `${topUSBrands[1].toLowerCase()}-5`, name: "Apple Watch" },
        { id: `${topUSBrands[1].toLowerCase()}-6`, name: "AirTag" },
      ],
    },
    {
      name: topUSBrands[4], // Walmart
      country: "US",
      products: [
        { id: `${topUSBrands[4].toLowerCase()}-1`, name: "Great Value Pasta" },
        { id: `${topUSBrands[4].toLowerCase()}-2`, name: "Equate Vitamins" },
        { id: `${topUSBrands[4].toLowerCase()}-3`, name: "Mainstays Bedding" },
        { id: `${topUSBrands[4].toLowerCase()}-4`, name: "Ozark Trail Gear" },
        { id: `${topUSBrands[4].toLowerCase()}-5`, name: "George Clothing" },
      ],
    },
    {
      name: topUSBrands[14], // Target
      country: "US",
      products: [
        { id: `${topUSBrands[14].toLowerCase()}-1`, name: "Threshold Bath Towel" },
        { id: `${topUSBrands[14].toLowerCase()}-2`, name: "Up&Up Hand Soap" },
        { id: `${topUSBrands[14].toLowerCase()}-3`, name: "Hearth & Hand Mug" },
        { id: `${topUSBrands[14].toLowerCase()}-4`, name: "Room Essentials Lamp" },
        { id: `${topUSBrands[14].toLowerCase()}-5`, name: "Cat & Jack T-Shirt" },
      ],
    },
  ];
}

function generateExtraStores(count: number): Store[] {
  return Array.from({ length: count }, (_, index) => {
    // Use brands starting from index 4 (after the 4 base stores)
    const brandIndex = (index + 4) % topUSBrands.length;
    const storeName = topUSBrands[brandIndex];
    
    // Ensure a good US/CA/GB distribution
    const countryIndex = index % 3;
    const country: Country = countryIndex === 0 ? "US" : countryIndex === 1 ? "CA" : "GB";
    
    const productCount = 5 + ((index % 3) as 0 | 1 | 2); // 5,6,7 cycling
    return {
      name: storeName,
      country,
      products: generateProducts(storeName.toLowerCase().replace(/\s+/g, "-").replace("'", ""), productCount),
    };
  });
}

function buildFixedCountCatalogs(stores: Store[], country: Country, count: number): Catalog[] {
  const sameCountryStores = stores.filter((s) => s.country === country);
  const catalogs: Catalog[] = [];
  
  // Create base catalog (Default USD for US, Default CAD for CA, Default GBP for GB)
  const baseCatalog: Catalog = {
    id: `${country.toLowerCase()}-catalog-base`,
    name: country === "US" ? "Default USD" : country === "CA" ? "Default CAD" : "Default GBP",
    country,
    currency: country === "US" ? "USD" : country === "CA" ? "CAD" : "GBP",
    stores: [...sameCountryStores], // All stores in base catalog
    storeDiscounts: {},
    storeCSS: {},
    storeFees: {},
    isBranch: false,
    branchChanges: {
      addedStores: [],
      removedStores: [],
      discountOverrides: {},
      cssOverrides: {},
      feeOverrides: {}
    }
  };
  
  catalogs.push(baseCatalog);
  
  // Create branch catalogs
  for (let i = 1; i < count; i++) {
    const branchCatalog: Catalog = {
      id: `${country.toLowerCase()}-catalog-${i}`,
      name: `${country} Catalog ${i}`,
      country,
      currency: country === "US" ? "USD" : country === "CA" ? "CAD" : "GBP",
      stores: [], // Branches inherit stores from parent
      storeDiscounts: {},
      storeCSS: {},
      storeFees: {},
      isBranch: true,
      parentId: baseCatalog.id,
      branchChanges: {
        addedStores: [],
        removedStores: [],
        discountOverrides: {},
        cssOverrides: {},
        feeOverrides: {}
      }
    };
    catalogs.push(branchCatalog);
  }
  
  return catalogs;
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const tenants = useMemo<Tenant[]>(() => {
    const tenantList: Tenant[] = [];
    
    // Create 10 NG tenants
    for (let i = 1; i <= 10; i++) {
      tenantList.push({
        id: `tenant-ng-${i}`,
        name: `NG Tenant${i}`,
        country: "US", // Default country, but they support all currencies
      });
    }
    
    // Create 1 Global Tropper
    tenantList.push({
      id: `tenant-global-tropper`,
      name: "Global Tropper",
      country: "US", // Default country, but supports all currencies
    });
    
    // Create 50 HappyTenants
    for (let i = 1; i <= 50; i++) {
      tenantList.push({
        id: `tenant-happy-${i}`,
        name: `HappyTenant${i}`,
        country: "US", // Default country, but they support all currencies
      });
    }
    
    return tenantList;
  }, []);

  const stores = useMemo<Store[]>(() => {
    const base = generateBaseStores();
    const needed = 150 - base.length; // total stores target
    const extras = needed > 0 ? generateExtraStores(needed) : [];
    const allStores = [...base, ...extras];
    
    // Remove duplicates by name and country
    const seen = new Set<string>();
    return allStores.filter(store => {
      const key = `${store.country}-${store.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  const initialCatalogs = useMemo<Catalog[]>(() => {
    // Exactly 300 catalogs: 100 US + 100 CA + 100 GB
    const usCatalogs = buildFixedCountCatalogs(stores, "US", 100);
    const caCatalogs = buildFixedCountCatalogs(stores, "CA", 100);
    const gbCatalogs = buildFixedCountCatalogs(stores, "GB", 100);
    const allCatalogs = [...usCatalogs, ...caCatalogs, ...gbCatalogs];
    
    // Add some sample discounts to demonstrate the feature
    allCatalogs.forEach((catalog) => {
      if (catalog.stores.length > 0) {
        // Only set discount values for 4 specific stores across different catalogs
        // Using first 4 brands: Amazon, Apple, Google, Microsoft
        const storesWithDiscounts = [topUSBrands[0], topUSBrands[1], topUSBrands[2], topUSBrands[3]];
        
        catalog.stores.forEach((store) => {
          if (storesWithDiscounts.includes(store.name)) {
            // Set different discount percentages for these 4 stores
            switch (store.name) {
              case topUSBrands[0]: // Amazon
                catalog.storeDiscounts[store.name] = 5; // 5% discount
                break;
              case topUSBrands[1]: // Apple
                catalog.storeDiscounts[store.name] = 10; // 10% discount
                break;
              case topUSBrands[2]: // Google
                catalog.storeDiscounts[store.name] = 15; // 15% discount
                break;
              case topUSBrands[3]: // Microsoft
                catalog.storeDiscounts[store.name] = 8; // 8% discount
                break;
            }
          }
          // All other stores will have discount capability but no pre-set values (0%)
        });
      }

      // Set one example custom CSS on a known store so it's visible by default
      if (!catalog.isBranch && (catalog.name === "Default USD")) {
        if (catalog.stores.some(s => s.name === 'Nike')) {
          catalog.storeCSS['Nike'] = '{"backgroundColor":"#fff8dc","border":"1px solid #f59e0b","padding":"6px","borderRadius":"6px"}';
        }
      }
    });
    
    return allCatalogs;
  }, [stores]);

  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);

  // Categories - sample data
  const categories = useMemo<Category[]>(() => {
    return [
      { id: "cat-1", name: "Sports & Fitness" },
      { id: "cat-2", name: "Electronics" },
      { id: "cat-3", name: "Home & Kitchen" },
      { id: "cat-4", name: "Clothing & Apparel" },
      { id: "cat-5", name: "Food & Beverages" },
      { id: "cat-6", name: "Health & Beauty" },
      { id: "cat-7", name: "Books & Media" },
      { id: "cat-8", name: "Toys & Games" },
      { id: "cat-9", name: "Automotive" },
      { id: "cat-10", name: "Office Supplies" },
      { id: "cat-11", name: "Garden & Outdoor" },
      { id: "cat-12", name: "Pet Supplies" },
    ];
  }, []);

  // SwapLists state
  const [swapLists, setSwapLists] = useState<SwapList[]>([]);
  
  // Initialize swap lists after tenants and categories are ready
  useEffect(() => {
    if (swapLists.length === 0 && tenants.length > 0 && categories.length > 0) {
      setSwapLists([
        {
          id: "swap-1",
          name: "Full Catalog Swap",
          tenantId: tenants[0]?.id || "",
          baseCurrency: "USD",
          allowedCategories: categories.map(c => c.id),
          applyAlcoholExclusion: true,
          applyLowMarginExclusion: true,
          applyComboProductExclusion: true,
          status: "ACTIVE",
          dateModified: new Date(),
        },
        {
          id: "swap-2",
          name: "Sports Only - Acme Corp",
          tenantId: tenants[1]?.id || "",
          baseCurrency: "USD",
          allowedCategories: ["cat-1"],
          applyAlcoholExclusion: true,
          applyLowMarginExclusion: true,
          applyComboProductExclusion: true,
          status: "DRAFT",
          dateModified: new Date(),
        },
      ]);
    }
  }, [tenants, categories, swapLists.length]);

  // Product swap eligibility state (stored per product)
  const [productSwapEligibility, setProductSwapEligibility] = useState<Record<string, { comboProduct?: boolean; containsAlcohol?: boolean; lowMargin?: boolean }>>({});

  // Catalog swap rules
  const [catalogSwapRules, setCatalogSwapRules] = useState<Record<string, string>>({});

  // Tenant to catalog assignments (for multi-currency tenants)
  // This tracks which catalogs a tenant is assigned to, separate from their active catalog
  const [tenantCatalogAssignments, setTenantCatalogAssignments] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-assignments');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    const assignments: Record<string, string[]> = {};
    const usBaseCatalog = initialCatalogs.find(c => c.name === "Default USD");
    const caBaseCatalog = initialCatalogs.find(c => c.name === "Default CAD");
    const gbBaseCatalog = initialCatalogs.find(c => c.name === "Default GBP");
    
    // All tenants support all currencies - assign all three base catalogs to each tenant
    tenants.forEach((t) => {
      if (usBaseCatalog && caBaseCatalog && gbBaseCatalog) {
        assignments[t.id] = [usBaseCatalog.id, caBaseCatalog.id, gbBaseCatalog.id];
      }
    });
    return assignments;
  });

  // Ensure all tenants always have all three base catalogs assigned (all support all currencies)
  useEffect(() => {
    const usBaseCatalog = catalogs.find(c => c.name === "Default USD");
    const caBaseCatalog = catalogs.find(c => c.name === "Default CAD");
    const gbBaseCatalog = catalogs.find(c => c.name === "Default GBP");
    
    if (usBaseCatalog && caBaseCatalog && gbBaseCatalog) {
      setTenantCatalogAssignments(prev => {
        let updated = false;
        const newAssignments = { ...prev };
        
        // Ensure all tenants have all three base catalogs
        tenants.forEach(t => {
          const current = newAssignments[t.id] || [];
          const required = [usBaseCatalog.id, caBaseCatalog.id, gbBaseCatalog.id];
          const hasAll = required.every(id => current.includes(id));
          
          if (!hasAll) {
            newAssignments[t.id] = [...new Set([...current, ...required])];
            updated = true;
          }
        });
        
        return updated ? newAssignments : prev;
      });
    }
  }, [catalogs, tenants]);

  // Save tenant catalog assignments to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-assignments', JSON.stringify(tenantCatalogAssignments));
    }
  }, [tenantCatalogAssignments]);

  // Tenant-catalog events - wrap all features (discounts, stores, order)
  // Structure: tenantId -> catalogId -> eventId -> { discounts, stores, order }
  const [tenantCatalogEvents, setTenantCatalogEvents] = useState<Record<string, Record<string, Record<string, {
    discounts: Record<string, number>;
    stores: { stores: string[]; comboInstances: string[] };
    order: string[];
  }>>>>(() => {
    if (typeof window !== 'undefined') {
      // Try to load from new structure first
      const saved = localStorage.getItem('admin-tenant-catalog-events');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, try to migrate from old structures
        }
      }
      
      // Migrate from old separate structures
      const migrated: Record<string, Record<string, Record<string, {
        discounts: Record<string, number>;
        stores: { stores: string[]; comboInstances: string[] };
        order: string[];
      }>>> = {};
      
      // Migrate discounts
      const savedDiscounts = localStorage.getItem('admin-tenant-catalog-store-discounts');
      if (savedDiscounts) {
        try {
          const discounts = JSON.parse(savedDiscounts);
          Object.keys(discounts).forEach(tenantId => {
            if (!migrated[tenantId]) migrated[tenantId] = {};
            Object.keys(discounts[tenantId]).forEach(catalogId => {
              if (!migrated[tenantId][catalogId]) migrated[tenantId][catalogId] = {};
              const catalogDiscounts = discounts[tenantId][catalogId];
              
              // Check if it's old structure (storeName -> discount) or new (eventId -> storeName -> discount)
              if (catalogDiscounts && typeof catalogDiscounts === 'object') {
                const firstKey = Object.keys(catalogDiscounts)[0];
                if (firstKey && (typeof catalogDiscounts[firstKey] === 'number')) {
                  // Old structure - migrate to "default" event
                  if (!migrated[tenantId][catalogId]['default']) {
                    migrated[tenantId][catalogId]['default'] = {
                      discounts: catalogDiscounts as Record<string, number>,
                      stores: { stores: [], comboInstances: [] },
                      order: []
                    };
                  } else {
                    migrated[tenantId][catalogId]['default'].discounts = catalogDiscounts as Record<string, number>;
                  }
                } else {
                  // New structure with events - migrate each event
                  Object.keys(catalogDiscounts).forEach(eventId => {
                    if (!migrated[tenantId][catalogId][eventId]) {
                      migrated[tenantId][catalogId][eventId] = {
                        discounts: catalogDiscounts[eventId] as Record<string, number>,
                        stores: { stores: [], comboInstances: [] },
                        order: []
                      };
                    } else {
                      migrated[tenantId][catalogId][eventId].discounts = catalogDiscounts[eventId] as Record<string, number>;
                    }
                  });
                }
              }
            });
          });
        } catch {
          // Ignore migration errors
        }
      }
      
      // Migrate stores
      const savedStores = localStorage.getItem('admin-tenant-catalog-stores');
      if (savedStores) {
        try {
          const stores = JSON.parse(savedStores);
          Object.keys(stores).forEach(tenantId => {
            if (!migrated[tenantId]) migrated[tenantId] = {};
            Object.keys(stores[tenantId]).forEach(catalogId => {
              if (!migrated[tenantId][catalogId]) migrated[tenantId][catalogId] = {};
              const catalogStores = stores[tenantId][catalogId];
              if (!migrated[tenantId][catalogId]['default']) {
                migrated[tenantId][catalogId]['default'] = {
                  discounts: {},
                  stores: catalogStores || { stores: [], comboInstances: [] },
                  order: []
                };
              } else {
                migrated[tenantId][catalogId]['default'].stores = catalogStores || { stores: [], comboInstances: [] };
              }
            });
          });
        } catch {
          // Ignore migration errors
        }
      }
      
      // Migrate order
      const savedOrder = localStorage.getItem('admin-tenant-catalog-store-order');
      if (savedOrder) {
        try {
          const order = JSON.parse(savedOrder);
          Object.keys(order).forEach(tenantId => {
            if (!migrated[tenantId]) migrated[tenantId] = {};
            Object.keys(order[tenantId]).forEach(catalogId => {
              if (!migrated[tenantId][catalogId]) migrated[tenantId][catalogId] = {};
              const catalogOrder = order[tenantId][catalogId];
              if (!migrated[tenantId][catalogId]['default']) {
                migrated[tenantId][catalogId]['default'] = {
                  discounts: {},
                  stores: { stores: [], comboInstances: [] },
                  order: catalogOrder || []
                };
              } else {
                migrated[tenantId][catalogId]['default'].order = catalogOrder || [];
              }
            });
          });
        } catch {
          // Ignore migration errors
        }
      }
      
      return migrated;
    }
    return {};
  });

  // Selected event per tenant-catalog (tenantId -> catalogId -> eventId)
  const [tenantCatalogSelectedEvent, setTenantCatalogSelectedEvent] = useState<Record<string, Record<string, string>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-selected-event');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Set default USD catalog as active for all tenants (all support all currencies, default to USD)
  useEffect(() => {
    if (tenants.length === 0 || catalogs.length === 0) return;
    
    const defaultUSCatalog = catalogs.find(c => c.name === "Default USD" && !c.isBranch);
    if (!defaultUSCatalog) return;
    
    // Set default USD catalog as active for all tenants that don't have an active catalog set
    setActiveCatalogByTenant(prev => {
      const updated = { ...prev };
      let changed = false;
      
      tenants.forEach(tenant => {
        if (!prev[tenant.id]) {
          updated[tenant.id] = defaultUSCatalog.id;
          changed = true;
        }
      });
      
      return changed ? updated : prev;
    });
  }, [tenants.length, catalogs.length]); // Only run when tenants and catalogs are loaded

  // Save tenant-catalog events to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-events', JSON.stringify(tenantCatalogEvents));
    }
  }, [tenantCatalogEvents]);

  // Save selected event to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-selected-event', JSON.stringify(tenantCatalogSelectedEvent));
    }
  }, [tenantCatalogSelectedEvent]);

  // Tenant-catalog-specific store visibility (tenantId -> catalogId -> Set<storeName>)
  // If a store is in this map for a tenant-catalog, it means it's HIDDEN for that tenant-catalog
  const [tenantCatalogHiddenStores, setTenantCatalogHiddenStores] = useState<Record<string, Record<string, Set<string>>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-hidden-stores');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert arrays back to Sets
          const result: Record<string, Record<string, Set<string>>> = {};
          Object.entries(parsed).forEach(([tenantId, catalogData]) => {
            result[tenantId] = {};
            Object.entries(catalogData as Record<string, string[]>).forEach(([catalogId, stores]) => {
              result[tenantId][catalogId] = new Set(stores);
            });
          });
          return result;
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save tenant-catalog hidden stores to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Convert Sets to arrays for JSON serialization
      const serializable: Record<string, Record<string, string[]>> = {};
      Object.entries(tenantCatalogHiddenStores).forEach(([tenantId, catalogData]) => {
        serializable[tenantId] = {};
        Object.entries(catalogData).forEach(([catalogId, stores]) => {
          serializable[tenantId][catalogId] = Array.from(stores);
        });
      });
      localStorage.setItem('admin-tenant-catalog-hidden-stores', JSON.stringify(serializable));
    }
  }, [tenantCatalogHiddenStores]);

  // Tenant-catalog-specific store order (tenantId -> catalogId -> storeName[])
  const [tenantCatalogStoreOrder, setTenantCatalogStoreOrder] = useState<Record<string, Record<string, string[]>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-store-order');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save tenant-catalog store order to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-store-order', JSON.stringify(tenantCatalogStoreOrder));
    }
  }, [tenantCatalogStoreOrder]);

  // Tenant-catalog feature flags (which features are enabled per tenant-catalog)
  const [tenantCatalogFeatureFlags, setTenantCatalogFeatureFlags] = useState<Record<string, Record<string, { discounts?: boolean; visibility?: boolean; order?: boolean; stores?: boolean; forceSupplier?: boolean }>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-feature-flags');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save tenant-catalog feature flags to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-feature-flags', JSON.stringify(tenantCatalogFeatureFlags));
    }
  }, [tenantCatalogFeatureFlags]);

  function setTenantCatalogFeatureFlag(tenantId: string, catalogId: string, feature: 'discounts' | 'visibility' | 'order' | 'stores' | 'forceSupplier', enabled: boolean) {
    setTenantCatalogFeatureFlags(prev => {
      const tenantFlags = prev[tenantId] || {};
      const current = tenantFlags[catalogId] || {};
      if (!enabled) {
        const updated = { ...current };
        delete updated[feature];
        if (Object.keys(updated).length === 0) {
          const newTenantFlags = { ...tenantFlags };
          delete newTenantFlags[catalogId];
          if (Object.keys(newTenantFlags).length === 0) {
            const newFlags = { ...prev };
            delete newFlags[tenantId];
            return newFlags;
          }
          return { ...prev, [tenantId]: newTenantFlags };
        }
        return { ...prev, [tenantId]: { ...tenantFlags, [catalogId]: updated } };
      }
      
      // When enabling a feature, ensure default event exists
      const updatedFlags = { ...prev, [tenantId]: { ...tenantFlags, [catalogId]: { ...current, [feature]: true } } };
      
      // Ensure default event exists for this tenant-catalog
      setTenantCatalogEvents(prevEvents => {
        const tenantCatalogs = prevEvents[tenantId] || {};
        const catalogEvents = tenantCatalogs[catalogId] || {};
        
        // If default event doesn't exist, create it
        if (!catalogEvents['default']) {
          return {
            ...prevEvents,
            [tenantId]: {
              ...tenantCatalogs,
              [catalogId]: {
                ...catalogEvents,
                'default': {
                  discounts: {},
                  stores: { stores: [], comboInstances: [] },
                  order: []
                }
              }
            }
          };
        }
        return prevEvents;
      });
      
      // Ensure default event is selected if no event is currently selected
      setTenantCatalogSelectedEvent(prevSelected => {
        if (!prevSelected[tenantId]?.[catalogId]) {
          return {
            ...prevSelected,
            [tenantId]: {
              ...(prevSelected[tenantId] || {}),
              [catalogId]: 'default'
            }
          };
        }
        return prevSelected;
      });
      
      return updatedFlags;
    });
  }

  // Tenant-specific stores state
  const [tenantCatalogStores, setTenantCatalogStores] = useState<Record<string, Record<string, { stores: string[]; comboInstances: string[] }>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-stores');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save tenant-catalog stores to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-stores', JSON.stringify(tenantCatalogStores));
    }
  }, [tenantCatalogStores]);

  function addTenantCatalogStore(tenantId: string, catalogId: string, eventId: string, storeName: string) {
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      
      // Ensure event exists (especially default event)
      if (!catalogEvents[eventId]) {
        catalogEvents[eventId] = { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
      }
      
      const eventData = catalogEvents[eventId];
      
      if (!eventData.stores.stores.includes(storeName)) {
        return {
          ...prev,
          [tenantId]: {
            ...tenantCatalogs,
            [catalogId]: {
              ...catalogEvents,
              [eventId]: {
                ...eventData,
                stores: {
                  ...eventData.stores,
                  stores: [...eventData.stores.stores, storeName]
                }
              }
            }
          }
        };
      }
      return prev;
    });
  }

  function removeTenantCatalogStore(tenantId: string, catalogId: string, eventId: string, storeName: string) {
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      const eventData = catalogEvents[eventId];
      if (!eventData) return prev;
      
      const updatedStores = eventData.stores.stores.filter(s => s !== storeName);
      
      return {
        ...prev,
        [tenantId]: {
          ...tenantCatalogs,
          [catalogId]: {
            ...catalogEvents,
            [eventId]: {
              ...eventData,
              stores: {
                ...eventData.stores,
                stores: updatedStores
              }
            }
          }
        }
      };
    });
  }

  function addTenantCatalogComboInstance(tenantId: string, catalogId: string, eventId: string, comboInstanceId: string) {
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      
      // Ensure event exists (especially default event)
      if (!catalogEvents[eventId]) {
        catalogEvents[eventId] = { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
      }
      
      const eventData = catalogEvents[eventId];
      
      if (!eventData.stores.comboInstances.includes(comboInstanceId)) {
        return {
          ...prev,
          [tenantId]: {
            ...tenantCatalogs,
            [catalogId]: {
              ...catalogEvents,
              [eventId]: {
                ...eventData,
                stores: {
                  ...eventData.stores,
                  comboInstances: [...eventData.stores.comboInstances, comboInstanceId]
                }
              }
            }
          }
        };
      }
      return prev;
    });
  }

  function removeTenantCatalogComboInstance(tenantId: string, catalogId: string, eventId: string, comboInstanceId: string) {
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      const eventData = catalogEvents[eventId];
      if (!eventData) return prev;
      
      const updatedComboInstances = eventData.stores.comboInstances.filter(id => id !== comboInstanceId);
      
      return {
        ...prev,
        [tenantId]: {
          ...tenantCatalogs,
          [catalogId]: {
            ...catalogEvents,
            [eventId]: {
              ...eventData,
              stores: {
                ...eventData.stores,
                comboInstances: updatedComboInstances
              }
            }
          }
        }
      };
    });
  }

  // Tenant-catalog forced supplier state
  const [tenantCatalogForcedSupplier, setTenantCatalogForcedSupplierState] = useState<Record<string, Record<string, number | null>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-forced-supplier');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save tenant-catalog forced supplier to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-catalog-forced-supplier', JSON.stringify(tenantCatalogForcedSupplier));
    }
  }, [tenantCatalogForcedSupplier]);

  function setTenantCatalogForcedSupplier(tenantId: string, catalogId: string, supplierId: number | null) {
    setTenantCatalogForcedSupplierState(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      if (supplierId === null) {
        // Remove the forced supplier
        const newTenantCatalogs = { ...tenantCatalogs };
        delete newTenantCatalogs[catalogId];
        if (Object.keys(newTenantCatalogs).length === 0) {
          const newForced = { ...prev };
          delete newForced[tenantId];
          return newForced;
        }
        return { ...prev, [tenantId]: newTenantCatalogs };
      }
      return {
        ...prev,
        [tenantId]: {
          ...tenantCatalogs,
          [catalogId]: supplierId
        }
      };
    });
  }

  // Default Combos state - initialize empty, load from localStorage in useEffect
  const [masterCombos, setMasterCombos] = useState<MasterCombo[]>([]);

  // Combo Instances state - initialize empty, load from localStorage in useEffect
  const [comboInstances, setComboInstances] = useState<ComboInstance[]>([]);
  const comboInstancesInitializedRef = useRef(false);

  // Legacy combos state - initialize empty, load from localStorage in useEffect
  const [combos, setCombos] = useState<Combo[]>([]);

  // Store active state - load from localStorage
  const [storeActiveState, setStoreActiveState] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-store-active-state');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    // Default: all stores active
    const state: Record<string, boolean> = {};
    stores.forEach(s => {
      const key = `${s.country}-${s.name}`;
      state[key] = true;
    });
    return state;
  });

  // Initialize store active state for any new stores
  useEffect(() => {
    setStoreActiveState(prev => {
      const updated = { ...prev };
      let changed = false;
      stores.forEach(s => {
        const key = `${s.country}-${s.name}`;
        if (!(key in updated)) {
          updated[key] = true; // Default new stores to active
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [stores]);

  // Save store active state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-store-active-state', JSON.stringify(storeActiveState));
    }
  }, [storeActiveState]);

  // Load from localStorage after mount to prevent hydration errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMasterCombos = localStorage.getItem('admin-master-combos');
      if (savedMasterCombos) {
        try {
          const parsed = JSON.parse(savedMasterCombos);
          setMasterCombos(parsed.map((c: Omit<MasterCombo, 'dateModified'> & { dateModified?: string }) => ({
            ...c,
            dateModified: c.dateModified ? new Date(c.dateModified) : new Date(),
          })));
        } catch {
          // Keep empty array
        }
      }

      const savedComboInstances = localStorage.getItem('admin-combo-instances');
      if (savedComboInstances) {
        try {
          const parsed = JSON.parse(savedComboInstances);
          // If we have 10 or more instances in localStorage, mark as initialized
          if (parsed.length >= 10) {
            comboInstancesInitializedRef.current = true;
          }
          setComboInstances(parsed.map((c: Omit<ComboInstance, 'dateModified'> & { dateModified?: string }) => ({
            ...c,
            dateModified: c.dateModified ? new Date(c.dateModified) : new Date(),
          })));
        } catch {
          // Keep empty array
        }
      }

      const savedCombos = localStorage.getItem('admin-combos');
      if (savedCombos) {
        try {
          setCombos(JSON.parse(savedCombos));
        } catch {
          // Keep empty array
        }
      }
    }
  }, []);

  // Save default combos to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-master-combos', JSON.stringify(masterCombos));
    }
  }, [masterCombos]);

  // Save combo instances to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-combo-instances', JSON.stringify(comboInstances));
    }
  }, [comboInstances]);

  // Initialize default master combos (one per currency)
  useEffect(() => {
    if (stores.length === 0) return;
    
    // Check if default master combos already exist
    const hasUSDDefault = masterCombos.some(m => m.name === "Default Combo Card" && m.currency === "USD");
    const hasCADDefault = masterCombos.some(m => m.name === "Default Combo Card" && m.currency === "CAD");
    const hasGBPDefault = masterCombos.some(m => m.name === "Default Combo Card" && m.currency === "GBP");
    
    const newCombos: MasterCombo[] = [];
    
    // Get stores for each currency
    const usStores = stores.filter(s => s.country === "US").slice(0, 5).map(s => s.name);
    const caStores = stores.filter(s => s.country === "CA").slice(0, 5).map(s => s.name);
    const gbStores = stores.filter(s => s.country === "GB").slice(0, 5).map(s => s.name);
    
    if (!hasUSDDefault && usStores.length > 0) {
      newCombos.push({
        id: `master-combo-default-usd-${Date.now()}`,
        name: "Default Combo Card",
        currency: "USD",
        storeNames: usStores,
        isActive: true,
        dateModified: new Date(),
      });
    }
    
    if (!hasCADDefault && caStores.length > 0) {
      newCombos.push({
        id: `master-combo-default-cad-${Date.now() + 1}`,
        name: "Default Combo Card",
        currency: "CAD",
        storeNames: caStores,
        isActive: true,
        dateModified: new Date(),
      });
    }
    
    if (!hasGBPDefault && gbStores.length > 0) {
      newCombos.push({
        id: `master-combo-default-gbp-${Date.now() + 2}`,
        name: "Default Combo Card",
        currency: "GBP",
        storeNames: gbStores,
        isActive: true,
        dateModified: new Date(),
      });
    }
    
    if (newCombos.length > 0) {
      setMasterCombos(prev => [...prev, ...newCombos]);
    }
  }, [stores, masterCombos]);

  // Save legacy combos to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-combos', JSON.stringify(combos));
    }
  }, [combos]);

  // Initialize 10 combo instances (some based on defaults, some custom) on first load
  useEffect(() => {
    if (catalogs.length === 0 || masterCombos.length === 0 || stores.length === 0) return;
    
    // Check localStorage first to avoid reinitializing after a refresh
    if (typeof window !== 'undefined') {
      const savedComboInstances = localStorage.getItem('admin-combo-instances');
      if (savedComboInstances) {
        try {
          const parsed = JSON.parse(savedComboInstances);
          // If we already have 10 or more combo instances saved, mark as initialized and don't reinitialize
          if (parsed.length >= 10) {
            comboInstancesInitializedRef.current = true;
            return;
          }
        } catch {
          // If parsing fails, continue with initialization
        }
      }
    }
    
    // Check if we already have combo instances in state
    // Only initialize if we have fewer than 10 combo instances
    if (comboInstances.length >= 10) {
      comboInstancesInitializedRef.current = true;
      return;
    }
    
    // If we've already attempted initialization in this session, don't do it again
    if (comboInstancesInitializedRef.current) return;

    // Get base catalogs (one per currency)
    const usCatalog = catalogs.find(c => c.name === "Default USD");
    const caCatalog = catalogs.find(c => c.name === "Default CAD");
    const gbCatalog = catalogs.find(c => c.name === "Default GBP");
    
    if (!usCatalog || !caCatalog || !gbCatalog) return;

    // Get default master combos
    const usdMasterCombo = masterCombos.find(m => m.name === "Default Combo Card" && m.currency === "USD");
    const cadMasterCombo = masterCombos.find(m => m.name === "Default Combo Card" && m.currency === "CAD");
    const gbpMasterCombo = masterCombos.find(m => m.name === "Default Combo Card" && m.currency === "GBP");

    const newComboInstances: ComboInstance[] = [];

    // Combo names for variety
    const comboNames = [
      "Premium Combo Card",
      "Elite Combo Card",
      "Ultimate Combo Card",
      "Super Combo Card",
      "Deluxe Combo Card",
      "Platinum Combo Card",
      "Gold Combo Card",
      "Silver Combo Card",
      "Bronze Combo Card",
      "Classic Combo Card"
    ];

    // Create 10 combo instances distributed across catalogs
    // 4 USD, 3 CAD, 3 GBP
    // Some based on defaults (masterComboId set), some custom (customStoreNames set)
    for (let i = 0; i < 10; i++) {
      let catalog: Catalog;
      let masterCombo: MasterCombo | undefined;
      let currency: Currency;
      let country: Country;
      
      if (i < 4) {
        // First 4: USD
        catalog = usCatalog;
        masterCombo = usdMasterCombo;
        currency = "USD";
        country = "US";
      } else if (i < 7) {
        // Next 3: CAD
        catalog = caCatalog;
        masterCombo = cadMasterCombo;
        currency = "CAD";
        country = "CA";
      } else {
        // Last 3: GBP
        catalog = gbCatalog;
        masterCombo = gbpMasterCombo;
        currency = "GBP";
        country = "GB";
      }

      // Get stores for this currency
      const currencyStores = stores.filter(s => s.country === country);

      // Alternate between based on defaults and custom
      // First 3 (0, 1, 2) and 7, 8 are based on defaults
      // Others (3, 4, 5, 6, 9) are custom
      const isBasedOnDefaults = i < 3 || (i >= 7 && i < 9);

      // Create combo instance
      const comboInstance: ComboInstance = {
        id: `combo-instance-init-${i}-${Date.now()}`,
        catalogId: catalog.id,
        masterComboId: isBasedOnDefaults && masterCombo ? masterCombo.id : null,
        displayName: comboNames[i],
        imageUrl: `https://via.placeholder.com/300x200?text=${encodeURIComponent(comboNames[i])}`,
        customStoreNames: isBasedOnDefaults ? null : currencyStores.slice(0, 5).map(s => s.name),
        denominations: [25, 50, 100, 200, 500],
        isActive: true,
        dateModified: new Date(),
      };

      newComboInstances.push(comboInstance);
    }

    if (newComboInstances.length > 0) {
      setComboInstances(prev => {
        // Double-check localStorage to avoid duplicates on reload
        if (typeof window !== 'undefined') {
          const savedComboInstances = localStorage.getItem('admin-combo-instances');
          if (savedComboInstances) {
            try {
              const parsed = JSON.parse(savedComboInstances);
              // If localStorage has 10 or more, use that instead and mark as initialized
              if (parsed.length >= 10) {
                comboInstancesInitializedRef.current = true;
                // Check if the parsed instances match what we have in state
                const parsedKeys = new Set(parsed.map((c: ComboInstance) => `${c.catalogId}-${c.displayName}`));
                const prevKeys = new Set(prev.map(ci => `${ci.catalogId}-${ci.displayName}`));
                // If they're the same, return prev to avoid unnecessary updates
                if (parsedKeys.size === prevKeys.size && [...parsedKeys].every(k => prevKeys.has(k))) {
                  return prev;
                }
                return parsed.map((c: Omit<ComboInstance, 'dateModified'> & { dateModified?: string }) => ({
                  ...c,
                  dateModified: c.dateModified ? new Date(c.dateModified) : new Date(),
                }));
              }
            } catch {
              // If parsing fails, continue with current logic
            }
          }
        }
        
        // Only add if we have fewer than 10 total
        if (prev.length >= 10) {
          comboInstancesInitializedRef.current = true;
          return prev;
        }
        
        // Check if we already have instances with the same display name
        const existingKeys = new Set(prev.map(ci => `${ci.catalogId}-${ci.displayName}`));
        
        // Filter out any new instances that would duplicate existing ones
        const uniqueToAdd = newComboInstances.filter(ci => {
          const key = `${ci.catalogId}-${ci.displayName}`;
          // Don't add if we already have this exact combo
          return !existingKeys.has(key);
        });
        
        // Only add up to 10 total
        const needed = 10 - prev.length;
        const toAdd = uniqueToAdd.slice(0, needed);
        
        if (toAdd.length > 0) {
          comboInstancesInitializedRef.current = true;
        }
        
        return [...prev, ...toAdd];
      });
    }
  }, [catalogs, masterCombos, stores]);


  const [activeCatalogByTenant, setActiveCatalogByTenant] = useState<Record<string, string>>(() => {
    // Set base catalogs as default for all tenants
    const usBaseCatalog = initialCatalogs.find(c => c.name === "Default USD");
    
    const mapping: Record<string, string> = {};
    // All tenants support all currencies - default all to USD
    tenants.forEach((t) => {
      mapping[t.id] = usBaseCatalog?.id || "";
    });
    return mapping;
  });

  function setActiveCatalogForTenant(tenantId: string, catalogId: string) {
    setActiveCatalogByTenant((prev) => ({ ...prev, [tenantId]: catalogId }));
  }

  function addStoreToCatalog(catalogId: string, storeName: string) {
    addStoresToCatalog(catalogId, [storeName]);
  }

  function addStoresToCatalog(catalogId: string, storeNames: string[]) {
    console.log(`[addStoresToCatalog] Adding stores to catalog ${catalogId}:`, storeNames);
    setCatalogs((prev) => {
      return prev.map((c) => {
        if (c.id !== catalogId) return c;
        // Only allow adding active stores
        const pool = stores.filter((s) => s.country === c.country && isStoreActive(s.name, s.country));
        console.log(`[addStoresToCatalog] Catalog ${catalogId} (${c.country}) has ${pool.length} available stores`);
        console.log(`[addStoresToCatalog] Sample store names:`, pool.slice(0, 5).map(s => s.name));
        
        // Remove duplicates from storeNames
        const uniqueStoreNames = Array.from(new Set(storeNames));
        console.log(`[addStoresToCatalog] Unique store names to add:`, uniqueStoreNames);
        
        const toAdd = uniqueStoreNames
          .map(name => {
            const found = pool.find((s) => s.name === name);
            if (!found) {
              console.warn(`[addStoresToCatalog] Store "${name}" not found in ${c.country} stores.`);
              console.warn(`[addStoresToCatalog] Available store names (first 20):`, pool.slice(0, 20).map(s => s.name));
              // Try case-insensitive match
              const caseInsensitiveMatch = pool.find((s) => s.name.toLowerCase() === name.toLowerCase());
              if (caseInsensitiveMatch) {
                console.warn(`[addStoresToCatalog] Found case-insensitive match: "${caseInsensitiveMatch.name}" for "${name}"`);
                return caseInsensitiveMatch;
              }
            }
            return found;
          })
          .filter((s): s is typeof stores[0] => s !== undefined);

        console.log(`[addStoresToCatalog] Found ${toAdd.length} stores to add out of ${uniqueStoreNames.length} requested`);

        if (toAdd.length === 0) {
          console.error(`[addStoresToCatalog] No stores found to add to catalog ${catalogId}. Requested:`, uniqueStoreNames);
          console.error(`[addStoresToCatalog] Available stores in pool:`, pool.map(s => s.name));
          return c;
        }

        // Branch catalogs store deltas in branchChanges
        if (c.isBranch) {
          const effective = getEffectiveCatalog(c.id).stores.map(s => s.name);
          const added = new Set(c.branchChanges.addedStores);
          const removed = new Set(c.branchChanges.removedStores);
          
          const newStoreNames: string[] = [];
          toAdd.forEach(store => {
            if (!effective.includes(store.name)) {
              removed.delete(store.name);
              added.add(store.name);
              newStoreNames.push(store.name);
            }
          });

          if (added.size === c.branchChanges.addedStores.length && 
              removed.size === c.branchChanges.removedStores.length) {
            return c; // No changes
          }

          // Update storeOrder to put new stores at the beginning
          const currentOrder = c.branchChanges.storeOrder || effective;
          const newOrder = [...newStoreNames, ...currentOrder.filter(name => !newStoreNames.includes(name))];

          return {
            ...c,
            branchChanges: {
              ...c.branchChanges,
              addedStores: Array.from(added),
              removedStores: Array.from(removed),
              storeOrder: newOrder,
            },
          };
        }

        // Base catalogs keep concrete store lists
        const existingNames = new Set(c.stores.map(s => s.name));
        const newStores = toAdd.filter(s => {
          if (existingNames.has(s.name)) {
            console.log(`Store "${s.name}" already exists in catalog ${catalogId}, skipping`);
            return false;
          }
          return true;
        });
        
        if (newStores.length === 0) {
          console.log(`All ${toAdd.length} stores already exist in catalog ${catalogId}`);
          return c;
        }
        
        console.log(`[addStoresToCatalog] Adding ${newStores.length} new stores to catalog ${catalogId} (${toAdd.length} total requested):`, newStores.map(s => s.name));
        // Add new stores at the beginning of the list
        const updatedCatalog = { ...c, stores: [...newStores, ...c.stores] };
        console.log(`[addStoresToCatalog] Catalog ${catalogId} now has ${updatedCatalog.stores.length} stores (was ${c.stores.length})`);
        return updatedCatalog;
      });
    });
  }

  function removeStoreFromCatalog(catalogId: string, storeName: string) {
    setCatalogs((prev) =>
      prev.map((c) => {
        if (c.id !== catalogId) return c;

        // Branch catalogs store deltas in branchChanges
        if (c.isBranch) {
          const added = new Set(c.branchChanges.addedStores);
          const removed = new Set(c.branchChanges.removedStores);
          // If the store was added explicitly by this branch, undo that add
          if (added.has(storeName)) {
            added.delete(storeName);
          } else {
            // Otherwise mark it as removed relative to parent
            removed.add(storeName);
          }

          const newDiscounts = { ...c.storeDiscounts };
          const newCSS = { ...c.storeCSS };
          const newFees = { ...c.storeFees };
          const newFeeOverrides = { ...c.branchChanges.feeOverrides };
          delete newDiscounts[storeName];
          delete newCSS[storeName];
          delete newFees[storeName];
          delete newFeeOverrides[storeName];

          return {
            ...c,
            storeDiscounts: newDiscounts,
            storeCSS: newCSS,
            storeFees: newFees,
            branchChanges: {
              ...c.branchChanges,
              addedStores: Array.from(added),
              removedStores: Array.from(removed),
              feeOverrides: newFeeOverrides,
            },
          };
        }

        // Base catalogs keep concrete store lists
        const newStores = c.stores.filter((s) => s.name !== storeName);
        const newDiscounts = { ...c.storeDiscounts };
        const newCSS = { ...c.storeCSS };
        const newFees = { ...c.storeFees };
        delete newDiscounts[storeName]; // Remove discount when store is removed
        delete newCSS[storeName]; // Remove CSS when store is removed
        delete newFees[storeName]; // Remove fee when store is removed
        return { ...c, stores: newStores, storeDiscounts: newDiscounts, storeCSS: newCSS, storeFees: newFees };
      })
    );
  }

  function setStoreDiscount(catalogId: string, storeName: string, discount: number) {
    setCatalogs((prev) =>
      prev.map((c) => {
        if (c.id !== catalogId) return c;
        const clamped = Math.max(0, Math.min(100, discount));
        if (c.isBranch) {
          // Write to branch overrides
          const overrides = { ...c.branchChanges.discountOverrides } as Record<string, number>;
          if (clamped === 0) {
            delete overrides[storeName];
          } else {
            overrides[storeName] = clamped;
          }
          return {
            ...c,
            branchChanges: {
              ...c.branchChanges,
              discountOverrides: overrides,
            },
          };
        } else {
          // Base catalog direct map
          const newDiscounts = { ...c.storeDiscounts };
          if (clamped === 0) {
            delete newDiscounts[storeName];
          } else {
            newDiscounts[storeName] = clamped;
          }
          return { ...c, storeDiscounts: newDiscounts };
        }
      })
    );
  }

  function setStoreCSS(catalogId: string, storeName: string, css: string) {
    setCatalogs((prev) =>
      prev.map((c) => {
        if (c.id !== catalogId) return c;
        if (c.isBranch) {
          const overrides = { ...c.branchChanges.cssOverrides } as Record<string, string>;
          if (css.trim() === "") {
            delete overrides[storeName];
          } else {
            overrides[storeName] = css;
          }
          return {
            ...c,
            branchChanges: {
              ...c.branchChanges,
              cssOverrides: overrides,
            },
          };
        } else {
          const newCSS = { ...c.storeCSS };
          if (css === "") {
            delete newCSS[storeName]; // Remove CSS if empty
          } else {
            newCSS[storeName] = css;
          }
          return { ...c, storeCSS: newCSS };
        }
      })
    );
  }

  function createBranch(parentId: string, branchName: string): string {
    const parent = catalogs.find(c => c.id === parentId);
    if (!parent) throw new Error(`Parent catalog ${parentId} not found`);
    
    const branchId = `${parent.country.toLowerCase()}-branch-${Date.now()}`;
    const newBranch: Catalog = {
      id: branchId,
      name: branchName,
      country: parent.country,
      currency: parent.currency,
      stores: [], // Branches inherit stores from parent
      storeDiscounts: {},
      storeCSS: {},
      storeFees: {},
      isBranch: true,
      parentId: parentId,
      branchChanges: {
        addedStores: [],
        removedStores: [],
        discountOverrides: {},
        cssOverrides: {},
        feeOverrides: {}
      }
    };
    
    setCatalogs(prev => [...prev, newBranch]);
    return branchId;
  }

  function deleteBranch(branchId: string) {
    setCatalogs(prev => prev.filter(c => c.id !== branchId));
    // Also remove from tenant assignments
    setActiveCatalogByTenant(prev => {
      const newMapping = { ...prev };
      Object.keys(newMapping).forEach(tenantId => {
        if (newMapping[tenantId] === branchId) {
          // Reset to default catalog
          const defaultCatalog = catalogs.find(c => c.name === "Default USD" || c.name === "Default CAD");
          newMapping[tenantId] = defaultCatalog?.id || "";
        }
      });
      return newMapping;
    });
  }

  function getEffectiveCatalogForTenant(tenantId: string, catalogId: string): Catalog {
    const baseCatalog = getEffectiveCatalog(catalogId);
    const selectedEventId = tenantCatalogSelectedEvent[tenantId]?.[catalogId] || 'default';
    const catalogEvents = tenantCatalogEvents[tenantId]?.[catalogId] || {};
    // If event doesn't exist, use empty structure (it will be created when features are first used)
    const eventData = catalogEvents[selectedEventId] || { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
    
    const hiddenStores = tenantCatalogHiddenStores[tenantId]?.[catalogId] || new Set<string>();
    const flags = tenantCatalogFeatureFlags[tenantId]?.[catalogId] || {};
    const forcedSupplier = tenantCatalogForcedSupplier[tenantId]?.[catalogId];
    
    // If stores feature is enabled, filter to only tenant-specific stores from the event
    let visibleStores = baseCatalog.stores;
    if (flags.stores && eventData.stores) {
      visibleStores = visibleStores.filter(store => eventData.stores.stores.includes(store.name));
    } else {
      // Otherwise, filter out stores that are hidden for this tenant-catalog
      visibleStores = visibleStores.filter(store => !hiddenStores.has(store.name));
    }
    
    // If forceSupplier feature is enabled, filter to only stores where the forced supplier is offering
    if (flags.forceSupplier && forcedSupplier !== null && forcedSupplier !== undefined) {
      visibleStores = visibleStores.filter(store => {
        const storeKey = `${store.country}-${store.name}`;
        const supplierData = storeSuppliers[storeKey];
        const offeringSuppliers = supplierData?.offeringSuppliers || [1, 2, 3, 4, 5];
        return offeringSuppliers.includes(forcedSupplier);
      });
    }
    
    // Apply tenant-catalog-specific store order from the event
    if (eventData.order && eventData.order.length > 0) {
      const storeMap = new Map(visibleStores.map(s => [s.name, s]));
      const ordered: Store[] = [];
      
      // Add stores in custom order
      eventData.order.forEach(storeName => {
        const store = storeMap.get(storeName);
        if (store) {
          ordered.push(store);
          storeMap.delete(storeName);
        }
      });
      
      // Add any remaining stores that weren't in the custom order
      storeMap.forEach(store => ordered.push(store));
      
      visibleStores = ordered;
    }
    
    // Apply tenant-catalog-specific discounts from the event on top of catalog discounts
    const effectiveDiscounts = { ...baseCatalog.storeDiscounts };
    Object.entries(eventData.discounts).forEach(([storeName, discount]) => {
      if (discount === 0) {
        // If discount is 0, remove it (no override)
        delete effectiveDiscounts[storeName];
      } else {
        effectiveDiscounts[storeName] = discount;
      }
    });
    
    return {
      ...baseCatalog,
      stores: visibleStores,
      storeDiscounts: effectiveDiscounts,
      storeCSS: baseCatalog.storeCSS, // Include storeCSS in the returned catalog
    };
  }

  function getEffectiveCatalog(catalogId: string): Catalog {
    const catalog = catalogs.find(c => c.id === catalogId);
    if (!catalog) throw new Error(`Catalog ${catalogId} not found`);
    
    if (!catalog.isBranch) {
      // Filter out inactive stores from base catalog
      const activeStores = catalog.stores.filter(store => isStoreActive(store.name, store.country));
      return { ...catalog, stores: activeStores };
    }
    
    // For branches, merge with parent
    const parent = catalogs.find(c => c.id === catalog.parentId);
    if (!parent) throw new Error(`Parent catalog ${catalog.parentId} not found`);
    
    // Start with parent's stores
    let effectiveStores = [...parent.stores];
    
    // Apply branch changes
    effectiveStores = effectiveStores.filter(store => !catalog.branchChanges.removedStores.includes(store.name));
    
    // Add stores from branch
    const addedStores = stores.filter(store => 
      catalog.branchChanges.addedStores.includes(store.name) && 
      store.country === catalog.country
    );
    effectiveStores.push(...addedStores);
    
    // Merge discounts (branch overrides parent)
    const effectiveDiscounts = { ...parent.storeDiscounts };
    Object.entries(catalog.branchChanges.discountOverrides).forEach(([storeName, discount]) => {
      effectiveDiscounts[storeName] = discount;
    });
    
    // Merge CSS (branch overrides parent)
    const effectiveCSS = { ...parent.storeCSS };
    Object.entries(catalog.branchChanges.cssOverrides).forEach(([storeName, css]) => {
      effectiveCSS[storeName] = css;
    });
    
    // Merge fees (branch overrides parent)
    const effectiveFees = { ...parent.storeFees };
    Object.entries(catalog.branchChanges.feeOverrides).forEach(([storeName, fee]) => {
      effectiveFees[storeName] = fee;
    });
    
    // Catalog-level fee (branch override or parent)
    const effectiveCatalogFee = catalog.branchChanges.catalogFeeOverride ?? parent.catalogFee;
    
    let merged: Catalog = {
      ...catalog,
      stores: effectiveStores,
      storeDiscounts: effectiveDiscounts,
      storeCSS: effectiveCSS,
      storeFees: effectiveFees,
      catalogFee: effectiveCatalogFee
    };

    // Apply branch store order if provided
    const order = catalog.branchChanges.storeOrder;
    if (order && order.length > 0) {
      const byName = new Map(merged.stores.map(s => [s.name, s] as const));
      const ordered: Store[] = [];
      order.forEach(name => {
        const s = byName.get(name);
        if (s) ordered.push(s);
        byName.delete(name);
      });
      // Append any stores not listed in order to the end in original relative order
      merged.stores.forEach(s => {
        if (!order.includes(s.name)) ordered.push(s);
      });
      merged = { ...merged, stores: ordered };
    }

    // Filter out inactive stores
    const activeStores = merged.stores.filter(store => isStoreActive(store.name, store.country));
    merged = { ...merged, stores: activeStores };

    return merged;
  }

  function setStoreFee(catalogId: string, storeName: string, fee: Fee | null) {
    setCatalogs(prev => prev.map(c => {
      if (c.id !== catalogId) return c;
      if (c.isBranch) {
        const overrides = { ...c.branchChanges.feeOverrides };
        if (!fee) {
          delete overrides[storeName];
        } else {
          overrides[storeName] = fee;
        }
        return {
          ...c,
          branchChanges: {
            ...c.branchChanges,
            feeOverrides: overrides
          }
        };
      } else {
        const newFees = { ...c.storeFees };
        if (!fee) {
          delete newFees[storeName];
        } else {
          newFees[storeName] = fee;
        }
        return { ...c, storeFees: newFees };
      }
    }));
  }

  function setCatalogFee(catalogId: string, fee: Fee | null) {
    setCatalogs(prev => prev.map(c => {
      if (c.id !== catalogId) return c;
      if (c.isBranch) {
        return {
          ...c,
          branchChanges: {
            ...c.branchChanges,
            catalogFeeOverride: fee || undefined
          }
        };
      } else {
        return { ...c, catalogFee: fee || undefined };
      }
    }));
  }

  function moveStoreInCatalog(catalogId: string, storeName: string, direction: 'up' | 'down') {
    setCatalogs(prev => prev.map(c => {
      if (c.id !== catalogId) return c;
      if (!c.isBranch) {
        // Reorder base catalog concrete list
        const idx = c.stores.findIndex(s => s.name === storeName);
        if (idx === -1) return c;
        const target = direction === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= c.stores.length) return c;
        const newStores = [...c.stores];
        const [item] = newStores.splice(idx, 1);
        newStores.splice(target, 0, item);
        return { ...c, stores: newStores };
      } else {
        // Reorder branch effective order via storeOrder list
        const effective = getEffectiveCatalog(c.id).stores.map(s => s.name);
        const idx = effective.findIndex(n => n === storeName);
        if (idx === -1) return c;
        const target = direction === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= effective.length) return c;
        const order = [...effective];
        const [n] = order.splice(idx, 1);
        order.splice(target, 0, n);
        return {
          ...c,
          branchChanges: {
            ...c.branchChanges,
            storeOrder: order,
          },
        };
      }
    }));
  }

  function getTenantsForCatalog(catalogId: string): Tenant[] {
    // Return tenants that are assigned to this catalog (either active or in assignments)
    return tenants.filter(tenant => {
      const assignments = tenantCatalogAssignments[tenant.id] || [];
      return assignments.includes(catalogId);
    });
  }

  function addTenantToCatalog(catalogId: string, tenantId: string) {
    setActiveCatalogByTenant(prev => ({ ...prev, [tenantId]: catalogId }));
    // Also add to assignments if not already there
    setTenantCatalogAssignments(prev => {
      const current = prev[tenantId] || [];
      if (!current.includes(catalogId)) {
        return { ...prev, [tenantId]: [...current, catalogId] };
      }
      return prev;
    });
  }

  function updateTenantCatalogStoreOrder(tenantId: string, catalogId: string, eventId: string, storeOrder: string[]) {
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      
      // Ensure event exists (especially default event)
      if (!catalogEvents[eventId]) {
        catalogEvents[eventId] = { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
      }
      
      const eventData = catalogEvents[eventId];
      
      return {
        ...prev,
        [tenantId]: {
          ...tenantCatalogs,
          [catalogId]: {
            ...catalogEvents,
            [eventId]: {
              ...eventData,
              order: storeOrder
            }
          }
        }
      };
    });
  }

  function setTenantCatalogStoreVisibility(tenantId: string, catalogId: string, storeName: string, hidden: boolean) {
    setTenantCatalogHiddenStores(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const current = tenantCatalogs[catalogId] || new Set<string>();
      const updated = new Set(current);
      
      if (hidden) {
        updated.add(storeName);
      } else {
        updated.delete(storeName);
      }
      
      if (updated.size === 0) {
        // Remove empty set
        const newTenantCatalogs = { ...tenantCatalogs };
        delete newTenantCatalogs[catalogId];
        if (Object.keys(newTenantCatalogs).length === 0) {
          const newHidden = { ...prev };
          delete newHidden[tenantId];
          return newHidden;
        }
        return { ...prev, [tenantId]: newTenantCatalogs };
      }
      
      return { ...prev, [tenantId]: { ...tenantCatalogs, [catalogId]: updated } };
    });
  }

  function setTenantCatalogStoreDiscount(tenantId: string, catalogId: string, eventId: string, storeName: string, discount: number) {
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      
      // Ensure event exists (especially default event)
      if (!catalogEvents[eventId]) {
        catalogEvents[eventId] = { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
      }
      
      const eventData = catalogEvents[eventId];
      const clamped = Math.max(0, Math.min(100, discount));
      
      const updatedDiscounts = { ...eventData.discounts };
      if (clamped === 0) {
        delete updatedDiscounts[storeName];
      } else {
        updatedDiscounts[storeName] = clamped;
      }
      
      return {
        ...prev,
        [tenantId]: {
          ...tenantCatalogs,
          [catalogId]: {
            ...catalogEvents,
            [eventId]: {
              ...eventData,
              discounts: updatedDiscounts
            }
          }
        }
      };
    });
  }

  function updateTenantCatalogSelectedEvent(tenantId: string, catalogId: string, eventId: string) {
    setTenantCatalogSelectedEvent(prev => ({
      ...prev,
      [tenantId]: {
        ...(prev[tenantId] || {}),
        [catalogId]: eventId
      }
    }));
  }

  function createTenantCatalogEvent(tenantId: string, catalogId: string, eventName: string): string {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize the event with empty structure
    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      
      return {
        ...prev,
        [tenantId]: {
          ...tenantCatalogs,
          [catalogId]: {
            ...catalogEvents,
            [eventId]: {
              discounts: {},
              stores: { stores: [], comboInstances: [] },
              order: []
            }
          }
        }
      };
    });

    // Store event names separately for easy retrieval
    if (typeof window !== 'undefined') {
      const eventNamesKey = 'admin-tenant-catalog-event-names';
      const saved = localStorage.getItem(eventNamesKey);
      const eventNames: Record<string, Record<string, Record<string, string>>> = saved ? JSON.parse(saved) : {};
      if (!eventNames[tenantId]) eventNames[tenantId] = {};
      if (!eventNames[tenantId][catalogId]) eventNames[tenantId][catalogId] = {};
      eventNames[tenantId][catalogId][eventId] = eventName;
      localStorage.setItem(eventNamesKey, JSON.stringify(eventNames));
    }

    // Select the new event
    updateTenantCatalogSelectedEvent(tenantId, catalogId, eventId);
    
    return eventId;
  }

  function deleteTenantCatalogEvent(tenantId: string, catalogId: string, eventId: string) {
    // Don't allow deleting the default event
    if (eventId === 'default') return;

    setTenantCatalogEvents(prev => {
      const tenantCatalogs = prev[tenantId] || {};
      const catalogEvents = tenantCatalogs[catalogId] || {};
      const newCatalogEvents = { ...catalogEvents };
      delete newCatalogEvents[eventId];
      
      if (Object.keys(newCatalogEvents).length === 0) {
        const newTenantCatalogs = { ...tenantCatalogs };
        delete newTenantCatalogs[catalogId];
        if (Object.keys(newTenantCatalogs).length === 0) {
          const newEvents = { ...prev };
          delete newEvents[tenantId];
          return newEvents;
        }
        return { ...prev, [tenantId]: newTenantCatalogs };
      }
      return { ...prev, [tenantId]: { ...tenantCatalogs, [catalogId]: newCatalogEvents } };
    });

    // Remove event name
    if (typeof window !== 'undefined') {
      const eventNamesKey = 'admin-tenant-catalog-event-names';
      const saved = localStorage.getItem(eventNamesKey);
      if (saved) {
        const eventNames: Record<string, Record<string, Record<string, string>>> = JSON.parse(saved);
        if (eventNames[tenantId]?.[catalogId]?.[eventId]) {
          delete eventNames[tenantId][catalogId][eventId];
          if (Object.keys(eventNames[tenantId][catalogId]).length === 0) {
            delete eventNames[tenantId][catalogId];
          }
          if (Object.keys(eventNames[tenantId]).length === 0) {
            delete eventNames[tenantId];
          }
          localStorage.setItem(eventNamesKey, JSON.stringify(eventNames));
        }
      }
    }

    // If this was the selected event, switch to default
    const selectedEvent = tenantCatalogSelectedEvent[tenantId]?.[catalogId];
    if (selectedEvent === eventId) {
      updateTenantCatalogSelectedEvent(tenantId, catalogId, 'default');
    }
  }

  function getTenantCatalogEvents(tenantId: string, catalogId: string): Array<{ id: string; name: string }> {
    const catalogEvents = tenantCatalogEvents[tenantId]?.[catalogId] || {};
    const eventIds = Object.keys(catalogEvents);
    const flags = tenantCatalogFeatureFlags[tenantId]?.[catalogId] || {};
    const hasAnyFeature = flags.discounts || flags.order || flags.stores || flags.forceSupplier;
    
    // Get event names from localStorage
    let eventNames: Record<string, Record<string, Record<string, string>>> = {};
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-catalog-event-names');
      if (saved) {
        try {
          eventNames = JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }

    const events: Array<{ id: string; name: string }> = [];
    
    // If features are enabled, always include default event (even if it doesn't exist in events yet)
    // This ensures the default event is available when features are first enabled
    if (hasAnyFeature || eventIds.includes('default')) {
      events.push({ id: 'default', name: 'Default' });
    }
    
    // Add other events (non-default)
    eventIds.forEach(eventId => {
      if (eventId !== 'default') {
        events.push({
          id: eventId,
          name: eventNames[tenantId]?.[catalogId]?.[eventId] || eventId
        });
      }
    });

    return events;
  }

  function removeTenantFromCatalog(catalogId: string, tenantId: string) {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    
    const tenantIndex = tenants.findIndex(t => t.id === tenantId);
    const isGlobalTenant = tenantIndex < 3;
    
    // Check if this is a base catalog (Default USD, CAD, or GBP)
    const isBaseCatalog = catalogId === catalogs.find(c => c.name === "Default USD")?.id ||
                         catalogId === catalogs.find(c => c.name === "Default CAD")?.id ||
                         catalogId === catalogs.find(c => c.name === "Default GBP")?.id;
    
    // Don't allow removing global tenants from base catalogs
    if (isGlobalTenant && isBaseCatalog) {
      return; // Prevent removal
    }
    
    // Remove from assignments
    setTenantCatalogAssignments(prev => {
      const current = prev[tenantId] || [];
      const updated = current.filter(id => id !== catalogId);
      return { ...prev, [tenantId]: updated };
    });
    
    // If this was the active catalog, reset to default
    if (activeCatalogByTenant[tenantId] === catalogId) {
      const defaultCatalog = catalogs.find(c => 
        !c.isBranch && 
        ((tenant.country === "US" && c.name === "Default USD") ||
         (tenant.country === "CA" && c.name === "Default CAD") ||
         (tenant.country === "GB" && c.name === "Default GBP"))
      );
      
      if (defaultCatalog) {
        setActiveCatalogByTenant(prev => ({ ...prev, [tenantId]: defaultCatalog.id }));
      }
    }
  }

  // SwapList management functions
  function createSwapList(swapList: Omit<SwapList, 'id' | 'dateModified'>): string {
    const id = `swap-${Date.now()}`;
    const newSwapList: SwapList = {
      ...swapList,
      id,
      dateModified: new Date(),
    };
    setSwapLists(prev => [...prev, newSwapList]);
    return id;
  }

  function updateSwapList(id: string, updates: Partial<SwapList>) {
    setSwapLists(prev => prev.map(list => 
      list.id === id 
        ? { ...list, ...updates, dateModified: new Date() }
        : list
    ));
  }

  function deleteSwapList(id: string) {
    setSwapLists(prev => prev.filter(list => list.id !== id));
    // Also remove from catalog swap rules
    setCatalogSwapRules(prev => {
      const newRules = { ...prev };
      Object.keys(newRules).forEach(catalogId => {
        if (newRules[catalogId] === id) {
          delete newRules[catalogId];
        }
      });
      return newRules;
    });
  }

  function getSwapList(id: string): SwapList | undefined {
    return swapLists.find(list => list.id === id);
  }

  // Product swap eligibility functions
  function updateProductSwapEligibility(productId: string, updates: { comboProduct?: boolean; containsAlcohol?: boolean; lowMargin?: boolean }) {
    setProductSwapEligibility(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates },
    }));
  }

  function getProduct(productId: string): Product | undefined {
    for (const store of stores) {
      const product = store.products.find(p => p.id === productId);
      if (product) {
        const eligibility = productSwapEligibility[productId] || {};
        return {
          ...product,
          comboProduct: eligibility.comboProduct,
          containsAlcohol: eligibility.containsAlcohol,
          lowMargin: eligibility.lowMargin,
        };
      }
    }
    return undefined;
  }

  // Catalog swap rules
  function setCatalogSwapRule(catalogId: string, swapListId: string | null) {
    setCatalogSwapRules(prev => {
      if (swapListId === null) {
        const newRules = { ...prev };
        delete newRules[catalogId];
        return newRules;
      }
      return { ...prev, [catalogId]: swapListId };
    });
  }

  // Get filtered products for a swap list
  function getFilteredProductsForSwapList(swapListId: string): Product[] {
    const swapList = swapLists.find(sl => sl.id === swapListId);
    if (!swapList) return [];

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
          category: product.category || "cat-1", // Default category if not set
        });
      });
    });

    // Apply filters
    return allProducts.filter(product => {
      // Category filter
      if (swapList.allowedCategories.length > 0) {
        if (!product.category || !swapList.allowedCategories.includes(product.category)) {
          return false;
        }
      }

      // Alcohol exclusion
      if (swapList.applyAlcoholExclusion && product.containsAlcohol) {
        return false;
      }

      // Low margin exclusion
      if (swapList.applyLowMarginExclusion && product.lowMargin) {
        return false;
      }

      // Combo product exclusion
      if (swapList.applyComboProductExclusion && product.comboProduct) {
        return false;
      }

      return true;
    });
  }

  // Get tenants using a swap list
  function getTenantsUsingSwapList(swapListId: string): Tenant[] {
    // Find all catalogs that have this swap list as their default swap rule
    const catalogsUsingSwapList = Object.entries(catalogSwapRules)
      .filter(([, listId]) => listId === swapListId)
      .map(([catalogId]) => catalogId);

    // Find all tenants that have those catalogs as their active catalog
    const tenantIds = Object.entries(activeCatalogByTenant)
      .filter(([, catalogId]) => catalogsUsingSwapList.includes(catalogId))
      .map(([tenantId]) => tenantId);

    return tenants.filter(tenant => tenantIds.includes(tenant.id));
  }

  // Default Combo management functions
  function createMasterCombo(combo: Omit<MasterCombo, 'id' | 'dateModified'>): string {
    const id = `master-combo-${Date.now()}`;
    const newCombo: MasterCombo = {
      ...combo,
      id,
      dateModified: new Date(),
    };
    setMasterCombos(prev => [...prev, newCombo]);
    return id;
  }

  function updateMasterCombo(id: string, updates: Partial<MasterCombo>) {
    setMasterCombos(prev => prev.map(combo => 
      combo.id === id ? { ...combo, ...updates, dateModified: new Date() } : combo
    ));
    
    // If storeNames are being updated, clear customStoreNames for all combo instances
    // that are based on this master combo, so they use the new default stores
    if (updates.storeNames !== undefined) {
      setComboInstances(prev => prev.map(instance => {
        // If this instance is based on the updated master combo and has custom stores,
        // clear the custom stores so it uses the new defaults
        if (instance.masterComboId === id && instance.customStoreNames !== null) {
          return { ...instance, customStoreNames: null, dateModified: new Date() };
        }
        return instance;
      }));
    }
  }

  function deleteMasterCombo(id: string) {
    setMasterCombos(prev => prev.filter(combo => combo.id !== id));
    // Also delete all instances that reference this master
    setComboInstances(prev => prev.filter(instance => instance.masterComboId !== id));
  }

  function getMasterCombo(id: string): MasterCombo | undefined {
    return masterCombos.find(combo => combo.id === id);
  }

  function toggleMasterComboActive(id: string) {
    setMasterCombos(prev => prev.map(combo => 
      combo.id === id ? { ...combo, isActive: !combo.isActive, dateModified: new Date() } : combo
    ));
  }

  // Combo Instance management functions
  function createComboInstance(instance: Omit<ComboInstance, 'id' | 'dateModified'>): string {
    const id = `combo-instance-${Date.now()}`;
    const newInstance: ComboInstance = {
      ...instance,
      id,
      dateModified: new Date(),
    };
    setComboInstances(prev => [...prev, newInstance]);
    return id;
  }

  function updateComboInstance(id: string, updates: Partial<ComboInstance>) {
    setComboInstances(prev => prev.map(instance => 
      instance.id === id ? { ...instance, ...updates, dateModified: new Date() } : instance
    ));
  }

  function deleteComboInstance(id: string) {
    setComboInstances(prev => prev.filter(instance => instance.id !== id));
  }

  function getComboInstance(id: string): ComboInstance | undefined {
    return comboInstances.find(instance => instance.id === id);
  }

  function getComboInstancesForCatalog(catalogId: string): ComboInstance[] {
    return comboInstances.filter(instance => instance.catalogId === catalogId);
  }

  function getComboInstancesForTenant(tenantId: string, catalogId: string): ComboInstance[] {
    const allInstances = getComboInstancesForCatalog(catalogId);
    const flags = tenantCatalogFeatureFlags[tenantId]?.[catalogId] || {};
    
    // If stores feature is enabled, use event-based structure to filter combo instances
    if (flags.stores) {
      const selectedEventId = tenantCatalogSelectedEvent[tenantId]?.[catalogId] || 'default';
      const catalogEvents = tenantCatalogEvents[tenantId]?.[catalogId] || {};
      const eventData = catalogEvents[selectedEventId] || { discounts: {}, stores: { stores: [], comboInstances: [] }, order: [] };
      
      // Filter to only tenant-specific combo instances from the event
      if (eventData.stores && eventData.stores.comboInstances) {
        return allInstances.filter(instance => eventData.stores.comboInstances.includes(instance.id));
      }
    }
    
    // Otherwise, return all combo instances for the catalog
    return allInstances;
  }

  function getComboInstanceStores(instanceId: string): string[] {
    const instance = comboInstances.find(i => i.id === instanceId);
    if (!instance) return [];
    
    if (instance.masterComboId) {
      const master = masterCombos.find(m => m.id === instance.masterComboId);
      return master ? master.storeNames : [];
    } else {
      return instance.customStoreNames || [];
    }
  }

  // Legacy combo management functions (for backward compatibility)
  function createCombo(combo: Omit<Combo, 'id'>): string {
    const id = `combo-${Date.now()}`;
    const newCombo: Combo = {
      ...combo,
      id,
    };
    setCombos(prev => [...prev, newCombo]);
    return id;
  }

  function updateCombo(id: string, updates: Partial<Combo>) {
    setCombos(prev => prev.map(combo => 
      combo.id === id ? { ...combo, ...updates } : combo
    ));
  }

  function deleteCombo(id: string) {
    setCombos(prev => prev.filter(combo => combo.id !== id));
  }

  function getCombo(id: string): Combo | undefined {
    return combos.find(combo => combo.id === id);
  }

  function toggleComboActive(id: string) {
    setCombos(prev => prev.map(combo => 
      combo.id === id ? { ...combo, isActive: !combo.isActive } : combo
    ));
  }

  // Add tenant to swap list
  function addTenantToSwapList(swapListId: string, tenantId: string) {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Get the tenant's active catalog
    const catalogId = activeCatalogByTenant[tenantId];
    if (!catalogId) return;

    // Set the catalog's swap rule to this swap list
    setCatalogSwapRule(catalogId, swapListId);
  }

  // Remove tenant from swap list
  function removeTenantFromSwapList(swapListId: string, tenantId: string) {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Get the tenant's active catalog
    const catalogId = activeCatalogByTenant[tenantId];
    if (!catalogId) return;

    // Only remove if this catalog is using this swap list
    if (catalogSwapRules[catalogId] === swapListId) {
      setCatalogSwapRule(catalogId, null);
    }
  }

  // Store active state management functions
  function isStoreActive(storeName: string, country: Country): boolean {
    const key = `${country}-${storeName}`;
    return storeActiveState[key] ?? true; // Default to active if not set
  }

  function toggleStoreActive(storeName: string, country: Country) {
    const key = `${country}-${storeName}`;
    setStoreActiveState(prev => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  }

  function getActiveStores(): Store[] {
    return stores.filter(store => isStoreActive(store.name, store.country));
  }

  // Supplier management for stores
  const [storeSuppliers, setStoreSuppliers] = useState<Record<string, { selectedSupplier: number | null; secondarySupplier: number | null; discounts: Record<number, number>; offeringSuppliers: number[] }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-store-suppliers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save store suppliers to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-store-suppliers', JSON.stringify(storeSuppliers));
    }
  }, [storeSuppliers]);

  // Initialize random margins for all stores and select the supplier with highest margin
  useEffect(() => {
    if (stores.length === 0) return;
    
    setStoreSuppliers(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      stores.forEach(store => {
        const key = `${store.country}-${store.name}`;
        const existing = updated[key];
        
        // Check if store needs initialization or migration
        const needsInitialization = !existing || Object.keys(existing.discounts || {}).length === 0;
        const hasAllSuppliers = existing?.offeringSuppliers?.length === 5;
        const missingOfferingSuppliers = !existing?.offeringSuppliers || existing.offeringSuppliers.length === 0;
        const isAmazonUS = store.name === "Amazon" && store.country === "US";
        const needsAmazonUpdate = isAmazonUS && existing && existing.offeringSuppliers?.includes(3);
        
        // Initialize new stores or migrate stores that have all 5 suppliers (pre-unavailability feature)
        // Also update Amazon (US) if Supplier 3 is currently available
        if (needsInitialization || hasAllSuppliers || needsAmazonUpdate) {
          // Determine which suppliers are offering this store
          const allSuppliers = [1, 2, 3, 4, 5];
          const excludedSuppliers = new Set<number>();
          
          // Use deterministic hash based on store key for consistent results
          const hashKey = `${store.country}-${store.name}`;
          let hash = 0;
          for (let i = 0; i < hashKey.length; i++) {
            hash = (hash * 31 + hashKey.charCodeAt(i)) | 0;
          }
          
          // Use hash to create pseudo-random but consistent results
          const random1 = (Math.abs(hash) % 100) / 100;
          const random2 = ((Math.abs(hash * 7) % 100) / 100);
          const random3 = ((Math.abs(hash * 13) % 100) / 100);
          const random4 = ((Math.abs(hash * 17) % 100) / 100);
          const random5 = ((Math.abs(hash * 19) % 100) / 100);
          
          // Randomly make Supplier 1 unavailable for some brands (35% chance)
          if (random1 < 0.35) {
            excludedSuppliers.add(1);
          }
          
          // Randomly make other suppliers (2, 3, 4, 5) unavailable for 20% of stores each
          if (random2 < 0.20) excludedSuppliers.add(2);
          if (random3 < 0.20) excludedSuppliers.add(3);
          if (random4 < 0.20) excludedSuppliers.add(4);
          if (random5 < 0.20) excludedSuppliers.add(5);
          
          // Special case: Amazon (US) - Supplier 3 is always unavailable
          if (store.name === "Amazon" && store.country === "US") {
            excludedSuppliers.add(3);
          }
          
          // Ensure at least 1 supplier remains available
          if (excludedSuppliers.size >= 5) {
            // If all suppliers are excluded, randomly keep one available
            const randomSupplier = (Math.abs(hash) % 5) + 1;
            excludedSuppliers.delete(randomSupplier);
          }
          
          // Add suppliers that are not excluded
          const offeringSuppliers: number[] = [];
          allSuppliers.forEach(id => {
            if (!excludedSuppliers.has(id)) {
              offeringSuppliers.push(id);
            }
          });
          
          // Generate random margins between 3% and 15% for offering suppliers only
          // Use existing discounts if available, otherwise generate new ones
          const discounts: Record<number, number> = existing?.discounts || {};
          let highestMargin = 0;
          let bestSupplier: number | null = existing?.selectedSupplier || null;

          // Generate margins for offering suppliers that don't have them yet
          offeringSuppliers.forEach(supplierId => {
            if (!discounts[supplierId]) {
              // Use deterministic pseudo-random based on hash and supplier ID
              const supplierHash = Math.abs((hash * (supplierId + 1)) % 10000);
              const margin = Math.round((supplierHash % 1200) / 100 + 3) / 100; // 3-15% range
              discounts[supplierId] = margin;
            }
            
            // Track the supplier with highest margin
            const margin = discounts[supplierId] || 0;
            if (margin > highestMargin) {
              highestMargin = margin;
              bestSupplier = supplierId;
            }
          });
          
          // Remove discounts for suppliers that are no longer offering
          Object.keys(discounts).forEach(supplierIdStr => {
            const supplierId = parseInt(supplierIdStr);
            if (!offeringSuppliers.includes(supplierId)) {
              delete discounts[supplierId];
            }
          });
          
          // Update selected supplier if current one is no longer offering
          if (bestSupplier !== null && !offeringSuppliers.includes(bestSupplier)) {
            // Find the supplier with highest margin among available suppliers
            let newBestSupplier: number | null = null;
            let newHighestMargin = 0;
            offeringSuppliers.forEach(supplierId => {
              const margin = discounts[supplierId] || 0;
              if (margin > newHighestMargin) {
                newHighestMargin = margin;
                newBestSupplier = supplierId;
              }
            });
            bestSupplier = newBestSupplier;
          }
          
          // For Amazon (US), ensure Supplier 3 is not selected if it was previously selected
          if (isAmazonUS && bestSupplier === 3) {
            // Select the supplier with highest margin (excluding Supplier 3)
            let newBestSupplier: number | null = null;
            let newHighestMargin = 0;
            offeringSuppliers.forEach(supplierId => {
              const margin = discounts[supplierId] || 0;
              if (margin > newHighestMargin) {
                newHighestMargin = margin;
                newBestSupplier = supplierId;
              }
            });
            bestSupplier = newBestSupplier;
          }

          updated[key] = {
            selectedSupplier: bestSupplier,
            secondarySupplier: existing?.secondarySupplier || null,
            discounts,
            offeringSuppliers
          };
          hasChanges = true;
        } else if (missingOfferingSuppliers) {
          // Migrate existing data to include offeringSuppliers if missing
          const offeringSuppliers = Object.keys(existing.discounts || {}).map(k => parseInt(k)).filter(k => !isNaN(k));
          updated[key] = {
            ...existing,
            offeringSuppliers: offeringSuppliers.length > 0 ? offeringSuppliers : [1, 2, 3, 4, 5]
          };
          hasChanges = true;
        }
        
        // Cleanup: Ensure no store has an unavailable supplier selected
        if (existing) {
          const offeringSuppliers = existing.offeringSuppliers || [1, 2, 3, 4, 5];
          let needsUpdate = false;
          let newSelectedSupplier = existing.selectedSupplier;
          let newSecondarySupplier = existing.secondarySupplier;
          
          // Check selected supplier
          if (existing.selectedSupplier !== null && !offeringSuppliers.includes(existing.selectedSupplier)) {
            // Selected supplier is not available - find the best available one
            let bestSupplier: number | null = null;
            let highestMargin = 0;
            offeringSuppliers.forEach(supplierId => {
              const margin = existing.discounts[supplierId] || 0;
              if (margin > highestMargin) {
                highestMargin = margin;
                bestSupplier = supplierId;
              }
            });
            newSelectedSupplier = bestSupplier;
            needsUpdate = true;
          }
          
          // Check secondary supplier
          if (existing.secondarySupplier !== null) {
            if (!offeringSuppliers.includes(existing.secondarySupplier)) {
              // Secondary supplier is not available - clear it
              newSecondarySupplier = null;
              needsUpdate = true;
            } else if (existing.secondarySupplier === newSelectedSupplier) {
              // Secondary supplier can't be the same as selected supplier
              newSecondarySupplier = null;
              needsUpdate = true;
            }
          }
          
          if (needsUpdate) {
            updated[key] = {
              ...existing,
              selectedSupplier: newSelectedSupplier,
              secondarySupplier: newSecondarySupplier
            };
            hasChanges = true;
          }
        }
      });

      return hasChanges ? updated : prev;
    });
  }, [stores]);

  function setStoreSupplierDiscount(storeName: string, country: Country, supplierId: number, discount: number) {
    const key = `${country}-${storeName}`;
    setStoreSuppliers(prev => {
      const current = prev[key] || { selectedSupplier: null, secondarySupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
      const offeringSuppliers = current.offeringSuppliers || [1, 2, 3, 4, 5];
      
      // Don't allow setting discount for unavailable suppliers
      if (!offeringSuppliers.includes(supplierId)) {
        return prev; // Return unchanged if supplier is not offering
      }
      
      const updatedDiscounts = {
        ...current.discounts,
        [supplierId]: Math.max(0, Math.min(100, discount)) // Clamp between 0 and 100
      };
      
      // Find the supplier with the highest margin among offering suppliers only
      let highestMargin = 0;
      let bestSupplier: number | null = null;
      
      offeringSuppliers.forEach(id => {
        const margin = updatedDiscounts[id] || 0;
        if (margin > highestMargin) {
          highestMargin = margin;
          bestSupplier = id;
        }
      });
      
      return {
        ...prev,
        [key]: {
          selectedSupplier: bestSupplier,
          secondarySupplier: current.secondarySupplier || null,
          discounts: updatedDiscounts,
          offeringSuppliers: current.offeringSuppliers || [1, 2, 3, 4, 5]
        }
      };
    });
  }

  function setStoreSelectedSupplier(storeName: string, country: Country, supplierId: number | null) {
    const key = `${country}-${storeName}`;
    setStoreSuppliers(prev => {
      const current = prev[key] || { selectedSupplier: null, secondarySupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
      // Only allow selecting suppliers that are offering this store
      const offeringSuppliers = current.offeringSuppliers || [1, 2, 3, 4, 5];
      if (supplierId !== null && !offeringSuppliers.includes(supplierId)) {
        return prev; // Don't allow selecting non-offering suppliers
      }
      return {
        ...prev,
        [key]: {
          ...current,
          selectedSupplier: supplierId
        }
      };
    });
  }

  function setStoreSecondarySupplier(storeName: string, country: Country, supplierId: number | null) {
    const key = `${country}-${storeName}`;
    setStoreSuppliers(prev => {
      const current = prev[key] || { selectedSupplier: null, secondarySupplier: null, discounts: {}, offeringSuppliers: [1, 2, 3, 4, 5] };
      // Only allow selecting suppliers that are offering this store
      const offeringSuppliers = current.offeringSuppliers || [1, 2, 3, 4, 5];
      if (supplierId !== null && !offeringSuppliers.includes(supplierId)) {
        return prev; // Don't allow selecting non-offering suppliers
      }
      // Don't allow secondary supplier to be the same as selected supplier
      if (supplierId !== null && supplierId === current.selectedSupplier) {
        return prev;
      }
      return {
        ...prev,
        [key]: {
          ...current,
          secondarySupplier: supplierId
        }
      };
    });
  }

  // Store descriptions and T&C management
  // For regular stores: key is `${country}-${storeName}`
  // For combo instances: key is `combo-${comboInstanceId}`
  const [storeContent, setStoreContentState] = useState<Record<string, { description: string; termsAndConditions: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-store-content');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save store content to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-store-content', JSON.stringify(storeContent));
    }
  }, [storeContent]);

  function getStoreContent(storeName: string, country: Country, isComboInstance: boolean, comboInstanceId?: string): { description: string; termsAndConditions: string } {
    const key = isComboInstance && comboInstanceId ? `combo-${comboInstanceId}` : `${country}-${storeName}`;
    return storeContent[key] || { description: '', termsAndConditions: '' };
  }

  function setStoreContent(storeName: string, country: Country, isComboInstance: boolean, comboInstanceId: string | undefined, content: { description: string; termsAndConditions: string }) {
    const key = isComboInstance && comboInstanceId ? `combo-${comboInstanceId}` : `${country}-${storeName}`;
    setStoreContentState(prev => ({
      ...prev,
      [key]: content
    }));
  }

  // Store image management
  // For regular stores: key is `${country}-${storeName}`
  // For combo instances: key is `combo-${comboInstanceId}`
  const [storeImages, setStoreImagesState] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-store-images');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save store images to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-store-images', JSON.stringify(storeImages));
    }
  }, [storeImages]);

  function getStoreImage(storeName: string, country: Country, isComboInstance: boolean, comboInstanceId?: string): string | null {
    const key = isComboInstance && comboInstanceId ? `combo-${comboInstanceId}` : `${country}-${storeName}`;
    return storeImages[key] || null;
  }

  function setStoreImage(storeName: string, country: Country, isComboInstance: boolean, comboInstanceId: string | undefined, imageUrl: string | null) {
    const key = isComboInstance && comboInstanceId ? `combo-${comboInstanceId}` : `${country}-${storeName}`;
    setStoreImagesState(prev => {
      if (imageUrl === null) {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }
      return {
        ...prev,
        [key]: imageUrl
      };
    });
  }

  // Tenant notes/descriptions state
  const [tenantNotes, setTenantNotesState] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-tenant-notes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }
    return {};
  });

  // Save tenant notes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-tenant-notes', JSON.stringify(tenantNotes));
    }
  }, [tenantNotes]);

  function getTenantNotes(tenantId: string): string {
    return tenantNotes[tenantId] || '';
  }

  function setTenantNotes(tenantId: string, notes: string) {
    setTenantNotesState(prev => {
      if (!notes.trim()) {
        const updated = { ...prev };
        delete updated[tenantId];
        return updated;
      }
      return {
        ...prev,
        [tenantId]: notes.trim()
      };
    });
  }

  const value: AdminDataContextValue = {
    tenants,
    stores,
    catalogs,
    activeCatalogByTenant,
    setActiveCatalogForTenant,
    addStoreToCatalog,
    addStoresToCatalog,
    removeStoreFromCatalog,
    setStoreDiscount,
    setStoreCSS,
    createBranch,
    deleteBranch,
    getEffectiveCatalog,
    getEffectiveCatalogForTenant,
    getTenantsForCatalog,
    addTenantToCatalog,
    removeTenantFromCatalog,
    tenantCatalogEvents,
    tenantCatalogSelectedEvent,
    setTenantCatalogSelectedEvent: updateTenantCatalogSelectedEvent,
    createTenantCatalogEvent,
    deleteTenantCatalogEvent,
    getTenantCatalogEvents,
    setTenantCatalogStoreDiscount,
    updateTenantCatalogStoreOrder,
    addTenantCatalogStore,
    removeTenantCatalogStore,
    addTenantCatalogComboInstance,
    removeTenantCatalogComboInstance,
    setTenantCatalogStoreVisibility,
    tenantCatalogHiddenStores,
    tenantCatalogFeatureFlags,
    setTenantCatalogFeatureFlag,
    tenantCatalogForcedSupplier,
    setTenantCatalogForcedSupplier,
    moveStoreInCatalog,
    setStoreFee,
    setCatalogFee,
    categories,
    swapLists,
    createSwapList,
    updateSwapList,
    deleteSwapList,
    getSwapList,
    updateProductSwapEligibility,
    getProduct,
    catalogSwapRules,
    setCatalogSwapRule,
    getFilteredProductsForSwapList,
    getTenantsUsingSwapList,
    addTenantToSwapList,
    removeTenantFromSwapList,
    masterCombos,
    createMasterCombo,
    updateMasterCombo,
    deleteMasterCombo,
    getMasterCombo,
    toggleMasterComboActive,
    comboInstances,
    createComboInstance,
    updateComboInstance,
    deleteComboInstance,
    getComboInstance,
    getComboInstancesForCatalog,
    getComboInstancesForTenant,
    getComboInstanceStores,
    combos,
    createCombo,
    updateCombo,
    deleteCombo,
    getCombo,
    toggleComboActive,
    productSwapEligibility,
    isStoreActive,
    toggleStoreActive,
    getActiveStores,
    storeSuppliers,
    setStoreSupplierDiscount,
    setStoreSelectedSupplier,
    setStoreSecondarySupplier,
    getStoreContent,
    setStoreContent,
    getStoreImage,
    setStoreImage,
    getTenantNotes,
    setTenantNotes,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}



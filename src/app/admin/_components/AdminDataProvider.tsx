"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";

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
  getTenantsForCatalog: (catalogId: string) => Tenant[];
  addTenantToCatalog: (catalogId: string, tenantId: string) => void;
  removeTenantFromCatalog: (catalogId: string, tenantId: string) => void;
  moveStoreInCatalog: (catalogId: string, storeName: string, direction: 'up' | 'down') => void;
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
    const companyNames = [
      // US Companies
      "Acme Corporation", "TechFlow Solutions", "Global Dynamics", "Innovation Labs", "Premier Services",
      "Strategic Partners", "Elite Enterprises", "Advanced Systems", "Prime Technologies", "Excellence Group",
      "Dynamic Solutions", "Progressive Industries", "Superior Services", "Leading Edge Corp", "Peak Performance",
      "Summit Ventures", "Pinnacle Group", "Apex Solutions", "Vertex Technologies", "Zenith Enterprises",
      "Nexus Corporation", "Fusion Systems", "Catalyst Group", "Momentum Inc", "Velocity Solutions",
      "Quantum Technologies", "Infinity Corp", "Genesis Industries", "Phoenix Enterprises", "Titan Group",
      "Meridian Solutions", "Horizon Technologies", "Frontier Corp", "Pioneer Systems", "Vanguard Group",
      "Legacy Enterprises", "Heritage Corp", "Tradition Industries", "Classic Solutions", "Timeless Group",
      "Modern Systems", "Contemporary Corp", "Current Technologies", "Present Solutions", "Today's Group",
      "Future Enterprises", "NextGen Corp", "Tomorrow Industries", "Forward Systems", "Ahead Solutions",
      
      // Canadian Companies
      "Maple Leaf Corp", "Northern Lights Inc", "True North Solutions", "Canadian Heritage Group", "Polaris Industries",
      "Aurora Technologies", "Boreal Systems", "Tundra Enterprises", "Glacier Corp", "Timber Solutions",
      "Cedar Group", "Spruce Industries", "Pine Technologies", "Birch Systems", "Oak Enterprises",
      "Hudson Bay Corp", "Great Lakes Group", "Rocky Mountain Inc", "Prairie Solutions", "Atlantic Technologies",
      "Pacific Systems", "Arctic Enterprises", "Subarctic Corp", "Continental Group", "Territorial Industries",
      "Provincial Solutions", "Federal Technologies", "National Systems", "Regional Corp", "Local Enterprises",
      "Community Group", "Municipal Industries", "Urban Solutions", "Rural Technologies", "Metropolitan Corp",
      "Downtown Enterprises", "Uptown Group", "Midtown Industries", "Suburban Solutions", "Countryside Technologies",
      "Wilderness Corp", "Frontier Group", "Pioneer Industries", "Settlement Solutions", "Colonial Technologies",
      "Heritage Corp", "Traditional Group", "Historic Industries", "Classic Solutions", "Vintage Technologies",
      "Modern Systems", "Contemporary Corp", "Current Industries", "Present Solutions", "Today's Group",
      "Future Enterprises", "NextGen Corp", "Tomorrow Industries", "Forward Systems", "Ahead Solutions",
      
      // British Companies
      "Royal Enterprises", "Crown Technologies", "Union Systems", "Commonwealth Corp", "Empire Solutions",
      "Victory Technologies", "Liberty Industries", "Freedom Systems", "Independence Corp", "Sovereign Solutions",
      "Monarch Technologies", "Regal Industries", "Majestic Systems", "Noble Corp", "Aristocratic Solutions",
      "Gentleman Technologies", "Lady Industries", "Duke Systems", "Earl Corp", "Baron Solutions",
      "Knight Technologies", "Squire Industries", "Page Systems", "Yeoman Corp", "Peasant Solutions",
      "Merchant Technologies", "Guild Industries", "Guildhall Systems", "Market Corp", "Fair Solutions",
      "Trading Technologies", "Commerce Industries", "Business Systems", "Enterprise Corp", "Company Solutions",
      "Firm Technologies", "Partnership Industries", "Corporation Systems", "Limited Corp", "Plc Solutions",
      "Ltd Technologies", "Inc Industries", "Co Systems", "Group Corp", "Holdings Solutions",
      "Trust Technologies", "Foundation Industries", "Charity Systems", "Society Corp", "Club Solutions"
    ];
    
    return Array.from({ length: 150 }, (_, index) => ({
      id: `tenant-${index + 1}`,
      name: companyNames[index],
      country: index % 3 === 0 ? "US" : index % 3 === 1 ? "CA" : "GB",
    }));
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

  // Default Combos state - initialize empty, load from localStorage in useEffect
  const [masterCombos, setMasterCombos] = useState<MasterCombo[]>([]);

  // Combo Instances state - initialize empty, load from localStorage in useEffect
  const [comboInstances, setComboInstances] = useState<ComboInstance[]>([]);

  // Legacy combos state - initialize empty, load from localStorage in useEffect
  const [combos, setCombos] = useState<Combo[]>([]);

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

  // Save legacy combos to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-combos', JSON.stringify(combos));
    }
  }, [combos]);

  const [activeCatalogByTenant, setActiveCatalogByTenant] = useState<Record<string, string>>(() => {
    // Set base catalogs as default for all tenants
    const usBaseCatalog = initialCatalogs.find(c => c.name === "Default USD");
    const caBaseCatalog = initialCatalogs.find(c => c.name === "Default CAD");
    const gbBaseCatalog = initialCatalogs.find(c => c.name === "Default GBP");
    
    const mapping: Record<string, string> = {};
    tenants.forEach((t) => {
      const defaultCatalog = t.country === "US" ? usBaseCatalog : 
                            t.country === "CA" ? caBaseCatalog : gbBaseCatalog;
      mapping[t.id] = defaultCatalog?.id || "";
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
        const pool = stores.filter((s) => s.country === c.country);
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

  function getEffectiveCatalog(catalogId: string): Catalog {
    const catalog = catalogs.find(c => c.id === catalogId);
    if (!catalog) throw new Error(`Catalog ${catalogId} not found`);
    
    if (!catalog.isBranch) {
      return catalog; // Base catalogs are returned as-is
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
    return tenants.filter(tenant => activeCatalogByTenant[tenant.id] === catalogId);
  }

  function addTenantToCatalog(catalogId: string, tenantId: string) {
    setActiveCatalogByTenant(prev => ({ ...prev, [tenantId]: catalogId }));
  }

  function removeTenantFromCatalog(catalogId: string, tenantId: string) {
    // Reset to default catalog for the tenant's country
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    
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
    getTenantsForCatalog,
    addTenantToCatalog,
    removeTenantFromCatalog,
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
    getComboInstanceStores,
    combos,
    createCombo,
    updateCombo,
    deleteCombo,
    getCombo,
    toggleComboActive,
    productSwapEligibility,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}



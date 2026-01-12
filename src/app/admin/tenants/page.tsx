"use client";

import { useState, useEffect } from "react";
import { useAdminData } from "../_components/AdminDataProvider";
import type { Store, Tenant } from "../_components/AdminDataProvider";

export default function TenantsPage() {
  const { 
    tenants, 
    activeCatalogByTenant, 
    setActiveCatalogForTenant, 
    catalogs, 
    getEffectiveCatalog,
    getEffectiveCatalogForTenant,
    comboInstances,
    getComboInstancesForCatalog,
    getComboInstancesForTenant,
    getComboInstanceStores,
    getMasterCombo,
    stores,
    generateTenantDescription,
  } = useAdminData();
  const [previewTenantId, setPreviewTenantId] = useState<string | null>(null);
  const [previewCurrency, setPreviewCurrency] = useState<"USD" | "CAD" | "GBP" | null>(null);
  const [expandedSummaryTenantId, setExpandedSummaryTenantId] = useState<string | null>(null);
  const catalogsById = Object.fromEntries(catalogs.map((c) => [c.id, c]));
  
  // Find base catalogs (Default USD, Default CAD, and Default GBP)
  const defaultUSCatalog = catalogs.find(c => c.name === "Default USD");
  const defaultCACatalog = catalogs.find(c => c.name === "Default CAD");
  const defaultGBCatalog = catalogs.find(c => c.name === "Default GBP");

  // Get stores and discounts for preview tenant
  const previewTenant = previewTenantId ? tenants.find(t => t.id === previewTenantId) : null;
  const isGlobalTenant = previewTenant && tenants.findIndex(t => t.id === previewTenant.id) < 3;
  
  // Determine which catalog to preview
  const previewCatalogId = (() => {
    if (!previewTenant) return null;
    
    // For global tenants, use selected currency or default to active catalog
    if (isGlobalTenant && previewCurrency) {
      const currencyCatalog = previewCurrency === "USD" ? defaultUSCatalog :
                             previewCurrency === "CAD" ? defaultCACatalog : defaultGBCatalog;
      return currencyCatalog?.id || null;
    }
    
    // For regular tenants or if no currency selected, use active catalog
    return activeCatalogByTenant[previewTenant.id] || null;
  })();
  // Use tenant-specific catalog view to include tenant-specific discounts
  const previewCatalog = previewCatalogId && previewTenant 
    ? getEffectiveCatalogForTenant(previewTenant.id, previewCatalogId) 
    : null;
  const previewStores: Store[] = previewCatalog ? previewCatalog.stores : [];
  const previewDiscounts = previewCatalog ? previewCatalog.storeDiscounts : {};
  const previewStoreCSS = previewCatalog ? previewCatalog.storeCSS : {};
  const previewComboInstances = previewCatalogId && previewTenant 
    ? getComboInstancesForTenant(previewTenant.id, previewCatalogId) 
    : [];
  
  // Reset currency selector when tenant changes
  useEffect(() => {
    if (previewTenantId && isGlobalTenant && !previewCurrency) {
      // Default to USD for global tenants
      setPreviewCurrency("USD");
    } else if (previewTenantId && !isGlobalTenant) {
      setPreviewCurrency(null);
    }
  }, [previewTenantId, isGlobalTenant, previewCurrency]);

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

  return (
    <section className="section">
      <header className="section-header">
        <h1 className="section-title">Tenants</h1>
        <p className="section-description">
          Active catalog per tenant. 
          <span className="font-medium text-blue-600">Default USD</span>, <span className="font-medium text-blue-600">Default CAD</span>, and <span className="font-medium text-blue-600">Default GBP</span> are the base catalogs.
          Tenants can use branches for custom configurations.
        </p>
      </header>

      <div className="card">
        <ul className="list space-y-3">
          {tenants.map((tenant, index) => {
            // First 3 tenants (HappyTenant1, NG Tenant1, Global Tropper) are global and can access all currencies
            const isGlobalTenant = index < 3;
            const available = isGlobalTenant 
              ? catalogs // All catalogs for global tenants
              : catalogs.filter((c) => c.country === tenant.country); // Country-specific for others
            const activeId = activeCatalogByTenant[tenant.id];
            const active = catalogsById[activeId];
            const defaultCatalog = tenant.country === "US" ? defaultUSCatalog : 
                                  tenant.country === "CA" ? defaultCACatalog : defaultGBCatalog;
            const isUsingDefault = activeId === defaultCatalog?.id;
            
            return (
              <li key={tenant.id} className="list-item border border-gray-200 rounded-lg p-4 mb-3 bg-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{tenant.name}</div>
                      {isUsingDefault ? (
                        <span className="badge badge-success">
                          Default
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Country: {tenant.country}</div>
                    {active && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Active: {active.name} {active.isBranch ? '(Branch)' : '(Base)'} 
                        ({getEffectiveCatalog(activeId).stores.length} effective stores)
                        {active.isBranch && (
                          <span className="ml-1 text-orange-600">
                            ← inherits from {catalogsById[active.parentId!]?.name}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Auto-generated Tenant Configuration Description */}
                    <div className="mt-3">
                      {expandedSummaryTenantId === tenant.id ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-900 mb-1">Configuration Summary:</p>
                              <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                                {generateTenantDescription(tenant.id)}
                              </p>
                            </div>
                            <button
                              onClick={() => setExpandedSummaryTenantId(null)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Hide
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExpandedSummaryTenantId(tenant.id)}
                          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium border border-blue-300"
                        >
                          Configuration Summary
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewTenantId(tenant.id)}
                      className="btn btn-success btn-xs"
                    >
                      Preview
                    </button>
                  </div>
                </div>
                {/* Branch catalog info */}
                {active?.isBranch && (
                  <div className="expandable-section">
                    <div className="text-xs text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-medium text-blue-900 mb-1">Using Branch Catalog</p>
                      <p className="text-blue-700">
                        This tenant is using a branch catalog ({active.name}). To modify stores, discounts, or visibility, 
                        please edit the branch catalog in the <a href="/admin/catalogs" className="underline font-medium">Catalogs</a> page.
                      </p>
                      {(() => {
                        const effectiveCatalog = getEffectiveCatalog(activeId);
                        const baseCatalog = catalogs.find(c => c.id === active.parentId);
                        if (baseCatalog) {
                          const baseStores = getEffectiveCatalog(baseCatalog.id).stores.map(s => s.name);
                          const branchStores = effectiveCatalog.stores.map(s => s.name);
                          const removedStores = baseStores.filter(name => !branchStores.includes(name));
                          const addedStores = branchStores.filter(name => !baseStores.includes(name));
                          
                          return (
                            <div className="mt-2 space-y-1">
                              {removedStores.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium text-red-700">Removed stores:</span> {removedStores.join(", ")}
                                </div>
                              )}
                              {addedStores.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium text-green-700">Added stores:</span> {addedStores.join(", ")}
                                </div>
                              )}
                              {Object.keys(active.branchChanges.discountOverrides || {}).length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium text-blue-700">Discount overrides:</span> {Object.entries(active.branchChanges.discountOverrides || {}).map(([store, discount]) => `${store} (${discount}%)`).join(", ")}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Preview Lightbox */}
      {previewTenantId && previewTenant && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewTenantId(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Store Logos for {previewTenant.name}
                  </h3>
                  {isGlobalTenant && (
                    <select
                      value={previewCurrency || "USD"}
                      onChange={(e) => setPreviewCurrency(e.target.value as "USD" | "CAD" | "GBP")}
                      className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {previewStores.length} store{previewStores.length !== 1 ? 's' : ''} 
                  {previewComboInstances.length > 0 && (
                    <> and {previewComboInstances.length} combo card{previewComboInstances.length !== 1 ? 's' : ''}</>
                  )} in {previewCurrency ? `${previewCurrency} ` : ''}catalog
                </p>
              </div>
              <button
                onClick={() => {
                  setPreviewTenantId(null);
                  setPreviewCurrency(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {previewStores.length === 0 && previewComboInstances.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No stores or combo cards available for this tenant&apos;s catalog.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Combo Cards */}
                  {previewComboInstances.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Combo Cards ({previewComboInstances.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {previewComboInstances.map((instance) => {
                          const storeNames = getComboInstanceStores(instance.id);
                          const master = instance.masterComboId ? getMasterCombo(instance.masterComboId) : null;

                          return (
                            <div
                              key={instance.id}
                              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-300 hover:shadow-md transition-all bg-purple-50 relative"
                            >
                              <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-purple-300 shadow-sm">
                                {instance.imageUrl ? (
                                  <img
                                    src={instance.imageUrl}
                                    alt={instance.displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<span class="text-xs font-semibold text-purple-600">COMBO</span>`;
                                      }
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs font-semibold text-purple-600">COMBO</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-900 text-center font-semibold truncate w-full" title={instance.displayName}>
                                {instance.displayName}
                              </span>
                              <div className="text-[10px] text-purple-700 font-medium">
                                {storeNames.length} store{storeNames.length !== 1 ? 's' : ''}
                              </div>
                              {instance.denominations.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {instance.denominations.slice(0, 3).map(d => (
                                    <span key={d} className="text-[9px] px-1.5 py-0.5 bg-green-200 text-green-800 rounded font-bold">
                                      ${d}
                                    </span>
                                  ))}
                                  {instance.denominations.length > 3 && (
                                    <span className="text-[9px] text-gray-600">+{instance.denominations.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Regular Stores */}
                  {previewStores.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Stores ({previewStores.length})</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                        {previewStores.map((store) => {
                          const logoUrl = getBrandLogoUrl(store.name);
                          const initials = store.name
                            .split(" ")
                            .map(word => word[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase();
                          const discount = previewDiscounts[store.name] || 0;
                          const storeCSSString = previewStoreCSS[store.name];
                          let storeCSS: React.CSSProperties = {};
                          if (storeCSSString) {
                            try {
                              storeCSS = JSON.parse(storeCSSString);
                            } catch (e) {
                              // If parsing fails, ignore CSS
                            }
                          }

                          return (
                            <div
                              key={store.name}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white relative"
                              style={storeCSS}
                            >
                              {discount > 0 && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10">
                                  {discount}%
                                </div>
                              )}
                              <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
                                <img
                                  src={logoUrl}
                                  alt={store.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-xs font-semibold text-gray-600">${initials}</span>`;
                                    }
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-700 text-center font-medium truncate w-full" title={store.name}>
                                {store.name}
                              </span>
                              {discount > 0 && (
                                <span className="text-[10px] text-green-600 font-semibold">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}



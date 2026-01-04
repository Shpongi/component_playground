"use client";

import { useState, useMemo, useEffect } from "react";
import { useAdminData } from "../_components/AdminDataProvider";

type Country = "US" | "CA" | "GB";

type Store = { 
  id: string;
  name: string; 
  country: Country;
  isActive: boolean;
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
    stores.push({
      id: `us-${i + 1}`,
      name: topUSBrands[i % topUSBrands.length],
      country: "US",
      isActive: true,
    });
  }
  
  // 40 UK stores
  for (let i = 0; i < 40; i++) {
    stores.push({
      id: `gb-${i + 1}`,
      name: topUKBrands[i % topUKBrands.length],
      country: "GB",
      isActive: true,
    });
  }
  
  // Note: 110 + 40 = 150, so 0 CA stores. If you want CA stores, we can adjust to 100 US, 40 UK, 10 CA
  
  return stores;
}

export default function StoresPage() {
  const { 
    stores: adminStores, 
    isStoreActive, 
    toggleStoreActive
  } = useAdminData();
  
  const stores: Store[] = useMemo(() => {
    return adminStores.map(s => ({
      id: `${s.country.toLowerCase()}-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: s.name,
      country: s.country,
      isActive: isStoreActive(s.name, s.country),
    }));
  }, [adminStores, isStoreActive]);

  const handleToggleStoreActive = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      toggleStoreActive(store.name, store.country);
    }
  };

  const activeCount = useMemo(() => stores.filter(s => s.isActive).length, [stores]);
  const inactiveCount = stores.length - activeCount;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stores</h1>
            <p className="text-sm text-gray-600">
              {stores.length} stores total • {activeCount} active • {inactiveCount} inactive
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stores.map((store) => {
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

          const logoUrl = getBrandLogoUrl(store.name);
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex h-5 items-center rounded-md border px-2 text-xs font-medium ${
                      store.country === "US" 
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : store.country === "GB"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}>
                {store.country}
              </span>
                    {!store.isActive && (
                      <span className="text-xs text-gray-500">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
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
    </section>
  );
}

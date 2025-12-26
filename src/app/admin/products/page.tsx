"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "../_components/AdminDataProvider";

export default function ProductsPage() {
  const { stores, getProduct, updateProductSwapEligibility } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Get all products from all stores
  const allProducts = useMemo(() => {
    const products: Array<{ product: ReturnType<typeof getProduct>; storeName: string }> = [];
    stores.forEach(store => {
      store.products.forEach(product => {
        products.push({
          product: getProduct(product.id),
          storeName: store.name,
        });
      });
    });
    return products;
  }, [stores, getProduct]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    const search = searchTerm.toLowerCase();
    return allProducts.filter(({ product }) => 
      product && (
        product.name.toLowerCase().includes(search) ||
        (product.sku && product.sku.toLowerCase().includes(search))
      )
    );
  }, [allProducts, searchTerm]);

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleUpdateEligibility = (productId: string, field: 'comboProduct' | 'containsAlcohol' | 'lowMargin', value: boolean) => {
    updateProductSwapEligibility(productId, { [field]: value });
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-gray-600">
          Manage product swap eligibility settings.
        </p>
      </header>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map(({ product, storeName }) => {
            if (!product) return null;
            const isExpanded = expandedProducts[product.id];

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium">{product.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {storeName}
                      </span>
                      {product.sku && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>
                    {product.category && (
                      <div className="text-sm text-gray-500 mt-1">
                        Category: {product.category}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleProductExpansion(product.id)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold mb-3">Swap Eligibility</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Combo Product
                          </label>
                          <p className="text-xs text-gray-500">
                            Mark this product as a combo product
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.comboProduct || false}
                            onChange={(e) => handleUpdateEligibility(product.id, 'comboProduct', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Contains Alcohol
                          </label>
                          <p className="text-xs text-gray-500">
                            Mark this product as containing alcohol
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.containsAlcohol || false}
                            onChange={(e) => handleUpdateEligibility(product.id, 'containsAlcohol', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Low Margin Product
                          </label>
                          <p className="text-xs text-gray-500">
                            Typically set by a background job, but visible here
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.lowMargin || false}
                            onChange={(e) => handleUpdateEligibility(product.id, 'lowMargin', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}


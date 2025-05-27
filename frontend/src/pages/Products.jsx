"use client"

import { useState, useEffect, useRef } from "react"
import { useProductStore } from "../stores/productStore"
import ProductCard from "../components/ProductCard"
import { Search, Filter, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Products = () => {
  const { products, categories,fetchProduct, updateProduct, deleteProduct } = useProductStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [stockFilter, setStockFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [productView, setProductView] = useState(false)

  const didFetch = useRef(false); // Prevent double-fetch
  const navigate = useNavigate()

  // Apply filters and sorting
  useEffect(() => {
   if (!didFetch.current) {
      fetchProduct();
      didFetch.current = true;
    }

   let result = Array.isArray(products) ? [...products] : []


   if (result && result) {

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm),
      )
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange.min) {
      result = result.filter((product) => product.price >= Number.parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      result = result.filter((product) => product.price <= Number.parseFloat(priceRange.max))
    }

    // Stock filter
    if (stockFilter === "in-stock") {
      result = result.filter((product) => product.stock > 0)
    } else if (stockFilter === "out-of-stock") {
      result = result.filter((product) => product.stock === 0)
    } else if (stockFilter === "low-stock") {
      result = result.filter((product) => product.stock > 0 && product.stock <= 5)
    }

    // Sorting
    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "stock-asc") {
      result.sort((a, b) => a.stock - b.stock)
    } else if (sortBy === "stock-desc") {
      result.sort((a, b) => b.stock - a.stock)
    }

   }
    setFilteredProducts(result)
  }, [products, searchTerm,fetchProduct, selectedCategory, priceRange, stockFilter, sortBy])

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
    }
  }

  const handleEditProduct = (id) => {
    navigate(`/update-product/${id}`)

  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setPriceRange({ min: "", max: "" })
    setStockFilter("all")
    setSortBy("name-asc")
  }

  function handleView() {
    setProductView(prev => !prev);
  }
  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleView}>{productView === true ? "list" : "grid"}</button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="input pl-10"
            />
          </div>

          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center">
            <Filter size={18} className="mr-1" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card mb-6 slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={resetFilters} className="text-slate-400 hover:text-white flex items-center text-sm">
              <X size={16} className="mr-1" />
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stock Status</label>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="input">
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock (≤ 5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
          <button onClick={resetFilters} className="btn-primary inline-flex items-center">
            <X size={18} className="mr-1" />
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={`${productView  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : ""}`}>

          {Array.isArray(products) && filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              productView={productView}
              onEdit={handleEditProduct} // We'll implement this in a future update
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products


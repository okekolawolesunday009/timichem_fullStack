"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../stores/authStore"
import { useProductStore } from "../stores/productStore"
import { formatCurrency } from "../utils/barcodeUtils"
import StatsCard from "../components/StatsCard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react"

const Dashboard = () => {
  const { user, isAdmin } = useAuthStore()
  const { products } = useProductStore()
  const [salesData, setSalesData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  // Calculate dashboard stats
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)
  const lowStockItems = products.filter((product) => product.stock <= 5).length

  // Generate mock sales data
  useEffect(() => {
    // Mock sales data for the last 7 days
    const mockSalesData = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      mockSalesData.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        sales: "",
      })
    }

    setSalesData(mockSalesData)

    // Generate category data
    const categories = {}
    products.forEach((product) => {
      if (categories[product.category]) {
        categories[product.category] += product.stock
      } else {
        categories[product.category] = product.stock
      }
    })

    const categoryDataArray = Object.keys(categories).map((category) => ({
      name: category,
      value: categories[category],
    }))

    setCategoryData(categoryDataArray)
  }, [products])

  // Colors for pie chart
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-slate-400">
          Welcome back, <span className="text-white font-medium">{user?.username}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={<Package size={24} />}
          color="bg-blue-900/50 text-blue-400"
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(totalValue)}
          icon={<DollarSign size={24} />}
          color="bg-emerald-900/50 text-emerald-400"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={<AlertTriangle size={24} />}
          color="bg-amber-900/50 text-amber-400"
        />
        <StatsCard
          title="Sales Today"
          value={formatCurrency(salesData[6]?.sales || 0)}
          icon={<TrendingUp size={24} />}
          color="bg-purple-900/50 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">Sales Last 7 Days</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Inventory by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value) => [`${value} items`, "Stock"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                    color: "#f8fafc",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isAdmin() && (
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold mb-4">Low Stock Alert</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-3 font-medium text-slate-400">Product</th>
                  <th className="pb-3 font-medium text-slate-400">Category</th>
                  <th className="pb-3 font-medium text-slate-400">Price</th>
                  <th className="pb-3 font-medium text-slate-400">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((product) => product.stock <= 5)
                  .map((product) => (
                    <tr key={product.id} className="border-b border-slate-800">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3">{product.category}</td>
                      <td className="py-3">{formatCurrency(product.price)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.stock === 0 ? "bg-red-900 text-red-300" : "bg-amber-900 text-amber-300"
                          }`}
                        >
                          {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                {products.filter((product) => product.stock <= 5).length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400">
                      No low stock items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard


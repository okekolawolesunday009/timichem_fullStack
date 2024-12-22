"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarIcon, Download, FileText, TrendingDown, TrendingUp, ChevronDown, X, Check, Package, DollarSign, AlertTriangle } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import '../index.css'
import StatsCard from "@/components/StatsCard"

// Sample data structure - replace with your MongoDB data
const samplePLData = {
  revenue: {
    productSales: 125000,
    serviceSales: 45000,
    otherIncome: 3500,
  },
  cogs: {
    materials: 35000,
    labor: 28000,
    manufacturing: 12000,
  },
  operatingExpenses: {
    salaries: 45000,
    rent: 8000,
    utilities: 2500,
    marketing: 15000,
    insurance: 3000,
    depreciation: 5000,
    other: 7500,
  },
  nonOperating: {
    interestIncome: 500,
    interestExpense: 2000,
  },
}

interface PLData {
  revenue: {
    productSales: number
    serviceSales: number
    otherIncome: number
  }
  cogs: {
    materials: number
    labor: number
    manufacturing: number
  }
  operatingExpenses: {
    salaries: number
    rent: number
    utilities: number
    marketing: number
    insurance: number
    depreciation: number
    other: number
  }
  nonOperating: {
    interestIncome: number
    interestExpense: number
  }
}

interface DateRange {
  from: Date
  to: Date
}

export default function ProfitLossReport() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1)),
  })
  const [period, setPeriod] = useState("monthly")
  const [plData, setPLData] = useState<PLData>(samplePLData)
  const [loading, setLoading] = useState(false)
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const periodDropdownRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Calculate totals
  const totalRevenue = Object.values(plData.revenue).reduce((sum, val) => sum + val, 0)
  const totalCOGS = Object.values(plData.cogs).reduce((sum, val) => sum + val, 0)
  const grossProfit = totalRevenue - totalCOGS
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const totalOperatingExpenses = Object.values(plData.operatingExpenses).reduce((sum, val) => sum + val, 0)
  const operatingIncome = grossProfit - totalOperatingExpenses

  const netNonOperating = plData.nonOperating.interestIncome - plData.nonOperating.interestExpense
  const netIncome = operatingIncome + netNonOperating
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setIsPeriodDropdownOpen(false)
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch data function - replace with your MongoDB API call
  const fetchPLData = async () => {
    setLoading(true)
    try {
      // Replace with your actual API call
      // const response = await fetch('/api/profit-loss', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     startDate: dateRange.from,
      //     endDate: dateRange.to,
      //     period
      //   })
      // })
      // const data = await response.json()
      // setPLData(data)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPLData(samplePLData)
    } catch (error) {
      console.error("Error fetching P&L data:", error)
      setToast({
        type: "error",
        message: "Failed to fetch P&L data",
      })
      setTimeout(() => setToast(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPLData()
  }, [dateRange, period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`
  }

  const exportToPDF = () => {
    setToast({
      type: "success",
      message: "PDF export initiated",
    })
    setTimeout(() => setToast(null), 3000)
    console.log("Exporting to PDF...")
  }

  const exportToCSV = () => {
    setToast({
      type: "success",
      message: "CSV export initiated",
    })
    setTimeout(() => setToast(null), 3000)
    console.log("Exporting to CSV...")
  }

  const handleDateRangeChange = (type: "from" | "to", value: string) => {
    const date = new Date(value)
    setDateRange((prev) => ({
      ...prev,
      [type]: date,
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
            toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {toast.type === "success" ? <Check className="h-5 w-5 mr-2" /> : <X className="h-5 w-5 mr-2" />}
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Report</h1>
          <p className="text-gray-500">
            {dateRange.from &&
              dateRange.to &&
              `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Period Dropdown */}
          <div className="relative" ref={periodDropdownRef}>
            <button
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="inline-flex items-center justify-between w-[140px] px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {period === "monthly" ? "Monthly" : period === "quarterly" ? "Quarterly" : "Yearly"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {isPeriodDropdownOpen && (
              <div className="absolute z-10 mt-1 w-[140px]  border border-slate-900 rounded-md shadow-lg">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPeriod("monthly")
                    setIsPeriodDropdownOpen(false)
                  }}
                >
                  Monthly
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPeriod("quarterly")
                    setIsPeriodDropdownOpen(false)
                  }}
                >
                  Quarterly
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPeriod("yearly")
                    setIsPeriodDropdownOpen(false)
                  }}
                >
                  Yearly
                </div>
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="inline-flex items-center justify-start w-[240px] px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                : "Pick a date range"}
            </button>

            {isDatePickerOpen && (
              <div className="absolute z-10 mt-1 p-4  border border-gray-300 rounded-md shadow-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={format(dateRange.from, "yyyy-MM-dd")}
                      onChange={(e) => handleDateRangeChange("from", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={format(dateRange.to, "yyyy-MM-dd")}
                      onChange={(e) => handleDateRangeChange("to", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full px-4 py-2 bg-blue-600 te rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md  text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md  text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

         <StatsCard
                  title="Total Revenue"
                  value={formatCurrency(totalRevenue)}
                  icon={<Package size={24} />}
                  color="bg-blue-900/50 text-blue-400"
                />
        
                
                <StatsCard
                  title="Totol Profit"
                  value={formatCurrency(grossProfit)}
                  icon={<DollarSign size={24} />}
                  color="bg-emerald-900/50 text-emerald-400"
                /> 
                <StatsCard
                  title="Operating Income"
                  value={formatCurrency(operatingIncome)}
                  icon={<AlertTriangle size={24} />}
                  color="bg-amber-900/50 text-amber-400"
                />
                <StatsCard
                  title="Net Income"
                  value={formatPercentage(netMargin)}
                  icon={<TrendingUp size={24} />}
                  color="bg-purple-900/50 text-purple-400"
                /> 
       
        {/* <div className=" rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(netIncome)}
              </p>
              <p className="text-xs text-gray-500">Margin: {formatPercentage(netMargin)}</p>
            </div>
            {netIncome >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div> */}
      </div>

      {/* Detailed P&L Statement */}
      <div className="card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Profit & Loss Statement</h2>
          <p className="text-sm text-gray-500">Detailed breakdown of income and expenses</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider w-[300px]">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right  font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right  font-medium text-gray-500 uppercase tracking-wider">
                      % of Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className=" divide-y divide-gray-200">
                  {/* Revenue Section */}
                  <tr className="">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold ">REVENUE</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Product Sales</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.revenue.productSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.revenue.productSales / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Service Sales</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.revenue.serviceSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.revenue.serviceSales / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Other Income</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.revenue.otherIncome)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.revenue.otherIncome / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">Total Revenue</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">100.0%</td>
                  </tr>

                  {/* COGS Section */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">COST OF GOODS SOLD</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Materials</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.cogs.materials)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.cogs.materials / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Labor</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.cogs.labor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.cogs.labor / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Manufacturing Overhead</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.cogs.manufacturing)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.cogs.manufacturing / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">Total COGS</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(totalCOGS)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatPercentage((totalCOGS / totalRevenue) * 100)}
                    </td>
                  </tr>

                  {/* Gross Profit */}
                  <tr className="bg-green-50 border-b-2 border-gray-300">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-700">
                      GROSS PROFIT
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Profit
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-700">
                      {formatCurrency(grossProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-700">
                      {formatPercentage(grossMargin)}
                    </td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">OPERATING EXPENSES</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Salaries & Benefits</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.salaries)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.salaries / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Rent</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.rent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.rent / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Utilities</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.utilities)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.utilities / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Marketing & Advertising</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.marketing)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.marketing / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Insurance</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.insurance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.insurance / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Depreciation</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.depreciation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.depreciation / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Other Expenses</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.operatingExpenses.other)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.operatingExpenses.other / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr className="border-b-2 border-gray-300">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      Total Operating Expenses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(totalOperatingExpenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatPercentage((totalOperatingExpenses / totalRevenue) * 100)}
                    </td>
                  </tr>

                  {/* Operating Income */}
                  <tr className="bg-blue-50 border-b-2 border-gray-300">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">OPERATING INCOME</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-700">
                      {formatCurrency(operatingIncome)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-700">
                      {formatPercentage((operatingIncome / totalRevenue) * 100)}
                    </td>
                  </tr>

                  {/* Non-Operating */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">NON-OPERATING</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Interest Income</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(plData.nonOperating.interestIncome)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatPercentage((plData.nonOperating.interestIncome / totalRevenue) * 100)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 pl-12">Interest Expense</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      ({formatCurrency(plData.nonOperating.interestExpense)})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      ({formatPercentage((plData.nonOperating.interestExpense / totalRevenue) * 100)})
                    </td>
                  </tr>

                  {/* Net Income */}
                  <tr
                    className={`border-t-2 border-b-4 border-gray-400 ${netIncome >= 0 ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-bold text-lg ${netIncome >= 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      NET INCOME
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          netIncome >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {netIncome >= 0 ? "Profit" : "Loss"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-bold text-lg ${netIncome >= 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      {formatCurrency(netIncome)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-bold text-lg ${netIncome >= 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      {formatPercentage(netMargin)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

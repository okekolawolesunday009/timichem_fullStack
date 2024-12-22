"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  ShoppingCart,
  Users,
  ChevronDown,
  X,
  Check,
} from "lucide-react"
import { format } from "date-fns"
import { vendorStore } from "@/stores/vendorStore"
import { purchaseStore } from "@/stores/purchaseStore"

// Purchase data types
interface Purchase {
  id: string
  vendor_id: string
  purchaseOrderNumber: string
  vendor: string
  category:
  | "materials"
  | "labor"
  | "manufacturing"
  | "salaries"
  | "rent"
  | "utilities"
  | "marketing"
  | "insurance"
  | "other",
  items: [{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }],
  totalAmount: number, 
  actualDeliveryDate: Date
  expectedDeliveryDate: Date
  purchaseDate: Date
  status: "pending" | "approved" | "received" | "paid" | "cancelled"
  paymentTerms: string
  notes?: string,
  paymentStatus: string
  attachments?:
  {
    filename: string,
    url: string
  }

}

interface Vendor {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  paymentTerms: string
}

// Sample data
// const samplePurchases: Purchase[] = [
//   {
//     id: "1",
//     purchaseOrderNumber: "PO-2024-001",
//     vendor: "ABC Materials Co.",
//     category: "materials",
//     description: "Raw materials for production",
//     quantity: 100,
//     unitPrice: 25.5,
//     totalAmount: 2550,
//     purchaseDate: new Date("2024-01-15"),
//     status: "received",
//     paymentTerms: "Net 30",
//     notes: "Quality materials as expected",
//   },
//   {
//     id: "2",
//     purchaseOrderNumber: "PO-2024-002",
//     vendor: "Tech Solutions Inc.",
//     category: "marketing",
//     description: "Digital marketing services",
//     quantity: 1,
//     unitPrice: 5000,
//     totalAmount: 5000,
//     purchaseDate: new Date("2024-01-20"),
//     status: "approved",
//     paymentTerms: "Net 15",
//   },
//   {
//     id: "3",
//     purchaseOrderNumber: "PO-2024-003",
//     vendor: "Office Supplies Ltd.",
//     category: "other",
//     description: "Office equipment and supplies",
//     quantity: 25,
//     unitPrice: 45.0,
//     totalAmount: 1125,
//     purchaseDate: new Date("2024-01-25"),
//     status: "pending",
//     paymentTerms: "Net 30",
//   },
// ]


const categoryLabels = {
  materials: "Materials",
  labor: "Labor",
  manufacturing: "Manufacturing",
  salaries: "Salaries",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  insurance: "Insurance",
  other: "Other",
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  received: "bg-green-100 text-green-800",
  paid: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function PurchaseModule() {
  const { purchaseItems, createPurchase, fetchPurchases } = purchaseStore()
  const [purchases, setPurchases,] = useState<Purchase[]>(purchaseItems)
    console.log(purchases)

  const { vendors } = vendorStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [dropdowns, setDropdowns] = useState({
    status: false,
    category: false,
    vendor: false,
    categoryForm: false,
    paymentTerms: false,
  })

  // New purchase form state
  const [newPurchase, setNewPurchase] = useState<Partial<Purchase>>({
    vendor: "",
    vendor_id: "",
    category: "materials",
    items: [
      {
        description: "",
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      }
    ],
    totalAmount: 0,
    actualDeliveryDate: new Date(),
    expectedDeliveryDate: new Date(),
    purchaseDate: new Date(),
    status: "pending",
    paymentTerms: "Net 30",
    notes: "",
    paymentStatus: "unpaid",
    attachments:
    {
      filename: "",
      url: ""
    }

  })

  // Refs for dropdowns
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const vendorDropdownRef = useRef<HTMLDivElement>(null)
  const categoryFormDropdownRef = useRef<HTMLDivElement>(null)
  const paymentTermsDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, status: false }))
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, category: false }))
      }
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, vendor: false }))
      }
      if (categoryFormDropdownRef.current && !categoryFormDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, categoryForm: false }))
      }
      if (paymentTermsDropdownRef.current && !paymentTermsDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, paymentTerms: false }))
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

    useEffect(() => { 
      fetchPurchases()
    }, [])

  // Calculate purchase analytics
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
  const pendingPurchases = purchases.filter((p) => p.status === "pending").length
  const thisMonthPurchases = purchases
    .filter((p) => {
    const purchaseDate = new Date(p.purchaseDate); // convert from string to Date
    const now = new Date();
    return (
      purchaseDate.getMonth() === now.getMonth() &&
      purchaseDate.getFullYear() === now.getFullYear() // optional, ensures same year
    );
  })
  .reduce((sum, purchase) => sum + purchase.totalAmount, 0)

  // Calculate purchases by category for P&L integration
  const purchasesByCategory = purchases.reduce(
    (acc, purchase) => {
      if (purchase.status === "received" || purchase.status === "paid") {
        acc[purchase.category] = (acc[purchase.category] || 0) + purchase.totalAmount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Filter purchases
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.items?.[0]?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter
    const matchesCategory = categoryFilter === "all" || purchase.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }
  // purchaseOrderNumber: `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, "0")}`,


 const handleAddPurchase = async () => {
  try {
    console.log("Submitting new purchase:", newPurchase);

   const purchaseToSend = { ...newPurchase, vendor: newPurchase.vendor_id };
    delete purchaseToSend.vendor_id;

    const res = await createPurchase(purchaseToSend);
    console.log(res);

    setNewPurchase({});
    setIsAddModalOpen(false);

  } catch (err) {
    console.error("Failed to create purchase:", err);
  }
};


  const handleUpdateStatus = (purchaseId: string, newStatus: Purchase["status"]) => {
    setPurchases(purchases.map((p) => (p.id === purchaseId ? { ...p, status: newStatus } : p)))
    setToast({
      type: "success",
      message: "Purchase status updated",
    })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDeletePurchase = (purchaseId: string) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      setPurchases(purchases.filter((p) => p.id !== purchaseId))
      setToast({
        type: "success",
        message: "Purchase deleted successfully",
      })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle items[0].itemDescription or similar nested fields
    const itemMatch = name.match(/^items\[(\d+)\]\.(\w+)$/)

    if (itemMatch) {
      const index = parseInt(itemMatch[1])
      const key = itemMatch[2]

      setNewPurchase((prev) => {
        const items = prev.items ? [...prev.items] : []

        items[index] = {
          ...items[index],
          [key]: key === "quantity" || key === "unitPrice" || key === "totalPrice"
            ? parseFloat(value) || 0
            : value,
        }

        return { ...prev, items }
      })
    } else {
      // Handle flat fields like "vendor" or "purchaseDate"
      setNewPurchase((prev) => ({
        ...prev,
        [name]:
          name === "purchaseDate"
            ? new Date(value)
            : value,
      }))
    }
  }


  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {/* {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          <div className="flex items-center">
            {toast.type === "success" ? <Check className="h-5 w-5 mr-2" /> : <X className="h-5 w-5 mr-2" />}
            <p>{toast.message}</p>
          </div>
        </div>
      )} */}

      {/* Purchase Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className=" card rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPurchases)}</p>
              <p className="text-xs text-gray-500">All time purchases</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthPurchases)}</p>
              <p className="text-xs text-gray-500">Current month spending</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPurchases}</p>
              <p className="text-xs text-gray-500">Awaiting approval</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              <p className="text-xs text-gray-500">Registered vendors</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Purchase Management */}
      <div className="card rounded-lg border shadow-sm">
        <div className=" border-b py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Purchase Orders</h2>
              <p className="text-sm text-gray-500">Manage and track all purchase orders</p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 te rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Purchase
            </button>
          </div>
        </div>

        <div className="mt-4 p-6">
          {/* Filters */}
          <div className="flex flex-col  sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setDropdowns((prev) => ({ ...prev, status: !prev.status }))}
                className="inline-flex items-center justify-between w-[140px] px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {dropdowns.status && (
                <div className="absolute z-10 mt-1 w-[140px] bg-slate-900   border border-slate-900 rounded-md shadow-lg">
                  <div
                    className="px-4 py-2 hover:bg-slate-900  cursor-pointer"
                    onClick={() => {
                      setStatusFilter("all")
                      setDropdowns((prev) => ({ ...prev, status: false }))
                    }}
                  >
                    All Status
                  </div>
                  {Object.keys(statusColors).map((status) => (
                    <div
                      key={status}
                      className="px-4 py-2 hover:bg-slate-900  cursor-pointer"
                      onClick={() => {
                        setStatusFilter(status)
                        setDropdowns((prev) => ({ ...prev, status: false }))
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setDropdowns((prev) => ({ ...prev, category: !prev.category }))}
                className="inline-flex items-center justify-between w-[140px] px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryFilter === "all"
                  ? "All Categories"
                  : categoryLabels[categoryFilter as keyof typeof categoryLabels]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {dropdowns.category && (
                <div className="absolute z-10 mt-1 w-[140px] bg-slate-900  border border-slate-900  rounded-md shadow-lg">
                  <div
                    className="px-4 py-2 hover:bg-slate-900  cursor-pointer"
                    onClick={() => {
                      setCategoryFilter("all")
                      setDropdowns((prev) => ({ ...prev, category: false }))
                    }}
                  >
                    All Categories
                  </div>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <div
                      key={key}
                      className="px-4 py-2 hover:bg-slate-900  cursor-pointer"
                      onClick={() => {
                        setCategoryFilter(key)
                        setDropdowns((prev) => ({ ...prev, category: false }))
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Purchase Table */}
          <div className="rounded-md border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-900 ">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-900/50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {purchase.purchaseOrderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{purchase.vendor?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900  text-gray-800">
                        {categoryLabels[purchase.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate text-gray-900">
                      {purchase.items?.[0]?.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {format(purchase.purchaseDate, "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatCurrency(purchase.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button
                          onClick={() => {
                            const newStatus =
                              purchase.status === "pending"
                                ? "approved"
                                : purchase.status === "approved"
                                  ? "received"
                                  : purchase.status === "received"
                                    ? "paid"
                                    : "pending"
                            handleUpdateStatus(purchase.id, newStatus)
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[purchase.status]} hover:opacity-80`}
                        >
                          {purchase.status}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(purchase.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {isAddModalOpen && (
        <div className="fixed slide-up inset-0 z-100 h-[100%]  overflow-y-hidden bg-opacity-50 bg-black  flex  justify-center p-4">
          <div className="card relative  rounded-lg  mt-6 shadow-xl max-w-2xl w-full  overflow-y-auto">
            <div className="p-6 border-b mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add New Purchase Order</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500">Create a new purchase order for tracking expenses</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2" ref={vendorDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdowns((prev) => ({ ...prev, vendor: !prev.vendor }))}
                      className="w-full flex items-center justify-between px-4 py-2 border border-slate-700 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {newPurchase.vendor || "Select vendor"}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {dropdowns.vendor && (
                      <div className="absolute z-10 mt-1 w-full bg-slate-900  border border-slate-700 rounded-md shadow-lg">
                        {vendors.map((vendor: Vendor) => (
                          <div
                            key={vendor.name}
                            className="px-4 py-2  cursor-pointer"
                            onClick={() =>  {
                              setNewPurchase((prev) => ({ ...prev, vendor_id:vendor._id ,vendor: vendor.name}))
                              setDropdowns((prev) => ({ ...prev, vendor: false }))
                            }}
                          >
                            {vendor.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2" ref={categoryFormDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdowns((prev) => ({ ...prev, categoryForm: !prev.categoryForm }))}
                      className="w-full flex items-center  justify-between px-4 py-2 border border-slate-700 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categoryLabels[newPurchase.category as keyof typeof categoryLabels]}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {dropdowns.categoryForm && (
                      <div className="absolute z-10 mt-1 w-full bg-slate-900 border border-slate-700 rounded-md shadow-lg">
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <div
                            key={key}
                            className="px-3 py-2 hover:bg-slate-900 cursor-pointer"
                            onClick={() => {
                              setNewPurchase((prev) => ({ ...prev, category: key as Purchase["category"] }))
                              setDropdowns((prev) => ({ ...prev, categoryForm: false }))
                            }}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    name="description"
                    value={newPurchase.description}
                    onChange={handleInputChange}
                    placeholder="Purchase description"
                    className="input"
                  />
                </div> */}

                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Purchase Description</label>
                  <input
                    name="items[0].description"
                    value={newPurchase.items?.[0]?.description || ""}
                    onChange={handleInputChange}
                    placeholder="Item description"
                    className="input"
                  />


                </div>

                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Attachment</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setNewPurchase((prev) => ({
                          ...prev,
                          attachments: {
                            filename: file.name,
                            url: url,
                          },
                        }));
                      }
                    }}
                    className="input"
                  />
                </div>


                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    name="items[0].quantity"
                    value={newPurchase.items?.[0]?.quantity || ""}
                    onChange={handleInputChange}
                    placeholder="Item quantity"
                    className="input"
                  />


                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                  <input
                    name="items[0].unitPrice"
                    value={newPurchase.items?.[0]?.unitPrice || ""}
                    onChange={handleInputChange}
                    placeholder="Item unit Price"
                    className="input"
                    step="0.01"

                    min="0"
                  />


                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <input
                    name="items[0].totalPrice"
                    value={newPurchase.items?.[0]?.totalPrice || ""}
                    onChange={handleInputChange}
                    placeholder="Item total Price"
                    className="input"
                    step="0.01"

                    min="0"
                  />


                </div>


                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={format(newPurchase.purchaseDate || new Date(), "yyyy-MM-dd")}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={format(newPurchase.expectedDeliveryDate || new Date(), "yyyy-MM-dd")}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Actual Delivery Date</label>
                  <input
                    type="date"
                    name="actualDeliveryDate"
                    value={format(newPurchase.actualDeliveryDate || new Date(), "yyyy-MM-dd")}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div className="space-y-2" ref={paymentTermsDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdowns((prev) => ({ ...prev, paymentTerms: !prev.paymentTerms }))}
                      className="w-full flex items-center justify-between px-4 py-2 border border-slate-700  rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {newPurchase.paymentTerms}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {dropdowns.paymentTerms && (
                      <div className="absolute z-10 mt-1 w-full  border border-slate-700 rounded-md shadow-lg">
                        {["Net 15", "Net 30", "Net 60", "Due on Receipt"].map((term) => (
                          <div
                            key={term}
                            className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                            onClick={() => {
                              setNewPurchase((prev) => ({ ...prev, paymentTerms: term }))
                              setDropdowns((prev) => ({ ...prev, paymentTerms: false }))
                            }}
                          >
                            {term}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={newPurchase.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    className="input"
                  />
                </div>

                <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency((newPurchase.items?.[0]?.quantity || 0) * (newPurchase.items?.[0]?.unitPrice || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 space-x-4 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPurchase}
                  className="px-4 py-2 bg-blue-600 te rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Impact on P&L */}
      <div className=" card rounded-lg border shadow-sm">
        <div className="p-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Purchase Impact on P&L</h2>
          <p className="text-sm text-gray-500">How purchases affect your profit and loss statement</p>
        </div>
        <div className=" mt-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(purchasesByCategory).map(([category, amount]) => (
              <div key={category} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</span>
                  <span className="font-bold">{formatCurrency(amount)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {["materials", "labor", "manufacturing"].includes(category) ? "Affects COGS" : "Operating Expense"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

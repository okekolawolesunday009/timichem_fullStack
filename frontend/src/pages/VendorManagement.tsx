"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Building2, ChevronDown, X, Check } from "lucide-react"
import CreateVendorForm from "./CreateVendor"
import { vendorStore } from "@/stores/vendorStore"

interface Vendor {
  _id: string
  name: string
  companyName?: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentTerms: string
  categories: string[]
  status: "active" | "inactive" | "suspended"
  totalPurchases: number
  totalSpent: number
  lastPurchaseDate?: string
  createdAt: string
}

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
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
}

export default function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  // const [pagination, setPagination] = useState({
  //   current: 1,
  //   pages: 1,
  //   total: 0,
  //   limit: 10,
  // })
const { fetchVendors,isLoading, pagination, vendors} = vendorStore()

//   const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(null)
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        // Don't close the status dropdown if clicking inside it
        if (!statusDropdownRef.current.contains(event.target as Node)) {
          // This is a simplified check - in a real app you'd need to check if the click was inside the dropdown
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleVendorCreated = () => {
    // createVendor(formDa)

    setIsCreateModalOpen(false)
    setToast({
      type: "success",
      message: "Vendor created successfully",
    })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete vendor")
      }

      // setVendors(vendors.filter((vendor) => vendor._id !== vendorId))
      setToast({
        type: "success",
        message: "Vendor deleted successfully",
      })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error("Error deleting vendor:", error)
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete vendor",
      })
      setTimeout(() => setToast(null), 5000)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-gray-500">Manage your vendors and supplier relationships</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </button>
      </div>

      {/* Create Vendor Modal */}
      {isCreateModalOpen && (
        <div className="fixed slide-up inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card relative h-[100%] rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto">
            
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Create New Vendor</h2>
            </div>
            <div className="p-6">
              <CreateVendorForm
                onSuccess={handleVendorCreated}
                onCancel={() => setIsCreateModalOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card rounded-lg border shadow-sm">
        <div className="p-6 border-b mb-2">
          <h2 className="text-lg font-semibold">Vendors</h2>
          <p className="text-sm text-gray-500">Manage and track all your vendors</p>
        </div>
        <div className="mt-4 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {/* <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=""
                /> */}
              </div>
            </div>

            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(isDropdownOpen === "status" ? null : "status")}
                className="inline-flex items-center justify-between w-[140px] px-4 py-2 border border-slate-700 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusFilter === "all"
                  ? "All Status"
                  : statusFilter === "active"
                    ? "Active"
                    : statusFilter === "inactive"
                      ? "Inactive"
                      : "Suspended"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {isDropdownOpen === "status" && (
                <div className="absolute z-10 mt-1 w-[140px] ">
                  <div
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-700 cursor-pointer"
                    onClick={() => {
                      setStatusFilter("all")
                      setIsDropdownOpen(null)
                    }}
                  >
                    All Status
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setStatusFilter("active")
                      setIsDropdownOpen(null)
                    }}
                  >
                    Active
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setStatusFilter("inactive")
                      setIsDropdownOpen(null)
                    }}
                  >
                    Inactive
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setStatusFilter("suspended")
                      setIsDropdownOpen(null)
                    }}
                  >
                    Suspended
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendors Table */}
          <div className="card rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categories
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Terms
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Spent
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading vendors...</span>
                      </div>
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No vendors found</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium btn-primary"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add First Vendor
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor: Vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{vendor.name}</div>
                          {vendor.companyName && <div className="text-sm text-gray-500">{vendor.companyName}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{vendor.email}</div>
                          <div className="text-sm text-gray-500">{vendor.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vendor.address.city}, {vendor.address.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {vendor.categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </span>
                          ))}
                          {vendor.categories.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{vendor.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {vendor.paymentTerms}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{formatCurrency(vendor.totalSpent)}</div>
                          <div className="text-sm text-gray-500">{vendor.totalPurchases} orders</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[vendor.status]}`}
                        >
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative" ref={vendor._id === isDropdownOpen ? dropdownRef : undefined}>
                          <button
                            onClick={() => setIsDropdownOpen(isDropdownOpen === vendor._id ? null : vendor._id)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {isDropdownOpen === vendor._id && (
                            <div className="card absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                              <div
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                onClick={() => {
                                  // View vendor details
                                //   router.push(`/vendors/${vendor._id}`)
                                  setIsDropdownOpen(null)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </div>
                              <div
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                onClick={() => {
                                  // Edit vendor
                                //   router.push(`/vendors/edit/${vendor._id}`)
                                  setIsDropdownOpen(null)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Vendor
                              </div>
                              <div
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-600"
                                onClick={() => {
                                  handleDeleteVendor(vendor._id)
                                  setIsDropdownOpen(null)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          

          {/* Pagination */}
          {/* {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {vendors.length} of {pagination.total} vendors
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchVendors(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                    pagination.current === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchVendors(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                    pagination.current === pagination.pages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

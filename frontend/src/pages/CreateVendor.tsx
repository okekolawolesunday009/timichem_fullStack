"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Building2, Mail, MapPin, CreditCard, Save, X, ChevronDown, Check } from "lucide-react"
import * as z from "zod"
import { vendorStore } from "@/stores/vendorStore"
import { toast } from "react-toastify"

// Validation schema
const vendorSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters"),
  companyName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  alternatePhone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
    country: z.string().default("USA"),
  }),
  totalPurchase: z.string().optional(),
  totalSpent: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.enum(["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"]),
  bankDetails: z
    .object({
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      routingNumber: z.string().optional(),
      accountType: z.enum(["checking", "savings"]).optional(),
    })
    .optional(),
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  notes: z.string().optional(),
})

type VendorFormData = z.infer<typeof vendorSchema>


const stateOptions = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

interface CreateVendorFormProps {
  onSuccess?: (vendor: any) => void
  onCancel?: () => void
  isModal?: boolean
}

export default function CreateVendorForm({ onSuccess, onCancel, isModal = false }: CreateVendorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [formData, setFormData] = useState<Partial<VendorFormData>>({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    taxId: "",
    paymentTerms: "Net 30",
    totalPurchase:"",
    totalSpent:"",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking",
    },
    categories: [],
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dropdowns, setDropdowns] = useState({
    state: false,
    paymentTerms: false,
    accountType: false,
  })
    const { createVendor,categoryOptions, paymentTermsOptions } = vendorStore()

//   const router = useRouter()

  // Refs for dropdowns
  const stateDropdownRef = useRef<HTMLDivElement>(null)
  const paymentTermsDropdownRef = useRef<HTMLDivElement>(null)
  const accountTypeDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, state: false }))
      }
      if (paymentTermsDropdownRef.current && !paymentTermsDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, paymentTerms: false }))
      }
      if (accountTypeDropdownRef.current && !accountTypeDropdownRef.current.contains(event.target as Node)) {
        setDropdowns((prev) => ({ ...prev, accountType: false }))
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle category checkbox changes
  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    const currentCategories = formData.categories || []

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        categories: [...currentCategories, categoryValue],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        categories: currentCategories.filter((cat) => cat !== categoryValue),
      }))
    }

    // Clear category error if any categories are selected
    if (errors.categories && checked) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.categories
        return newErrors
      })
    }
  }

  // Handle dropdown selection
  const handleSelect = (field: string, value: string) => {
    if (field === "address.state") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address!,
          state: value,
        },
      }))
      setDropdowns((prev) => ({ ...prev, state: false }))
    } else if (field === "paymentTerms") {
      setFormData((prev) => ({ ...prev, paymentTerms: value as any }))
      setDropdowns((prev) => ({ ...prev, paymentTerms: false }))
    } else if (field === "bankDetails.accountType") {
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails!,
          accountType: value as any,
        },
      }))
      setDropdowns((prev) => ({ ...prev, accountType: false }))
    }
  }

  // Validate form
  const validateForm = () => {
    try {
      vendorSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join(".")
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }
    
      const res = await createVendor(formData)
       if (res) toast.success("Vendor created Successfuly")
        else toast.error("Failed to Create Vendor")
      
  
      // Reset form
      setFormData({
        name: "",
        companyName: "",
        email: "",
        phone: "",
        alternatePhone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
        },
        taxId: "",
        paymentTerms: "Net 30",
        totalPurchase:"",
        totalSpent:"",
        bankDetails: {
          bankName: "",
          accountNumber: "",
          routingNumber: "",
          accountType: "checking",
        },
        categories: [],
        notes: "",
      })
    
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (!isModal) {
    //   router.back()
    }
  }

  return (
    <div className={`${isModal ? "" : "container mx-auto p-6"} max-w-4xl`}>
      {/* Toast notification */}
      {/* {toast && (
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
      )} */}

      {/* Main card       */}
        <div className=" fixed inset-0 bg-slate-900 max-w-2xl z-100  mx-auto overflow-y-auto  flex-col justify-center p-4">

      {/* <div className="card  mx-auto flex h-[100%] flex-col justify-center overflow-y-hidden rounded-lg border shadow-sm"> */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Create New Vendor
              </h2>
              <p className="text-sm text-gray-500">Add a new vendor to your system for purchase management</p>
            </div>
           
              <button
                onClick={handleCancel}
                className="card inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2  text-gray-900  hover:bg-gray-100"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
          
          </div>
        </div>

        <div className="mt-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Vendor Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter vendor name"
                    className={`input ${
                      errors.name ? "border-red-500" : ""
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-medium">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name (optional)"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vendor@example.com"
                    className={`input ${
                      errors.email ? "border-red-500" : ""
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Primary Phone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className={`input ${
                      errors.phone ? "border-red-500" : ""
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="alternatePhone" className="block text-sm font-medium">
                    Alternate Phone
                  </label>
                  <input
                    id="alternatePhone"
                    name="alternatePhone"
                    type="text"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    placeholder="(555) 987-6543"
                    className="input"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="taxId" className="block text-sm font-medium">
                    Tax ID / EIN
                  </label>
                  <input
                    id="taxId"
                    name="taxId"
                    type="text"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="12-3456789"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="address.street" className="block text-sm font-medium">
                    Street Address *
                  </label>
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    value={formData.address?.street}
                    onChange={handleChange}
                    placeholder="123 Business Street"
                    className={`input ${
                      errors["address.street"] ? "border-red-500" : ""
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors["address.street"] && <p className="text-sm text-red-500">{errors["address.street"]}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="address.city" className="block text-sm font-medium">
                      City *
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      value={formData.address?.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`input ${
                        errors["address.city"] ? "border-red-500" : ""
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors["address.city"] && <p className="text-sm text-red-500">{errors["address.city"]}</p>}
                  </div>

                  <div className="space-y-2" ref={stateDropdownRef}>
                    <label htmlFor="address.state" className="block text-sm font-medium">
                      State *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdowns((prev) => ({ ...prev, state: !prev.state }))}
                        className={` border-slate-700 border w-full flex items-center justify-between p-2 rounded-lg ${
                          errors["address.state"] ? "border-red-500" : ""
                        }  focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {formData.address?.state || "Select state"}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {dropdowns.state && (
                        <div className="absolute z-10 mt-1 w-full bg-slate-900 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {stateOptions.map((state) => (
                            <div
                              key={state}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelect("address.state", state)}
                            >
                              {state}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors["address.state"] && <p className="text-sm text-red-500">{errors["address.state"]}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address.zipCode" className="block text-sm font-medium">
                      ZIP Code *
                    </label>
                    <input
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      value={formData.address?.zipCode}
                      onChange={handleChange}
                      placeholder="12345"
                      className={`input ${
                        errors["address.zipCode"] ? "border-red-500" : ""
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors["address.zipCode"] && <p className="text-sm text-red-500">{errors["address.zipCode"]}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Business Information
              </h3>

              <div className="space-y-2" ref={paymentTermsDropdownRef}>
                <label htmlFor="paymentTerms" className="block text-sm font-medium">
                  Payment Terms *
                </label>
                <div className="relative w-full md:w-[200px]">
                  <button
                    type="button"
                    onClick={() => setDropdowns((prev) => ({ ...prev, paymentTerms: !prev.paymentTerms }))}
                    className="w-full flex items-center justify-between px-3 py-2 border   border-slate-700  p-2 rounded-md bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentTermsOptions.find((opt:string) => opt === formData.paymentTerms) || "Select terms"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {dropdowns.paymentTerms && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-900  border  border-slate-700  rounded-md shadow-lg">
                      {paymentTermsOptions.map((option:string) => (
                        <div
                          key={option}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelect("paymentTerms", option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.paymentTerms && <p className="text-sm text-red-500">{errors.paymentTerms}</p>}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Service Categories *</label>
                <p className="text-sm text-gray-500">Select the categories this vendor provides services for</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryOptions.map((category:string) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category}
                        checked={formData.categories?.includes(category) || false}
                        onChange={(e) => handleCategoryChange(category, e.target.checked)}
                        className=""
                      />
                      <label htmlFor={category} className="text-sm font-normal">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.categories && formData.categories.length > 0 && (
                  <div className="card flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {categoryOptions.find((cat: string) => cat === category)}
                      </span>
                    ))}
                  </div>
                )}
                {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
              </div>
            </div>

            {/* Bank Details (Optional) */}
            <div className="space-y-4">
              <div className="flex mb-2 items-center justify-between">
                <h3 className="text-lg font-semibold">Bank Details (Optional)</h3>
                <button
                  type="button"
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2  text-gray-900  hover:bg-gray-100"
                >
                  {showBankDetails ? "Hide" : "Add"} Bank Details
                </button>
              </div>
              <div className="flex justify-between">
                <div className="space-y-2">
                    <label htmlFor="totalPurchase" className="block text-sm font-medium">
                      Total Purchase
                    </label>
                    <input
                      id="totalPurchase"
                      name="totalPurchase"
                      type="text"
                      value={formData.totalPurchase}
                      onChange={handleChange}
                      placeholder=""
                      className="input"
                    />
                  </div><div className="space-y-2">
                    <label htmlFor="totalSpent" className="block text-sm font-medium">
                      Total Spent
                    </label>
                    <input
                      id="totalSpent"
                      name="totalSpent"
                      type="text"
                      value={formData.totalSpent}
                      onChange={handleChange}
                      placeholder="10"
                      className="input"
                    />
                  </div>
              </div>

              {showBankDetails && (
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <label htmlFor="bankDetails.bankName" className="block text-sm font-medium">
                      Bank Name
                    </label>
                    <input
                      id="bankDetails.bankName"
                      name="bankDetails.bankName"
                      type="text"
                      value={formData.bankDetails?.bankName}
                      onChange={handleChange}
                      placeholder="Bank of America"
                      className="input"
                    />
                  </div>

                  <div className="space-y-2" ref={accountTypeDropdownRef}>
                    <label htmlFor="bankDetails.accountType" className="block text-sm font-medium">
                      Account Type
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdowns((prev) => ({ ...prev, accountType: !prev.accountType }))}
                        className="w-full flex items-center justify-between px-3 py-2 border rounded-md input focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {formData.bankDetails?.accountType === "checking" ? "Checking" : "Savings"}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {dropdowns.accountType && (
                        <div className="absolute z-10 mt-1 w-full bg-slate-900 border border-gray-300 rounded-md shadow-lg">
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelect("bankDetails.accountType", "checking")}
                          >
                            Checking
                          </div>
                          <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelect("bankDetails.accountType", "savings")}
                          >
                            Savings
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bankDetails.accountNumber" className="block text-sm font-medium">
                      Account Number
                    </label>
                    <input
                      id="bankDetails.accountNumber"
                      name="bankDetails.accountNumber"
                      type="text"
                      value={formData.bankDetails?.accountNumber}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className="input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bankDetails.routingNumber" className="block text-sm font-medium">
                      Routing Number
                    </label>
                    <input
                      id="bankDetails.routingNumber"
                      name="bankDetails.routingNumber"
                      type="text"
                      value={formData.bankDetails?.routingNumber}
                      onChange={handleChange}
                      placeholder="123456789"
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this vendor..."
                className="input"
              />
              <p className="text-sm text-gray-500">Any additional information about this vendor</p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 ${
                  isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Vendor
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-gray-200 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

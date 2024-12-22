import { userStore } from '@/stores/UserStore'
import { Building2, Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import RegisterUser from './AddUser';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  // add any other fields you expect
}


function UserManagement() {
   const { users, fetchUsers, loading } = userStore()

     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
   
    useEffect(() => {
       
           fetchUsers()
       
    }, [fetchUsers])

    console.log(users)



  return (
    <div className='flex-col gap-4 flex'>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-500">Manage your vendors and supplier relationships</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </button>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl relative h-[100%]  rounded-lg shadow-xl w-full  overflow-y-auto">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="inline-flex items-center justify-center rounded-full w-8 h-8 bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Create New Staff</h2>
            </div>
            <div className="p-6">
              <RegisterUser
                // onSuccess={handleVendorCreated}
                // onCancel={() => setIsCreateModalOpen(false)}
                // isModal={true}
              />
            </div>
          </div>
        </div>
      )}

       

         <div className="card rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                 
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    First Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                   Last Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Department
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                   Role
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading vendors...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No vendors found</p>
                        <button
                        //   onClick={() => setIsCreateModalOpen(true)}
                          className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium btn-primary"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add User
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((vendor: User) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{vendor.firstName}</div>
                          {vendor.lastName && <div className="text-sm text-gray-500">{vendor.lastName}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{vendor.firstName}</div>
                          <div className="text-sm text-gray-500">{vendor.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vendor.department}, {vendor.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {/* {users.department.slice(0, 2).map((category) => (
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
                          )} */}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {vendor.createdAt}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <div>
                          <div className="font-medium text-gray-900">{formatCurrency(vendor.totalSpent)}</div>
                          <div className="text-sm text-gray-500">{vendor.totalPurchases} orders</div>
                        </div> */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                        //   className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[vendor.status]}`}
                        >
                          {vendor.isActive}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative" ref={vendor._id === isDropdownOpen ? dropdownRef : undefined}>
                          <button
                            onClick={() => setIsDropdownOpen(isDropdownOpen === vendor._id ? null : vendor._id)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {isDropdownOpen === vendor._id && (
                            <div className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
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
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      
    </div>
  )
}

export default UserManagement

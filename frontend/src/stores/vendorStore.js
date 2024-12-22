import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export const vendorStore = create(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      categoryOptions: ["materials",
          "labor",
          "manufacturing",
          "salaries",
          "rent",
          "utilities",
          "marketing",
          "insurance",
          "other",],
     paymentTermsOptions: ["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"],
     status: ["active", "inactive", "suspended"],
      vendors: [], // 🔹 List of users
      pagination: null,     

      createVendor: async (
        data
      ) => {
        set({ isLoading: true, error: null });
       
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.post(
            `${API_BASE_URL}/vendors`,
            data,
            {
              headers: { Authorization: `Bearer ${token}` }, // Corrected 'headers'
            }
          );

      

          set((state) => ({
           vendors: [...state.vendors, vendor],
            isLoading: false,
          }));
       
        } catch (error) {
          set({
            error: error?.response?.data?.message || "Failed to add user",
            isLoading: false,
          });
          return null;
        }
      },
      fetchVendors: async() => {
        set({isLoading: true})
        const token = localStorage.getItem("authToken")

        const response = await axios.get(`${API_BASE_URL}/vendors`,
          {
          headers:{ Authorization: `Bearer ${token }`} 
        }
      )
      const {data} = response?.data
      console.log(data)
      set({
        vendors: data?.vendors, isLoading:false, pagination: data?.pagination
      })

      }

    //   // 🔹 Permission methods
    //   hasPermission: (permission) => {
    //     const user = get().user;
    //     if (!user) return false;

    //     const role = user.role;
    //     const permissions = get().rolePermissions[role] || [];
    //     return permissions.includes(permission);
    //   },

    //   updateRolePermissions: (role, newPermissions) => {
    //     set((state) => ({
    //       rolePermissions: {
    //         ...state.rolePermissions,
    //         [role]: newPermissions,
    //       },
    //     }));
    //   },

    //   fetchUsers: async () => {
    //     try {
    //       const response = await axios.get(`${API_BASE_URL}/users`, {
    //         headers: {
    //           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    //         },
    //       });
          
    //       set({ users: response?.data?.users });
    //       console.log(response)
    //     } catch (error) {
    //       set({
    //         error: error.response?.message || "Failed to fetch users",
    //       });
    //     }
    //   },

    //   deleteUser: async (userId) => {
    //     try {
    //       await axios.delete(`${API_BASE_URL}/users/${userId}`, {
    //         headers: {
    //           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    //         },
    //       });
    //       set((state) => ({
    //         users: state.users.filter((u) => u.id !== userId),
    //       }));
    //     } catch (error) {
    //       set({
    //         error: error.response?.data?.message || "Failed to delete user",
    //       });
    //     }
    //   },
    //   addDepartment: (newDept) => {
    //     set((state) => {
    //       if (!state.departments.includes(newDept)) {
    //         return { departments: [...state.departments, newDept] };
    //       }
    //       return state;
    //     });
    //   },

    //   removeDepartment: (dept) => {
    //     set((state) => ({
    //       departments: state.departments.filter((d) => d !== dept),
    //     }));
    //   },
     }),
    {
      name: "vendor-storage",
      getStorage: () => localStorage,
    }
  )
);

// const mongoose = require("mongoose")

// const vendorSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     companyName: {
//       type: String,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//     },
//     alternatePhone: {
//       type: String,
//     },
//     address: {
//       street: String,
//       city: String,
//       state: String,
//       zipCode: String,
//       country: {
//         type: String,
//         default: "USA",
//       },
//     },
//     taxId: {
//       type: String,
//     },
//     paymentTerms: {
//       type: String,
//       enum: ["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"],
//       default: "Net 30",
//     },
//     bankDetails: {
//       bankName: String,
//       accountNumber: String,
//       routingNumber: String,
//       accountType: {
//         type: String,
//         enum: ["checking", "savings"],
//       },
//     },
//     categories: [
//       {
//         type: String,
//         enum: [
//           "materials",
//           "labor",
//           "manufacturing",
//           "salaries",
//           "rent",
//           "utilities",
//           "marketing",
//           "insurance",
//           "other",
//         ],
//       },
//     ],
//     status: {
//       type: String,
//       enum: ["active", "inactive", "suspended"],
//       default: "active",
//     },
//     rating: {
//       type: Number,
//       min: 1,
//       max: 5,
//     },
//     notes: {
//       type: String,
//       trim: true,
//     },
//     totalPurchases: {
//       type: Number,
//       default: 0,
//     },
//     totalSpent: {
//       type: Number,
//       default: 0,
//     },
//     lastPurchaseDate: {
//       type: Date,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   },

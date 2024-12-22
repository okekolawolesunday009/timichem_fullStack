import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Mock user data for development mode
const mockUsers = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
];

export const userStore = create(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      permissions: [
        "view_purchases",
        "create_purchases",
        "approve_purchases",
        "delete_purchases",
        "view_reports",
        "manage_vendors",
        "manage_users",
        "sales",
      ],
      isAdded: false,
      departments: ["finance", "operations", "sales", "marketing", "hr", "it"],

      users: [], // 🔹 List of users
      // role:["manager", "accountant", "user"],//admin is hidden
      rolePermissions: {
        admin: [
          "view_purchases",
          "create_purchases",
          "approve_purchases",
          "delete_purchases",
          "view_reports",
          "manage_vendors",
          "manage_users",
          "sales",
        ],
        user: ["view_purchases", "sales"],
        manager: [
          "view_purchases",
          "approve_purchases",
          "view_reports",
          "sales",
        ],
        accountant: [
          "view_purchases",
          "create_purchases",
          "approve_purchases",
          "delete_purchases",
          "view_reports",
          "manage_vendors",
          "sales",
        ],
      },

      addUser: async (
        firstName,
        lastName,
        email,
        password,
        role,
        department
      ) => {
        set({ isLoading: true, error: null });
        console.log(  firstName,
        lastName,
        email,
        password,
        role,
        department)
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.post(
            `${API_BASE_URL}/users`,
            { firstName, lastName, email, password, role, department },
            {
              headers: { Authorization: `Bearer ${token}` }, // Corrected 'headers'
            }
          );

          const user =  response?.data?.user;
          const message = response?.data?.message;

          set((state) => ({
            users: [...state.users, user],
            isLoading: false,
          }));
          console.log(response)

          return message;
        } catch (error) {
          set({
            error: error?.response?.data?.message || "Failed to add user",
            isLoading: false,
          });
          return null;
        }
      },

      // 🔹 Permission methods
      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;

        const role = user.role;
        const permissions = get().rolePermissions[role] || [];
        return permissions.includes(permission);
      },

      updateRolePermissions: (role, newPermissions) => {
        set((state) => ({
          rolePermissions: {
            ...state.rolePermissions,
            [role]: newPermissions,
          },
        }));
      },

      fetchUsers: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          
          set({ users: response?.data?.users });
          console.log(response)
        } catch (error) {
          set({
            error: error.response?.message || "Failed to fetch users",
          });
        }
      },

      deleteUser: async (userId) => {
        try {
          await axios.delete(`${API_BASE_URL}/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          set((state) => ({
            users: state.users.filter((u) => u.id !== userId),
          }));
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to delete user",
          });
        }
      },
      addDepartment: (newDept) => {
        set((state) => {
          if (!state.departments.includes(newDept)) {
            return { departments: [...state.departments, newDept] };
          }
          return state;
        });
      },

      removeDepartment: (dept) => {
        set((state) => ({
          departments: state.departments.filter((d) => d !== dept),
        }));
      },
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

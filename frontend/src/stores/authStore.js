import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Mock user data for development mode
const mockUsers = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })

        // if (process.env.NODE_ENV === "development") {
        //   // Simulated login for dev mode
        //   setTimeout(() => {
        //     const user = mockUsers.find((u) => u.username === username && u.password === password)

        //     if (user) {
        //       set({
        //         user: { id: user.id, username: user.username, role: user.role },
        //         isAuthenticated: true,
        //         isLoading: false,
        //       })
        //     } else {
        //       set({ error: "Invalid username or password", isLoading: false })
        //     }
        //   }, 800)
        // } else {
          // Real API login for production mode
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
            // console.log(response.data) 
            const user = response.data.user
            const token = response.data.token
            // console.log(user)

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })

            if (token) {
              localStorage.setItem("authToken", token)
            }
          } catch (error) {
            set({
              error: error.response?.data?.message || "Login failed",
              isLoading: false,
            })
          }
        // }
      },

      signup: async (email, name, password, role) => {
        set({ isLoading: true, error: null })

        // if (process.env.NODE_ENV === "development") {
        //   // Simulated signup for dev mode
        //   setTimeout(() => {
        //     if (mockUsers.some((u) => u.username === username)) {
        //       set({ error: "Username already exists", isLoading: false })
        //     } else {
        //       const newUser = { id: mockUsers.length + 1, username, password, role: "user" }
        //       mockUsers.push(newUser)

        //       set({
        //         user: { id: newUser.id, username: newUser.username, role: newUser.role },
        //         isAuthenticated: true,
        //         isLoading: false,
        //       })
        //     }
        //   }, 800)
        // } else {
          // Real API signup
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, name, password , role})
s
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error) {
            set({
              error: error.response?.data?.message || "Signup failed",
              isLoading: false,
            })
          }
        // }
      },

      logout: () => {
        localStorage.removeItem("authToken") // Remove token from storage
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: () => get().isAuthenticated,

      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
)

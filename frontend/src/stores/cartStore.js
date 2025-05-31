import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      order: [],
      paymentCategory: ["cash", "card", "room-charge"],

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const items = response.data.cart.items;
          // console.log(items)

          set({ items, isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to fetch cart",
            isLoading: false,
          });
        }
      },

      getSales: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");

          const response = await axios.get(`${API_BASE_URL}/orders/sales`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log(response.data); // ✅ Confirm structure
          set({ items: response.data, isLoading: false });
          return response.data; // ✅ Return only the data
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to get order item",
            isLoading: false,
          });
        }
      },

      addItem: async (productId, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.post(
            `${API_BASE_URL}/cart/add`,
            { productId, quantity },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const { data: items } = response.data;
          set({ items, isLoading: false });
          console.log(items);
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to add item",
            isLoading: false,
          });
        }
      },

      removeItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          await axios.delete(`${API_BASE_URL}/cart/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // const currentItems = get().items;

          // Filter out the removed item
          set((state) => ({
            items: state.items.filter((item) => item._id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to remove item",
            isLoading: false,
          });
        }
      },

      updateQuantity: async (productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.put(
            `${API_BASE_URL}/cart/${productId}`,
            { quantity },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          set({ items: response.data.cart.items, isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to update quantity",
            isLoading: false,
          });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          // console.log(id)
          const token = localStorage.getItem("authToken");
          await axios.delete(`${API_BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ items: [], isLoading: false });
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to clear cart",
            isLoading: false,
          });
        }
      },

      checkout: async (paymentMethod) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.post(
            `${API_BASE_URL}/orders`,
            { paymentMethod },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          set({ items: [], order: response.data.order, isLoading: false });
          return response.data.order; // return order on success
        } catch (error) {
          const errorMsg = error.response?.data?.message || "Checkout failed";
          set({ error: errorMsg, isLoading: false });
          console.log(errorMsg);
          throw new Error(errorMsg); // <-- throw here instead of returning
        }
      },

      getItemCount: () => {
        const items = get().items || [];
        // console.log(items)
        return items;
      },

      getTotal: () => {
        const items = get().items || [];
        // console.log(items)
        return items;
      },
    }),
    {
      name: "cart-storage",
      getStorage: () => localStorage,
    }
  )
);

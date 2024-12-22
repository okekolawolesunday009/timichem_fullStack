import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const purchaseStore = create(
  persist(
    (set, get) => ({
      isLoading: false,
      purchaseItems: [],
      error: null,

      fetchPurchases: async () => {
        set({ isLoading: false });
        const token = localStorage.getItem("authToken");

        const res = await axios.get(`${API_BASE_URL}/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        const { data } = res.data
         console.log(data)

        set({purchaseItems: data?.purchases})

        console.log(res);
      },
      createPurchase: async (data) => {
        set({ isLoading: false });
        console.log(data)

        const token = localStorage.getItem("authToken");

        const res = await axios.post(
          `${API_BASE_URL}/purchases`,
          data, // ✅ just data, not { data }
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Purchase created:", res.data);
      },
    }),
    {
      name: "purchase-storage",
      getStorage: () => localStorage,
    }
  )
);

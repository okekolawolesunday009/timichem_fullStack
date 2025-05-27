import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateBarcode } from "../utils/barcodeUtils";
import axios from "axios";

// Use different API URLs for development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialProducts = [
  {
    _id: "1",
    name: "Whiskey - Jack Daniels",
    price: 12.99,
    barcode: "123456789012",
    category: "spirits",
    stock: 24,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    _id: "2",
    name: "Vodka - Grey Goose",
    price: 14.99,
    barcode: "223456789012",
    category: "spirits",
    stock: 18,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    _id: "3",
    name: "Gin - Bombay Sapphire",
    price: 13.99,
    barcode: "323456789012",
    category: "spirits",
    stock: 15,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    _id: " 4",
    name: "Rum - Bacardi",
    price: 11.99,
    barcode: "423456789012",
    category: "spirits",
    stock: 20,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    _id: "5",
    name: "Beer - Heineken",
    price: 5.99,
    barcode: "523456789012",
    category: "beer",
    stock: 48,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "6",
    name: "Wine - Cabernet Sauvignon",
    price: 18.99,
    barcode: "623456789012",
    category: "wine",
    stock: 12,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    _id: "7",
    name: "Tequila - Patron",
    price: 16.99,
    barcode: "723456789012",
    category: "spirits",
    stock: 10,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    _id: "8",
    name: "Champagne - Moet",
    price: 24.99,
    barcode: "823456789012",
    category: "wine",
    stock: 8,
    image: "/placeholder.svg?height=200&width=200",
  },
];

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      categories:["spirits", "wine", "beer", "mixers", "other", "bitters", "energy drink","milk", "soda", "juice"],
      fetchProduct: async () => {
        set({ isLoading: true, error: null });

       
          try {
            const token = localStorage.getItem("authToken"); // NOTE: fixed casing here
            const response = await axios.get(`${API_BASE_URL}/products`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const products = response.data.products
            // console.log(products)

            set({ products, isLoading: false });
          } catch (error) {
            set({
              error:
                error.response?.data?.message || "Failed to fetch products",
              isLoading: false,
            });
          }
      
      },
      fetchProductById: async (id) => {
        set({ isLoading: true, error: null });

       
          try {
            const token = localStorage.getItem("authToken"); // NOTE: fixed casing here
            const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const product = response.data.product
            // console.log(product)

            set({ product, isLoading: false });
            return product
          } catch (error) {
            set({
              error:
                error.response?.data?.message || "Failed to fetch products",
              isLoading: false,
            });
          }
      
      },

      // addProduct: (product) => {
      //   set({ isLoading: true, error: null })

      //   // Simulate API call
      //   setTimeout(() => {
      //     const products = get().products
      //     const newProduct = {
      //       ...product,
      //       id: products.length > 0 ? Math.max(...products.map((p) => p._id)) + 1 : 1,
      //       barcode: product.barcode || generateBarcode(),
      //     }

      //     set({
      //       products: [...products, newProduct],
      //       isLoading: false,
      //     })
      //   }, 800)
      // },

      addProduct: async (name,description, price, barcode, category, stock, image) => {
        
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");

          const response = await axios.post(
            `${API_BASE_URL}/products`,
            { name,description, price, barcode, category, stock, image}, // or { product } depending on API expectation
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // assuming response.data.product contains the new product
          set((state) => ({
            products: response.data.product,
            isLoading: false,
          }));

        } catch (error) {
          console.error("Error adding product:", error);
          set({
            error: error.response?.data?.message || "Failed to add item",
            isLoading: false,
          });
        }
      },
        updateStock: (id, quantity) => {
        const products = get().products;
        const index = products.findIndex((p) => p._d === id);

        if (index !== -1) {
          const updatedProducts = [...products];
          updatedProducts[index] = {
            ...updatedProducts[index],
            stock: Math.max(0, updatedProducts[index].stock + quantity),
          };

          set({ products: updatedProducts });
        }
      },

      updateProduct: async(id,updatedProduct ) => {
        set({ isLoading: true, error: null });
        const  { name, description, price,barcode, category,
              stock, image } = updatedProduct

        try {
          const token = localStorage.getItem("authToken")
          const response = await axios.put(`${API_BASE_URL}/products/${id}`,
             { name, description, price,barcode, category, stock, image },{
            headers: {Authorization: `Bearer ${token}`} 
          })
          set({
            products: response.data.product,
            isLoading: false

          })
        } catch (error) {
          console.error("Error updating product", error);
          set({
            error:error.repsonse?.data?.message || "Failed to update item",
            isLoading:false
          })
        }

        // Simulate API call
        // setTimeout(() => {
        //   const products = get().products;
        //   const index = products.findIndex((p) => p._id === _id);

        //   if (index !== -1) {
        //     const updatedProducts = [...products];
        //     updatedProducts[index] = {
        //       ...updatedProducts[index],
        //       ...updatedProduct,
        //     };

        //     set({
        //       products: updatedProducts,
        //       isLoading: false,
        //     });
        //   } else {
        //     set({
        //       error: "Product not found",
        //       isLoading: false,
        //     });
        //   }
        // }, 800);
      },

      deleteProduct: (id) => {
        set({ isLoading: true, error: null });

        // Simulate API call
        setTimeout(() => {
          const products = get().products;
          const filteredProducts = products.filter((p) => p._id !== id);

          set({
            products: filteredProducts,
            isLoading: false,
          });
        }, 800);
      },

      getProductByBarcode: (barcode) => {
        return get().products.find((p) => p.barcode === barcode);
      },

    
    }),
    {
      name: "product-storage",
      getStorage: () => localStorage,
    }
  )
);

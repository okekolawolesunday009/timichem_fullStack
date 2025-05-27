"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { formatCurrency } from "../utils/barcodeUtils";
import CartItem from "../components/CartItem";
import { toast } from 'react-toastify';
import {
  ShoppingCart,
  CreditCard,
  Trash,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useMemo } from "react";


const Cart = () => {
  const navigate = useNavigate();
  const { items, clearCart, fetch, paymentCategory, checkout, getTotal } =
    useCartStore();
    // const {user} = useAuthStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(paymentCategory[0]);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const total = useMemo(() => getTotal(), [items]);
 

  useEffect(() => {
    fetch();
    // console.log(user)
  }, [fetch]);

  


const handleCheckout = async () => {
  setIsCheckingOut(true);
  toast.info("Processing your checkout...");

  try {
    setTimeout(() => {
      checkout(paymentMethod);
      clearCart();
      fetch()
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      toast.success("Checkout completed successfully!");
      navigate("/order");
    }, 2000);
  } catch (error) {
    console.error("Checkout error:", error);
    setIsCheckingOut(false);
    toast.error("There was an error during checkout. Please try again.");
  }
};

const handleCart = () => {
   clearCart();
   fetch()
   console.log("kkk")
}


 
 

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>

        {/* {Array.isArray(items) && items.length > 0 && (
          <button
            onClick={() => handleCart()}
            className="btn-secondary flex items-center text-sm"
          >
            <Trash size={16} className="mr-1" />
            Clear Cart
          </button>
        )} */}
      </div>

      {Array.isArray(items) && items.length === 0 ? (
        <div className="card text-center py-12">
          <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} />
          </div>

          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-6">
            Add some products to your cart to continue
          </p>

          <button
            onClick={() => navigate("/products")}
            className="btn-primary flex items-center mx-auto"
          >
            <ArrowLeft size={18} className="mr-1" />
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Cart Items</h2>

              <div className="divide-y divide-slate-700">
                {Array.isArray(items) &&
                  items.map((item) => <CartItem key={item.id} item={item} />)}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input"
                  >
                    <option value="">All Payment Method</option>
                    {paymentCategory.map((payment) => (
                      <option key={payment} value={payment}>
                        {payment}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax</span>
                  <span>{formatCurrency(total * 0.1)}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total * 1.1)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="btn-primary w-full flex items-center justify-center"
              >
                {/* {isCheckingOut ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : ( */}
                  <span className="flex items-center">
                    <CreditCard size={18} className="mr-2" />
                    Checkout
                  </span>
                {/* )} */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

import React from 'react'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { formatCurrency } from "../utils/barcodeUtils";
import CartItem from "../components/CartItem";
import {
  ShoppingCart,
  CreditCard,
  Trash,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useMemo } from "react";


export const Order = () => {

      const navigate = useNavigate();
      const { items, clearCart,order, fetch, paymentCategory, checkout, getTotal } =
        useCartStore();

     const [checkoutComplete, setCheckoutComplete] = useState(false);
      const [orderDetails, setOrderDetails] = useState(order);
    //   console.log(items, orderDetails)

      const totalQuantity = useMemo(() => {
  return orderDetails?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}, [orderDetails]);



    //   useEffect(() => {
    //       fetch();
    //     }, [fetch]);
      
 const handleContinueShopping = () => {
    setCheckoutComplete(false);
    setOrderDetails(null);
    navigate("/products");
  };

  return (
    <div className="fade-in">
           <div className="card max-w-2xl mx-auto text-center py-8">
             <div className="bg-emerald-900/30 text-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <Check size={32} />
             </div>
   
             <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
             <p className="text-slate-400 mb-6">
               Your order has been successfully processed.
             </p>
   
             <div className="bg-slate-800 rounded-lg p-4 mb-6 text-left">
               <div className="flex justify-between mb-2">
                 <span className="text-slate-400">Order ID:</span>
                 <span>{orderDetails && orderDetails._id}</span>
               </div>
               <div className="flex justify-between mb-2">
                 <span className="text-slate-400">Items:</span>
                 <span>
                   {totalQuantity}
                 </span>
               </div>
               <div className="flex justify-between font-bold">
                 <span>Total:</span>
                 <span>{formatCurrency(orderDetails && orderDetails.total)}</span>
               </div>
             </div>
   
             <button onClick={handleContinueShopping} className="btn-primary">
               Continue Shopping
             </button>
           </div>
         </div>
  )
}

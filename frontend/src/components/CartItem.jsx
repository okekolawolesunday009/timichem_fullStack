"use client";

import { useState } from "react";
import { formatCurrency } from "../utils/barcodeUtils";
import { useCartStore } from "../stores/cartStore";
import { Minus, Plus, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { useProductStore } from "../stores/productStore";

const CartItem = ({ item }) => {
  const { updateQuantity, error, items, removeItem } = useCartStore();
  const {fetchProductById} = useProductStore()
  const [quantity, setQuantity] = useState(item.quantity);
  // console.log(items)
  const navigate = useNavigate();
  const itemPrice = useMemo(() => item.price, [item]);

  const handleQuantityChange = (e) => {
    const newQuantity = Number.parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      setQuantity(newQuantity);
      updateQuantity(item.product._id, newQuantity);
      toast.success(`${item.product.name} updated quantey +1`);
      // navigate("/cart")
    } else {
      toast.error(error);
    }
  };

  const incrementQuantity = async (id) => {
  try {
    const res = await fetchProductById(id);
    const stock = res?.stock;

    if (stock <= quantity) {
      toast.error("Cannot add more than available stock.");
      return;
    }

    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateQuantity(item.product._id, newQuantity);

    // console.log("incremented", newQuantity, item.product._id);
    // toast.success(`${item.product.name} quantity updated +1`);
  } catch (err) {
    toast.error(`${item?.product?.name || "Product"} update failed.`);
    // console.error(err);
  }
  // navigate("/cart");
};


 const decrementQuantity = async (id) => {
  try {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateQuantity(item.product._id, newQuantity);
      toast.success(`${item?.product?.name || "Product"} updated`);
    } else {
      removeItem(item.product._id);
      toast.success(`${item?.product?.name || "Product"} removed.`);
      navigate("/products");
    }
  } catch (err) {
    toast.error(`${item?.product?.name || "Product"} removal failed.`);
    console.error(err);
  }
};


  function handleRemoveCart(id) {
    if (
      window.confirm("Are you sure you want to remove this item from the cart?")
    ) {
      removeItem(id);
      navigate("/products");
    }
  }

  return (
    <div className="flex items-center py-4 border-b border-slate-700">
      {/* <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded-md" /> */}

      <div className="ml-4 flex-1">
        <h3 className="font-medium">{item.product.name}</h3>
        <p className="text-slate-400 text-sm">
          {formatCurrency(item.price)} each
        </p>
      </div>

      <div className="flex items-center">
        <button
          onClick={decrementQuantity}
          className="p-1 rounded-l-md bg-slate-700 hover:bg-slate-600"
        >
          {quantity === 1 ? <Trash size={16} /> : <Minus size={16} />}
        </button>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="w-12 text-center bg-slate-800 border-y border-slate-700 py-1"
        />

        <button
          onClick={() => incrementQuantity(item.product._id)}
          className="p-1 rounded-r-md bg-slate-700 hover:bg-slate-600"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="ml-6 text-right">
        <p className="font-bold">{formatCurrency(itemPrice * item.quantity)}</p>
      </div>

      <button
        onClick={() => handleRemoveCart(item.product._id)}
        className="ml-4 p-1 text-red-400 hover:text-red-300"
      >
        <Trash size={18} />
      </button>
    </div>
  );
};

export default CartItem;

import { formatCurrency } from "../stores/utils/barcodeUtils"
import { useCartStore } from "../stores/cartStore"
import { useAuthStore } from "../stores/authStore"
import { ShoppingCart, Edit, Trash } from "lucide-react"
import { toast } from 'react-toastify';

const ProductCard = ({ product, onEdit, onDelete, productView }) => {
const { addItem, error } = useCartStore();
const { isAdmin } = useAuthStore();

const handleAddCart = (id) => {
  try {
    const success = addItem(id); // Assuming `addItem` returns a boolean or throws
    if (success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(error);
    }
  } catch (err) {
    toast.error(error);
  }
};


  return (
    <div className={`card card-hover ${productView ? "": "flex flex-row mb-2 items-center justify-between "}`}>
      <div className={`"relative flex-row flex bg-red-500"`}>
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className={` object-cover rounded-lg mb-4 ${productView ? "w-full h-48 bg-red-500 ": "h-10"}`}
        />
        <div className="absolute top-2 right-2 bg-slate-900 bg-opacity-70 px-2 py-1 rounded text-xs font-medium">
          {product.category}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-1">{product.name}</h3>

      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold text-blue-400">{formatCurrency(product.price)}</span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            product.stock > 10
              ? "bg-emerald-900 text-emerald-300"
              : product.stock > 0
                ? "bg-amber-900 text-amber-300"
                : "bg-red-900 text-red-300"
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => handleAddCart(product._id)}
          disabled={product.stock <= 0}
          className="btn-primary flex items-center text-sm py-1.5"
        >
          <ShoppingCart size={16} className="mr-1" />
          Add to Cart
        </button>

        {isAdmin() && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product._id)}
              className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="p-1.5 bg-red-900 rounded-lg hover:bg-red-800 transition-colors"
            >
              <Trash size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard

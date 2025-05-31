  import { Link } from "react-router-dom"
  import { useAuthStore } from "../stores/authStore"
  import { useCartStore } from "../stores/cartStore"
  import { ShoppingCart, Menu, User, LogOut } from "lucide-react"
  import { useEffect, useState } from "react"
import { useProductStore } from "../stores/productStore"
import exportToExcel from "../utils/exportToExport"

  const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuthStore()
    const { getItemCount } = useCartStore()
    const { products, fetchProduct } = useProductStore()
    const [storeProduct, setStoreProduct] = useState([])
    const itemCount = getItemCount()
    const [dropState, setDropState] = useState(false)
    const handleClick = () => {
      setDropState(!dropState)
    }

    useEffect(() => {
     const productStore = fetchProduct()
     setStoreProduct(productStore)
    }, [fetchProduct])

     const handleExport = () => {
      console.log(products)
      exportToExcel(products, 'Timchem-Invoices');
    };


    


    return (
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-4 p-1 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <Menu size={24} />
          </button>

          <Link to="/dashboard" className="text-xl font-bold text-white">
            Bar Inventory
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

            <div>
              <button onClick={handleExport}>Export stock to Excel</button>
            </div>

          <div className="relative group">
            <button className="flex items-center space-x-1 p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">
              <User size={20} onClick={handleClick} />
              <span className="hidden md:inline">{user?.username}</span>
            </button>

            <div className={`absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-10   ${dropState === true ? "block" :"hidden"}`}>
              <div className="px-4 py-2 text-sm text-slate-400">
                Signed in as <span className="font-medium text-white">{user?.name}</span>
              </div>
              <div className="border-t border-slate-700"></div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  export default Navbar


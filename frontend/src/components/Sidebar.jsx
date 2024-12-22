import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"
import { BookUser, Home, Package, PlusCircle, Scan, Sheet, ShoppingCart, Users, Weight, X } from "lucide-react"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  const { isAdmin, isAccountant, isManager} = useAuthStore()

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <Package size={20} />,
    },
    
  ]

    // Add admin-only routes
  if (isAdmin() || isManager()) {

    navItems.splice(2, 0, 
    
    {
      name: "Scanner",
      path: "/scanner",
      icon: <Scan size={20} />,
    },

    {
      name: "Cart",
      path: "/cart",
      icon: <ShoppingCart size={20} />,
    },)  
  }

   // Add admin-only routes
  if (isAdmin() || isManager() || isAccountant()) {

    navItems.splice(2, 0, {
      name: "Report",
      path: "/report",
      icon: <Sheet size={20} />,
    },  {
      name: "Purchases",
      path: "/purchases",
      icon: <Weight size={20} />,
    },  {
      name: "Vendors",
      path: "/vendors",
      icon: <BookUser size={20} />,
    })  
  }

  // Add admin-only routes
  if (isAdmin()  || isManager()) {

    navItems.splice(2, 0, {
      name: "Add Product",
      path: "/add-product",
      icon: <PlusCircle size={20} />,
    },
  {
      name: "Add User",
      path: "/users",
      icon: <Users size={20} />,
    },)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Company Inventory</h1>
          <button
            className="md:hidden p-1 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Sidebar


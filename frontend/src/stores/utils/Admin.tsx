import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../authStore"

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuthStore()

  if (!isAuthenticated || isAdmin) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}

export default AdminRoute


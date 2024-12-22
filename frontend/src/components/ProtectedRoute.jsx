import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"

const ProtectedRoute = () => {
  const { isAuthenticated, isAdmin } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}

export default ProtectedRoute


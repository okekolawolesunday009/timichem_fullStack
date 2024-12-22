import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"

const AdminRoute = () => {
  const { isAdmin , isManager} = useAuthStore()

  if (!isAdmin() && !isManager()) {
    return <Navigate to="/dashboard" />
  }

  return <Outlet />
}

export default AdminRoute


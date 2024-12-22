import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"
import { userStore } from "@/stores/UserStore"

const AccountProtectedRoute = () => {
  const { isAccountant, isManager, isAdmin } = useAuthStore()



 if (!isAdmin() && !isAccountant() && !isManager()) {
  return <Navigate to="/product" />;
}


  return <Outlet />
}

export default AccountProtectedRoute


"use client";

import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import Products from "./pages/Products";
import BarcodeScanner from "./pages/BarcodeScanner";
import Cart from "./pages/Cart";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Order } from "./pages/Order";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RegisterUser from "./pages/AddUser";
import ProfitLossReport from "./pages/profit-loss-report";
import AccountProtectedRoute from "./components/AccountRoute";
import PurchaseModule from "./pages/purchase-module";
import CreateVendorForm from "./pages/CreateVendor";
import VendorManagement from "./pages/VendorManagement";
import UserManagement from "./pages/UserManagement";

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { hasPermission } = useAuthStore();

  // if (hasPermission("manage_users")) {
  //   // show "Manage Users" button
  // }

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />
            }
          />
          <Route element={<ProtectedRoute />}></Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/scanner" element={<BarcodeScanner />} />
              <Route path="/cart" element={<Cart />} />
              <Route element={<AdminRoute />}>
                <Route path="/register-user" element={<RegisterUser />} />
                 <Route path="/users" element={<UserManagement />} />
              </Route>

              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/update-product/:id" element={<AddProduct />} />
              <Route path="/order" element={<Order />} />
              <Route element={<AccountProtectedRoute />}>
                <Route path="/report" element={<ProfitLossReport />} />
                <Route path="/purchases" element={<PurchaseModule />} />
                <Route path="/create-vendor" element={<CreateVendorForm />} />
                <Route path="/vendors" element={<VendorManagement />} />
              </Route>
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
            }
          />
        </Routes>
      </Router>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;

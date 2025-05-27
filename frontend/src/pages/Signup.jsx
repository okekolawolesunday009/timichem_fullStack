"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"
import { UserPlus } from "lucide-react"

const Signup = () => {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")

  const [validationError, setValidationError] = useState("")
  const { signup, isLoading, error, checkAuth } = useAuthStore()
  const role = "user"
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    // Reset validation error
    setValidationError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    // Validate password length
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }


    signup(email,name, password, role)
    if (checkAuth) {
      navigate("/dashboard")
    }
    // console.log(email,name, password, role)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="card max-w-md w-full slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Timchem Inventory</h1>
          <p className="text-slate-400 mt-2">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* {(error || validationError) && (
            <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
              {error || validationError}
            </div>
          )} */}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Choose a username"
              required
            />
             
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
             
          <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="user@gmail.com"
              required
            />
             
          </div>
         

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Choose a password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center">
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus size={18} className="mr-2" />
                Sign up
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup


"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { UserPlus } from "lucide-react";
import { userStore } from "@/stores/UserStore";
import { toast } from "react-toastify"

// const { departments } = userStore();

// useEffect(() => {
//   if (departments) {
//     console.log(departments);
//   } else {
//     console.log("Department is null or undefined");
//   }
// }, [departments]);

const RegisterUser = () => {
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const { departments, rolePermissions } = userStore();
  const [password, setPassword] = useState(departments[2]);
  const [department, setDepartment] = useState("user");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  // console.log(departments, rolePermissions);

  const [validationError, setValidationError] = useState("");


  const { signup, isLoading, error, } = useAuthStore();
  const { addUser } = userStore()
  // const role = "user"
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await addUser(
        firstName,
        lastName,
        email,
        password,
        role,
        department
      );
      console.log({ firstName, lastName, email, password, role, department })
      console.log(response)

      if (response) {
        toast.success("User created successfully");
        navigate("/dashboard"); // Optional: navigate after success
      } else {
        toast.error(response?.data?.message || error );
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <div className=" mx-auto flex flex-col items-center justify-center  px-4">

     
      <div className=" w-full mt-2 slide-up">
         
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* {(error || validationError) && (
            <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
              {error || validationError}
            </div>
          )} */}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setfirstName(e.target.value)}
                className="input max-w-md"
                placeholder="Enter a  username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setlastName(e.target.value)}
                className="input max-w-md"
                placeholder="Enter a lastname"
                required
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input"
              >
                {departments.map((dept: string, index: number) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input max-w-md"
                placeholder="user@gmail.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input"
              >
                {Object.keys(rolePermissions).map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input max-w-md"
                placeholder="Choose a password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input max-w-md"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-4 w-full flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
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
               Create Staff
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;

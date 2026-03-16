"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { FaCheck, FaEye, FaEyeSlash, FaLock, FaTimes } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter, Varta } from "next/font/google";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { AxiosError } from "axios";

import api from "@/lib/axios";
import { useAuthContext } from "@/app/context/AuthContext";

import bgImageDesktop from "@/assets/common/SalonLogin.svg";
import bgImageMobile from "@/assets/common/SalonLoginMobile.svg";

const varta = Varta({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

type LoginErrors = { email: string; password: string };

type AuthUser = {
  role: "ADMIN" | "STAFF" | "CUSTOMER";
};

interface LoginResponse {
  user: AuthUser;
}

interface ErrorResponse {
  message?: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "sent">("email");
  const [errors, setErrors] = useState<LoginErrors>({
    email: "",
    password: "",
  });
  const [resetErrors, setResetErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuthContext();

  const rawRedirect = searchParams.get("redirect");
  const redirect = rawRedirect ? decodeURIComponent(rawRedirect) : null;

  // Check for error params on mount
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "session-expired") {
      toast.info("Your session has expired. Please login again.");
    } else if (error === "account-inactive") {
      toast.error("Your account is inactive. Please contact support.");
    } else if (error === "access-denied") {
      toast.error("You don't have permission to access this page.");
    }
  }, [searchParams]);

  const redirectByRole = (user: AuthUser) => {
    if (redirect) {
      router.replace(redirect);
    } else if (user.role === "CUSTOMER") {
      router.replace("/dashboards/customer");
    } else if (user.role === "ADMIN") {
      router.replace("/dashboards/admin");
    } else {
      router.replace("/dashboards/staff");
    }
  };

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Valid email is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    toast.dismiss();
    const loginToast = toast.loading("Signing in...");

    try {
      // Make login request - cookie will be set automatically by backend
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { user } = res.data;

      // Update auth context with user data
      await checkAuth();

      toast.update(loginToast, {
        render: "Login successful! Redirecting...",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      // Small delay to show success message
      setTimeout(() => {
        redirectByRole(user);
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);

      let message = "Login failed. Please try again.";

      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data as ErrorResponse | undefined;

        if (status === 401) {
          message = "Invalid email or password";
        } else if (status === 403) {
          message = data?.message || "Account is deactivated";
        } else if (data?.message) {
          message = data.message;
        }
      }

      toast.update(loginToast, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetErrors("Email is required");
      return;
    }

    if (!validateEmail(resetEmail)) {
      setResetErrors("Valid email is required");
      return;
    }

    setResetErrors("");
    setIsResetLoading(true);
    const resetToast = toast.loading("Sending reset email...");

    try {
      await api.post("/auth/forgot-password", {
        email: resetEmail,
      });

      toast.update(resetToast, {
        render:
          "If an account exists with this email, a reset link has been sent.",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      setResetStep("sent");

      setTimeout(() => {
        setShowResetModal(false);
        setResetStep("email");
        setResetEmail("");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);

      let message = "Password reset failed. Please try again.";

      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data as ErrorResponse | undefined;

        if (status === 404) {
          message = data?.message || "User with this email does not exist";
        } else if (data?.message) {
          message = data.message;
        }
      }

      toast.update(resetToast, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep("email");
    setResetEmail("");
    setResetErrors("");
  };

  return (
    <>
      <div
        className={`min-h-screen flex items-center justify-center bg-[#E9F2FF] ${inter.className}`}
      >
        {/* Desktop Background Image */}
        <div className="hidden md:block fixed inset-0 z-0">
          <Image
            src={bgImageDesktop}
            alt="Desktop Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Mobile Background Image */}
        <div className="md:hidden fixed inset-0 z-0">
          <Image
            src={bgImageMobile}
            alt="Mobile Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 w-[90%] max-w-[380px] relative z-10">
          <h2
            className={`${varta.className} text-[11px] text-center uppercase font-medium tracking-[0.2em] text-gray-900 mb-3`}
          >
            LUME SALON
          </h2>

          <h1
            className={`${inter.className} text-3xl sm:text-4xl mb-1 font-bold text-black text-center`}
          >
            Sign In
          </h1>

          <p
            className={`${inter.className} text-gray-500 text-center mb-6 sm:mb-8 text-sm sm:text-base`}
          >
            Login to your{" "}
            <span className="text-indigo-700 font-semibold">L U M E</span>{" "}
            account
          </p>

          <form onSubmit={handleEmailLogin}>
            <>
              <div className="relative mb-2">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-900">
                  <MdEmail />
                </span>

                <input
                  type="email"
                  placeholder="Enter your Email"
                  className={`${varta.className} w-full pl-10 pr-10 py-3 rounded-full ${
                    errors.email
                      ? "bg-red-50 border border-red-500"
                      : "bg-indigo-50"
                  } placeholder-gray-500 text-sm mt-0.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  disabled={isLoading}
                />

                {email && validateEmail(email) && (
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-600">
                    <FaCheck />
                  </span>
                )}
              </div>

              {errors.email && (
                <p className="text-red-500 text-xs mb-3 pl-2">{errors.email}</p>
              )}

              <div className="relative mb-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-900">
                  <FaLock />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  className={`${varta.className} w-full pl-10 pr-10 py-3 rounded-full ${
                    errors.password
                      ? "bg-red-50 border border-red-500"
                      : "bg-indigo-50"
                  } placeholder-gray-500 text-sm mt-0.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                  }}
                  disabled={isLoading}
                />

                <span
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-700 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mb-3 pl-2">
                  {errors.password}
                </p>
              )}

              <button
                type="button"
                className={`${varta.className} mb-4 w-full text-right text-sm text-indigo-600 hover:text-indigo-800 hover:underline`}
                onClick={() => setShowResetModal(true)}
              >
                Forgot Password?
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${
                  isLoading
                    ? "bg-gray-800 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                } text-white text-sm py-3 rounded-full transition-colors duration-200 mb-3 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </>
          </form>

          <p
            className={`${varta.className} text-center text-sm mt-3 text-black`}
          >
            Don&apos;t have an Account?{" "}
            <span
              className="text-indigo-700 hover:underline cursor-pointer font-semibold"
              onClick={() =>
                !isLoading &&
                router.push(
                  redirect
                    ? `/auth/signup_email?redirect=${encodeURIComponent(redirect)}`
                    : "/auth/signup_email",
                )
              }
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeResetModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <button
                onClick={closeResetModal}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLock className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {resetStep === "email"
                    ? "Reset Password"
                    : "Check Your Email"}
                </h3>
                <p className="text-sm text-gray-600">
                  {resetStep === "email"
                    ? "Enter your email address and we'll send you a link to reset your password."
                    : "We've sent a password reset link to your email address. The link will expire in 10 minutes."}
                </p>
              </div>

              {resetStep === "email" ? (
                <form onSubmit={handlePasswordReset}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <MdEmail />
                      </span>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setResetErrors("");
                        }}
                        placeholder="Enter your email"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          resetErrors
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                        disabled={isResetLoading}
                      />
                    </div>
                    {resetErrors && (
                      <p className="text-red-500 text-xs mt-2">{resetErrors}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeResetModal}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isResetLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResetLoading}
                      className="flex-1 bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {isResetLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
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
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <div className="mb-6 p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-800 mb-2">
                      Reset link sent to:
                    </p>
                    <p className="font-semibold text-gray-900">{resetEmail}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => {
                        setResetStep("email");
                        setResetErrors("");
                      }}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      try again
                    </button>
                  </p>
                  <button
                    onClick={closeResetModal}
                    className="w-full px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

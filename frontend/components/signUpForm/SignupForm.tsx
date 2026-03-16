"use client";

import React, { useState } from "react";
import { FaCheck, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Carlito, Inter, Varta } from "next/font/google";
import Image from "next/image";

import api from "@/lib/axios";

import bgImageDesktop from "@/assets/common/GemLogin.svg";
import bgImageMobile from "@/assets/common/GemLoginMobile.svg";
import { AxiosError } from "axios";

const carlito = Carlito({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

const varta = Varta({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirmpassword: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Search params for redirect
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirect = rawRedirect ? decodeURIComponent(rawRedirect) : null;

  // Character limits
  const CHAR_LIMITS = {
    firstname: 15,
    lastname: 15,
  };

  // Validation Part
  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phonePattern = /^07[0-9]{8}$/;
    return phonePattern.test(phone);
  };

  const validatePassword = (password: string): boolean => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
    return passwordPattern.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First Name validation
    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    } else if (formData.firstname.length > CHAR_LIMITS.firstname) {
      newErrors.firstname = `First name must be ${CHAR_LIMITS.firstname} characters or less`;
    }

    // Last Name validation
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    } else if (formData.lastname.length > CHAR_LIMITS.lastname) {
      newErrors.lastname = `Last name must be ${CHAR_LIMITS.lastname} characters or less`;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Sri Lankan phone number";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 6 characters with uppercase, lowercase, and a number";
    }

    // Confirm password validation
    if (!formData.confirmpassword) {
      newErrors.confirmpassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // Show toast for each error
    Object.values(newErrors).forEach((error) => {
      toast.error(error, { autoClose: 3000 });
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Apply character limits
    let processedValue = value;
    if (name === "firstname" && value.length > CHAR_LIMITS.firstname) {
      processedValue = value.slice(0, CHAR_LIMITS.firstname);
    } else if (name === "lastname" && value.length > CHAR_LIMITS.lastname) {
      processedValue = value.slice(0, CHAR_LIMITS.lastname);
    } else if (name === "phone") {
      // Allow only digits and limit to 10 characters
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({
      ...prev,
      gender,
    }));

    // Clear gender error when user selects an option
    if (errors.gender) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.gender;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    toast.dismiss();
    const loginToast = toast.loading("Creating account...");

    try {
      // Send registration data to backend
      await api.post("/auth/register", {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender.toLowerCase(),
        password: formData.password,
      });
      toast.update(loginToast, {
        render: "Account created successfully! Redirecting to login...",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push(
          redirect
            ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
            : "/auth/login",
        );
      }, 2000);
    } catch (err: unknown) {
      console.error("Signup error:", err);

      let errorMessage = "Signup failed. Please try again.";

      if (err instanceof AxiosError) {
        const data = err.response?.data;

        if (data?.errors?.length) {
          errorMessage = data.errors.join(", ");
        } else {
          errorMessage = data?.message || err.message;
        }
      }

      toast.update(loginToast, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show character count warning
  const showCharacterWarning = (
    field: string,
    currentLength: number,
    limit: number,
  ) => {
    if (currentLength > limit * 0.8) {
      return currentLength >= limit ? "text-red-600" : "text-yellow-600";
    }
    return "text-gray-500";
  };

  return (
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

      <div className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative mx-2 sm:mx-0">
        <div className="text-center">
          <h2
            className={`${varta.className} text-xs sm:text-sm uppercase font-medium tracking-[0.2em] text-gray-900 mb-2`}
          >
            GemCraft Learning Center
          </h2>
          <h1
            className={`${carlito.className} text-3xl sm:text-4xl -mb-3 font-bold text-black text-center -mt-1`}
          >
            Create Account
          </h1>
          <p
            className={`${varta.className} text-gray-500 text-center mt-3 mb-3 text-xs sm:text-sm`}
          >
            Join the <span className="text-[#FF5252] font-semibold">G L C</span>{" "}
            community today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* First Name */}
            <div className="md:col-span-1">
              <div
                className={`relative flex items-center h-12 rounded-full ${
                  errors.firstname
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } focus-within:ring-2 focus-within:ring-indigo-300`}
              >
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-sm text-gray-900" />
                </span>
                <input
                  type="text"
                  name="firstname"
                  placeholder="First name *"
                  className={`${varta.className} translate-y-px w-full h-full pl-9 sm:pl-10 pr-10 sm:pr-12 bg-transparent placeholder-gray-500 text-xs sm:text-sm text-gray-800 focus:outline-none`}
                  required
                  value={formData.firstname}
                  onChange={handleChange}
                />
                {!errors.firstname && formData.firstname && (
                  <span className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                    <FaCheck className="text-sm text-green-600" />
                  </span>
                )}
              </div>

              {/*First Name Character limit indicator*/}
              <div className="flex justify-between mt-1 px-2">
                <span
                  className={`text-xs ${showCharacterWarning("firstname", formData.firstname.length, CHAR_LIMITS.firstname)}`}
                >
                  {formData.firstname.length}/{CHAR_LIMITS.firstname}
                </span>
                {formData.firstname.length > CHAR_LIMITS.firstname * 0.8 && (
                  <span
                    className={`text-xs flex items-center ${showCharacterWarning("firstname", formData.firstname.length, CHAR_LIMITS.firstname)}`}
                  >
                    {formData.firstname.length >= CHAR_LIMITS.firstname ? (
                      <>Maximum reached</>
                    ) : (
                      <>Approaching limit</>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div className="md:col-span-1">
              <div
                className={`relative flex items-center h-12 rounded-full ${
                  errors.lastname
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } focus-within:ring-2 focus-within:ring-indigo-300`}
              >
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-sm text-gray-900" />
                </span>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last name *"
                  className={`${varta.className} translate-y-px w-full h-full pl-9 sm:pl-10 pr-10 sm:pr-12 bg-transparent placeholder-gray-500 text-xs sm:text-sm text-gray-800 focus:outline-none`}
                  required
                  value={formData.lastname}
                  onChange={handleChange}
                />
                {!errors.lastname && formData.lastname && (
                  <span className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                    <FaCheck className="text-sm text-green-600" />
                  </span>
                )}
              </div>

              {/*Last Name character limit indicator*/}
              <div className="flex justify-between mt-1 px-2">
                <span
                  className={`text-xs ${showCharacterWarning("lastname", formData.lastname.length, CHAR_LIMITS.lastname)}`}
                >
                  {formData.lastname.length}/{CHAR_LIMITS.lastname}
                </span>
                {formData.lastname.length > CHAR_LIMITS.lastname * 0.8 && (
                  <span
                    className={`text-xs flex items-center ${showCharacterWarning("lastname", formData.lastname.length, CHAR_LIMITS.lastname)}`}
                  >
                    {formData.lastname.length >= CHAR_LIMITS.lastname ? (
                      <>Maximum reached</>
                    ) : (
                      <>Approaching limit</>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Email*/}
            <div className="md:col-span-1">
              <div
                className={`relative flex items-center h-12 rounded-full ${
                  errors.email
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } focus-within:ring-2 focus-within:ring-indigo-300`}
              >
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <MdEmail className="text-base sm:text-lg text-gray-900" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your Email *"
                  className={`${varta.className} translate-y-px w-full h-full pl-9 sm:pl-10 pr-10 sm:pr-12 bg-transparent placeholder-gray-500 text-xs sm:text-sm text-gray-800 focus:outline-none`}
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                {!errors.email &&
                  formData.email &&
                  validateEmail(formData.email) && (
                    <span className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                      <FaCheck className="text-sm text-green-600" />
                    </span>
                  )}
              </div>
            </div>

            {/* Phone Number*/}
            <div className="md:col-span-1">
              <div
                className={`relative flex items-center h-12 rounded-full ${
                  errors.phone
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } focus-within:ring-2 focus-within:ring-indigo-300`}
              >
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <MdPhone className="text-base sm:text-lg text-gray-900" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number *"
                  className={`${varta.className} translate-y-px w-full h-full pl-9 sm:pl-10 pr-10 sm:pr-12 bg-transparent placeholder-gray-500 text-xs sm:text-sm text-gray-800 focus:outline-none`}
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
                {!errors.phone &&
                  formData.phone &&
                  validatePhone(formData.phone) && (
                    <span className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                      <FaCheck className="text-sm text-green-600" />
                    </span>
                  )}
              </div>
            </div>

            {/* Password */}
            <div className="md:col-span-1">
              <div
                className={`relative flex items-center h-12 rounded-full ${
                  errors.password
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } focus-within:ring-2 focus-within:ring-indigo-300`}
              >
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-sm text-gray-900" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your Password *"
                  className={`${varta.className} translate-y-px w-full h-full pl-9 sm:pl-10 pr-10 sm:pr-12 bg-transparent placeholder-gray-500 text-xs sm:text-sm text-gray-800 focus:outline-none`}
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-700 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-sm" />
                  ) : (
                    <FaEye className="text-sm" />
                  )}
                </span>
              </div>
              {formData.password && !errors.password && (
                <p
                  className={`${varta.className} text-xs mt-1 pl-2 ${
                    validatePassword(formData.password)
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  Password strength:{" "}
                  {validatePassword(formData.password) ? "Valid" : "Too short"}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-1">
              <div
                className={`relative flex items-center h-12 rounded-full ${
                  errors.confirmpassword
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } focus-within:ring-2 focus-within:ring-indigo-300`}
              >
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-sm text-gray-900" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpassword"
                  placeholder="Confirm your Password *"
                  className={`${varta.className} translate-y-px w-full h-full pl-9 sm:pl-10 pr-10 sm:pr-12 bg-transparent placeholder-gray-500 text-xs sm:text-sm text-gray-800 focus:outline-none`}
                  required
                  value={formData.confirmpassword}
                  onChange={handleChange}
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-700 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-sm" />
                  ) : (
                    <FaEye className="text-sm" />
                  )}
                </span>
              </div>
              {formData.confirmpassword &&
                formData.password === formData.confirmpassword &&
                !errors.confirmpassword && (
                  <p
                    className={`${varta.className} text-xs mt-1 pl-2 text-green-600`}
                  >
                    Passwords match
                  </p>
                )}
            </div>

            {/* Gender Field - Full width */}
            <div className="md:col-span-2">
              <div
                className={`p-4 rounded-3xl ${
                  errors.gender
                    ? "bg-red-50 border border-red-500"
                    : "bg-indigo-50"
                } transition-colors`}
              >
                <label
                  className={`${varta.className} block text-sm font-medium text-gray-800 mb-3`}
                >
                  Gender *
                </label>
                <div className="flex flex-row gap-4 sm:gap-6">
                  {["Male", "Female", "Other"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <div className="relative">
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={formData.gender === option}
                          onChange={() => handleGenderChange(option)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.gender === option
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-gray-400 group-hover:border-indigo-400"
                          }`}
                        >
                          {formData.gender === option && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`${
                          varta.className
                        } text-sm text-gray-800 group-hover:text-indigo-700 transition-colors ${
                          formData.gender === option
                            ? "text-indigo-700 font-medium"
                            : ""
                        }`}
                      >
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p
                    className={`${varta.className} text-red-600 text-xs mt-2 flex items-center`}
                  >
                    <FaCheck className="h-3 w-3 mr-1" />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              } text-white text-xs sm:text-sm py-3.5 h-12 rounded-full transition-colors duration-200 flex items-center justify-center`}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p
          className={`${varta.className} text-center text-xs sm:text-sm mt-4 sm:mt-6 text-black`}
        >
          Already have an account?{" "}
          <span
            className="text-indigo-700 hover:underline cursor-pointer font-semibold"
            onClick={() => router.push("/auth/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;

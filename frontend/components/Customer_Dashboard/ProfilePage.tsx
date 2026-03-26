"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import {
  User,
  Mail,
  Phone,
  Venus,
  Edit,
  X,
  Upload,
  Lock,
  Eye,
  EyeOff,
  IdCard,
  MapPin,
  Calendar,
} from "lucide-react";
import { Inter } from "next/font/google";
import Lottie from "lottie-react";
import gemAnimation from "@/public/lottie/salon.json";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  address?: string;
  nic?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<UserProfile>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    nic: "",
  });

  const [originalData, setOriginalData] = useState<UserProfile | null>(null);

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

  const getPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500" };
    if (score === 2) return { label: "Medium", color: "bg-yellow-500" };
    if (score >= 3) return { label: "Strong", color: "bg-green-500" };

    return { label: "", color: "" };
  };

  // Track changes
  useEffect(() => {
    if (!originalData) return;
    const isEqual = JSON.stringify(formData) === JSON.stringify(originalData);
    setHasChanges(!isEqual);
  }, [formData, originalData]);

  /* ===========================
     FETCH PROFILE
  =========================== */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/customer/profile");

      if (res.data.success) {
        setFormData(res.data.profile);
        setOriginalData(res.data.profile);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ===========================
     HANDLE INPUT CHANGE
  =========================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===========================
     UPDATE PROFILE
  =========================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.put("/customer/profile", {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
      });

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setOriginalData({ ...formData });
        setEditMode(false);
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ===========================
     CANCEL EDIT
  =========================== */
  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setEditMode(false);
  };

  /* ===========================
     CHANGE PASSWORD
  =========================== */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  /* ===========================
     LOADING UI
  =========================== */
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen "
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-24 h-24 sm:w-32 sm:h-32"
        >
          <Lottie animationData={gemAnimation} loop />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="profile-page"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className={`p-4 md:p-6  min-h-screen ${inter.className}`}
      >
        <div className="max-w-[1300px] mx-auto">
          <motion.div
            variants={itemVariants}
            className="sm:mb-10 mb-5 sm:mt-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-4xl text-gray-200 font-bold sm:text-left text-center">
                Customer Profile
              </h2>
              <p className="text-md text-gray-400 sm:text-left text-center">
                View and manage your personal information
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Profile Picture & Info Section */}
              <motion.div
                variants={sectionVariants}
                className="bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-700"
              >
                <motion.h2
                  className="text-lg font-semibold text-gray-300 mb-6 pb-2 border-b border-gray-700 flex items-center"
                  variants={itemVariants}
                >
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  Profile Information
                </motion.h2>
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div
                    className="flex flex-col items-center"
                    variants={itemVariants}
                  >
                    {/* Avatar */}
                    <motion.div
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-4 border-gray-600 shadow-lg mb-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-4xl font-bold text-gray-300">
                        {getInitials(formData.firstname, formData.lastname)}
                      </span>
                    </motion.div>

                    {/* User info */}
                    <motion.div className="text-center mb-4 max-w-xs">
                      <h3
                        className={`sm:text-2xl text-xl font-bold transition-colors ${
                          editMode ? "text-gray-500" : "text-gray-200"
                        }`}
                      >
                        {formData.firstname} {formData.lastname}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {formData.email}
                      </p>
                    </motion.div>

                    {/* Edit mode indicator */}
                    {editMode && (
                      <motion.div
                        className="text-xs text-amber-500 text-center mb-3 max-w-xs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p>Edit mode active - Click fields to update</p>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Personal Information Section */}
              <motion.div
                variants={sectionVariants}
                className="bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-700"
              >
                <motion.h2
                  className="text-lg font-semibold text-gray-300 mb-6 pb-2 border-b border-gray-700 flex items-center"
                  variants={itemVariants}
                >
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  Personal Information
                </motion.h2>
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      First Name*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-colors ${
                          editMode
                            ? "border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            : "border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Last Name*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-colors ${
                          editMode
                            ? "border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            : "border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      NIC
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nic"
                        value={formData.nic || ""}
                        onChange={handleChange}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      />
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-colors ${
                          editMode
                            ? "border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            : "border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                      <Venus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Contact Details Section */}
              <motion.div
                variants={sectionVariants}
                className="bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-700"
              >
                <motion.h2
                  className="text-lg font-semibold text-gray-300 mb-6 pb-2 border-b border-gray-700 flex items-center"
                  variants={itemVariants}
                >
                  <Phone className="w-5 h-5 mr-2 text-gray-500" />
                  Contact Details
                </motion.h2>
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Phone Number*
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-colors ${
                          editMode
                            ? "border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            : "border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                    {editMode && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Address*
                    </label>
                    <div className="relative">
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        readOnly={!editMode}
                        rows={3}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition-colors ${
                          editMode
                            ? "border-gray-600 bg-gray-700 text-gray-200 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            : "border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                      <MapPin className="absolute left-3 top-4 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Additional Info Section */}
              <motion.div
                variants={sectionVariants}
                className="bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-700"
              >
                <motion.h2
                  className="text-lg font-semibold text-gray-300 mb-6 pb-2 border-b border-gray-700 flex items-center"
                  variants={itemVariants}
                >
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  Account Settings
                </motion.h2>
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Account Status
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="Active"
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm border-gray-700 bg-gray-800/50 text-green-400 cursor-not-allowed font-semibold"
                      />
                      <div className="absolute left-3 top-6.5 transform -translate-y-1/2 w-4 h-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Member Since
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>

                  {/* Security Button */}
                  <motion.div variants={itemVariants} className="pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full bg-gray-700 text-gray-300 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Edit / Cancel / Save Buttons */}
            <motion.div
              className="flex sm:justify-end justify-center pt-6 space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {!editMode ? (
                <motion.button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="bg-gray-700 text-gray-200 text-sm font-medium py-2.5 px-6 rounded-2xl hover:bg-gray-600 transition-colors shadow-sm flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-700 text-gray-300 text-sm font-medium py-2.5 px-6 rounded-2xl hover:bg-gray-600 transition-colors shadow-sm flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!hasChanges || submitting}
                    className={`bg-gradient-to-r from-gray-700 to-gray-600 text-white text-sm font-medium py-2.5 px-6 rounded-2xl transition-all shadow-sm flex items-center gap-2 ${
                      !hasChanges || submitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:from-gray-600 hover:to-gray-500"
                    }`}
                    whileHover={
                      !hasChanges || submitting ? {} : { scale: 1.02 }
                    }
                    whileTap={!hasChanges || submitting ? {} : { scale: 0.98 }}
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="h-4 w-4 text-white animate-spin"
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => !changingPassword && setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 rounded-3xl p-6 w-[90%] max-w-md shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6 text-gray-200">
                Change Password
              </h2>

              <div className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${getPasswordStrength(newPassword).color} transition-all duration-300`}
                        style={{
                          width:
                            getPasswordStrength(newPassword).label === "Weak"
                              ? "33%"
                              : getPasswordStrength(newPassword).label ===
                                  "Medium"
                                ? "66%"
                                : "100%",
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Strength: {getPasswordStrength(newPassword).label}
                    </p>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={changingPassword}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-2xl text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-2xl text-sm hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

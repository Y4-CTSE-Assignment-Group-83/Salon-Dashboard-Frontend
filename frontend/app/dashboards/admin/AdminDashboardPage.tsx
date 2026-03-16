"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal, { SweetAlertOptions } from "sweetalert2";
import { toast } from "react-toastify";
import { useAuthContext } from "@/app/context/AuthContext";

import logoImage from "../../../assets/salon.png";

import {
  ChevronLeft,
  Users,
  Scissors,
  Calendar,
  Clock,
  User,
  LogOut,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Inter } from "next/font/google";

// Import Admin Components
import ManageCustomersPage from "@/components/Admin_Dashboard/ManageCustomersPage";
import ManageServicesPage from "@/components/Admin_Dashboard/ManageServicesPage";
import ManageAppointmentsPage from "@/components/Admin_Dashboard/ManageAppointmentsPage";
import ManagePaymentsPage from "@/components/Admin_Dashboard/ManagePaymentsPage";
import ManageStaffPage from "@/components/Admin_Dashboard/ManageStaffPage";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});

/* ===========================
   DateTimeDisplay Component
=========================== */
const DateTimeDisplay = ({
  currentDay,
  currentDate,
  currentTime,
}: {
  currentDay: string;
  currentDate: string;
  currentTime: string;
}) => {
  const abbreviatedDay = currentDay.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center rounded-xl px-3 py-1.5 bg-rose-50/50 dark:bg-rose-950/20"
    >
      {/* Mobile: Abbreviated day and time */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
          {abbreviatedDay}
        </span>
        <div className="w-px h-4 bg-rose-200 dark:bg-rose-800"></div>
        <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
          {currentTime}
        </span>
      </div>

      {/* Desktop: Full date and time */}
      <div className="hidden sm:flex items-center gap-3">
        <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        <div className="w-px h-5 bg-rose-200 dark:bg-rose-800"></div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
            {currentDay}
          </span>
          <span className="text-xs text-rose-600 dark:text-rose-400">
            {currentDate}
          </span>
        </div>
        <div className="w-px h-5 bg-rose-200 dark:bg-rose-800"></div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            {currentTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// User Avatar Component for consistent display
const UserAvatar = ({
  user,
  size = "md",
}: {
  user: { firstname: string; lastname: string } | null;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
  };

  const getInitials = () => {
    if (!user) return <User className="w-5 h-5 md:w-6 md:h-6" />;
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  };

  const getBackgroundColor = () => {
    if (!user) return "bg-rose-200";

    const colors = [
      "bg-rose-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-emerald-500",
      "bg-orange-500",
      "bg-teal-500",
    ];

    const hash = user.firstname.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  };

  if (!user) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center`}
      >
        <User className="w-5 h-5 md:w-6 md:h-6 text-rose-600 dark:text-rose-400" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${getBackgroundColor()} flex items-center justify-center text-white font-medium shadow-lg`}
      style={{ lineHeight: 1 }}
    >
      <span className="flex items-center justify-center w-full h-full">
        {getInitials()}
      </span>
    </div>
  );
};

const AdminDashboardPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout: authLogout } = useAuthContext();

  const activeTab = searchParams.get("tab") ?? "customers";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const mainContentRef = useRef<HTMLElement>(null);

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentDay, setCurrentDay] = useState<string>("");

  /* ======================================================
     Date & Time Updates
  ====================================================== */
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions));

      const dayOptions: Intl.DateTimeFormatOptions = { weekday: "long" };
      setCurrentDay(now.toLocaleDateString("en-US", dayOptions));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ======================================================
     Scroll reset on tab change
  ====================================================== */
  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  /* ======================================================
     Auth Guard
  ====================================================== */
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      if (user.role !== "ADMIN") {
        router.replace("/auth/login");
        return;
      }
    }
  }, [user, authLoading, router]);

  /* ======================================================
     Handle sidebar toggle with animation lock
  ====================================================== */
  const handleSidebarToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setTimeout(() => setIsAnimating(false), 300);
  };

  /* ======================================================
     Logout
  ====================================================== */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Leave so soon?",
      text: "Your admin session will end. Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Stay",
      customClass: {
        popup: "!rounded-3xl font-inter",
        title: "!font-inter !text-rose-800 dark:!text-rose-300",
        container: "!font-inter",
        confirmButton:
          "!rounded-full !px-5 !py-2 !text-sm font-inter !font-semibold",
        cancelButton:
          "!rounded-full !px-5 !py-2 !text-sm font-inter !font-semibold",
      },
      scrollbarPadding: false,
    } as SweetAlertOptions);

    if (result.isConfirmed) {
      try {
        authLogout();
        router.push("/auth/login");
        toast.success("Logged out successfully");
      } catch {
        toast.error("Logout failed. Please try again.");
      }
    }
  };

  const handleTabChange = (tab: string) => {
    router.replace(`?tab=${tab}`);
  };

  const tabParentMap: Record<string, string> = {};

  const tabLabels: Record<string, string> = {
    customers: "Customers",
    services: "Services",
    appointments: "Appointments",
    payments: "Payments",
    staff: "Staff",
  };

  const parentTab = tabParentMap[activeTab] ?? null;

  const navItems = [
    { icon: Users, label: "Customers", tab: "customers" },
    { icon: Scissors, label: "Services", tab: "services" },
    { icon: Calendar, label: "Appointments", tab: "appointments" },
    { icon: CreditCard, label: "Payments", tab: "payments" },
    { icon: Briefcase, label: "Staff", tab: "staff" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "customers":
        return <ManageCustomersPage />;
      case "services":
        return <ManageServicesPage />;
      case "appointments":
        return <ManageAppointmentsPage />;
      case "payments":
        return <ManagePaymentsPage />;
      case "staff":
        return <ManageStaffPage />;
      default:
        return <ManageCustomersPage />;
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950 dark:via-gray-900 dark:to-amber-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-600 dark:text-rose-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950 dark:via-gray-900 dark:to-amber-950 ${inter.className}`}
    >
      {/* ======================================================
         SIDEBAR
      ====================================================== */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? "5rem" : "16rem" }}
        transition={{
          type: "tween",
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="hidden lg:flex flex-col bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-rose-200 dark:border-rose-800/30 shadow-lg sticky top-0 z-40 overflow-hidden"
      >
        {/* ================= LOGO ================= */}
        <div className="p-5 border-b border-rose-100 dark:border-rose-800/30">
          <div className="flex items-center justify-between h-12 relative">
            <motion.div
              className="flex items-center overflow-hidden"
              animate={{
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              }}
            >
              {/* Logo */}
              <motion.div
                animate={{
                  scale: isSidebarCollapsed ? 0.95 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <Image
                  src={logoImage}
                  alt="LUME Salon"
                  width={40}
                  height={40}
                  className="rounded-lg border-2 border-rose-200 dark:border-rose-700 shadow-md"
                />
              </motion.div>

              {/* Text */}
              <motion.div
                animate={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  width: isSidebarCollapsed ? 0 : "auto",
                  x: isSidebarCollapsed ? -20 : 0,
                  marginLeft: isSidebarCollapsed ? 0 : 12,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="leading-tight">
                  <p className="text-xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                    LUME Salon
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Admin Dashboard
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Toggle Button */}
            <motion.button
              onClick={handleSidebarToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute -right-3.5 top-11.5 bg-white dark:bg-gray-800 border border-rose-300 dark:border-rose-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-50"
            >
              <ChevronLeft
                className={`w-4 h-4 text-rose-600 dark:text-rose-400 transition-transform duration-250 ${
                  isSidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </motion.button>
          </div>
        </div>

        {/* ================= DESKTOP TAB NAVIGATION ================= */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label, tab }) => {
            const isActive =
              activeTab === tab || tabParentMap[activeTab] === tab;
            return (
              <motion.div key={tab} initial={false} className="px-1">
                <motion.button
                  onClick={() => handleTabChange(tab)}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full flex items-center rounded-2xl p-3 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50 text-rose-900 dark:text-rose-100 font-medium border border-rose-300 dark:border-rose-700 shadow-md"
                      : "text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-900 dark:hover:text-rose-100 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                  } ${isSidebarCollapsed ? "justify-center" : ""}`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-gradient-to-b from-rose-500 to-amber-500 rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg"
                        : "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                    } ${isSidebarCollapsed ? "" : "mr-3"}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Label */}
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -8,
                      }}
                      transition={{
                        duration: 0.15,
                        ease: "easeOut",
                      }}
                      className="flex-1 min-w-0 text-left overflow-hidden"
                    >
                      <span className="text-sm tracking-wide">{label}</span>
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </nav>

        {/* ================= DESKTOP PROFILE DESIGN ================= */}
        <div className="p-4 border-t border-rose-100 dark:border-rose-800/30">
          <div
            className={`flex ${isSidebarCollapsed ? "justify-center" : "items-start"}`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full p-[3px] bg-gradient-to-br from-rose-400 to-amber-400">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-gray-900">
                  <UserAvatar user={user} size="md" />
                </div>
              </div>
            </div>

            {/* Expanded Profile Details */}
            {!isSidebarCollapsed && user && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 min-w-0 ml-4"
              >
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100 truncate mb-0.5">
                    {user.firstname && user.lastname
                      ? `${user.firstname} ${user.lastname}`.trim()
                      : "Admin"}
                  </h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400 truncate mb-2">
                    {user.email}
                  </p>

                  {/* Role Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50 border border-rose-300 dark:border-rose-700 rounded-full">
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                    <span className="text-xs text-rose-800 dark:text-rose-200">
                      Administrator
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 text-xs font-medium px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ======================================================
         MOBILE AREA
      ====================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-30 border-b border-rose-200 dark:border-rose-800/30">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-3">
              <Image
                src={logoImage}
                alt="LUME Salon"
                width={40}
                height={40}
                className="rounded-lg border border-rose-300 dark:border-rose-700"
              />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                  LUME Salon
                </h1>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Admin Dashboard
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-2.5 rounded-full bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors group"
              aria-label="Toggle menu"
            >
              <div className="relative w-4 h-3.5 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full transition-all duration-300 origin-left ${
                    mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full transition-all duration-300 origin-left ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </header>

        {/* Bottom Sheet Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-t-2xl shadow-2xl z-50 lg:hidden border-t border-rose-200 dark:border-rose-800/30"
              >
                <div className="p-6">
                  {/* Drag handle */}
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-1.5 rounded-full bg-rose-300 dark:bg-rose-700"></div>
                  </div>

                  {/* Profile Section */}
                  {user && (
                    <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50 rounded-2xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-br from-rose-400 to-amber-400">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-gray-900">
                          <UserAvatar user={user} size="sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100 truncate">
                          {user.firstname && user.lastname
                            ? `${user.firstname} ${user.lastname}`.trim()
                            : "Admin"}
                        </h4>
                        <p className="text-xs text-rose-600 dark:text-rose-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Menu items */}
                  <div className="space-y-1">
                    {navItems.map(({ icon: Icon, label, tab }) => {
                      const isActive =
                        activeTab === tab || tabParentMap[activeTab] === tab;

                      return (
                        <motion.div
                          key={tab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay:
                              navItems.findIndex((item) => item.tab === tab) *
                              0.05,
                          }}
                        >
                          <button
                            onClick={() => {
                              handleTabChange(tab);
                              setMobileMenuOpen(false);
                            }}
                            className={`flex items-center w-full gap-4 px-4 py-3 rounded-2xl transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-rose-100 to-amber-100 dark:from-rose-900/50 dark:to-amber-900/50 text-rose-900 dark:text-rose-100 font-bold border border-rose-300 dark:border-rose-700"
                                : "hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                isActive
                                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                                  : "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <span className="font-medium">{label}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse"></div>
                            )}
                          </button>
                        </motion.div>
                      );
                    })}

                    {/* Logout Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navItems.length * 0.05 }}
                      className="pt-2 mt-4 border-t border-rose-200 dark:border-rose-800/30"
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-3 rounded-xl transition-all hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                      >
                        <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                          <LogOut size={20} />
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content with padding for fixed header */}
        <main
          ref={mainContentRef}
          className="flex-1 flex flex-col overflow-hidden mt-16 lg:mt-0"
        >
          {/* Fixed Breadcrumbs Section */}
          <div className="shrink-0">
            <div className="p-3 pl-4 pr-4">
              <div className="flex items-center justify-between">
                {activeTab !== "customers" && (
                  <nav className="text-xs sm:text-sm text-rose-500 dark:text-rose-400">
                    <ol className="flex items-center space-x-2">
                      <li>
                        <button
                          onClick={() => handleTabChange("customers")}
                          className="hover:text-rose-700 dark:hover:text-rose-300"
                        >
                          Dashboard
                        </button>
                      </li>

                      {parentTab && (
                        <>
                          <li>/</li>
                          <li>
                            <button
                              onClick={() => handleTabChange(parentTab)}
                              className="hover:text-rose-700 dark:hover:text-rose-300"
                            >
                              {tabLabels[parentTab]}
                            </button>
                          </li>
                        </>
                      )}

                      <li>/</li>
                      <li className="font-medium text-rose-900 dark:text-rose-100">
                        {tabLabels[activeTab]}
                      </li>
                    </ol>
                  </nav>
                )}

                {activeTab === "customers" && <div />}

                <DateTimeDisplay
                  currentDay={currentDay}
                  currentDate={currentDate}
                  currentTime={currentTime}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pl-6 pr-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

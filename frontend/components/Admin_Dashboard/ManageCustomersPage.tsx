"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuthContext } from "@/app/context/AuthContext";
import { Inter } from "next/font/google";
import Lottie from "lottie-react";
import gemAnimation from "@/public/lottie/salon.json";
import api from "@/lib/axios"; // Import your configured axios instance
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

type CustomerStatus = "ACTIVE" | "INACTIVE" | "ALL";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

type Customer = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CustomerFormState = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  isActive: boolean;
};

const PAGE_SIZES = [5, 10, 20, 50] as const;

const ManageCustomersPage = () => {
  const { user } = useAuthContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // filters/search/pagination
  const [filter, setFilter] = useState<CustomerStatus>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  // modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"EDIT" | "VIEW">("EDIT");
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const safeString = (v: unknown) => (typeof v === "string" ? v : "");

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border border-green-400",
    INACTIVE: "bg-rose-100 text-rose-800 border border-rose-400",
  };

  const statusBadgeStyles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border border-green-400",
    INACTIVE: "bg-rose-100 text-rose-800 border border-rose-400",
  };

  const toggleCardExpand = (customerId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  /* ===========================
     FETCH CUSTOMERS
  =========================== */
  useEffect(() => {
    let mounted = true;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Using the configured axios instance with cookies
        const response = await api.get("/customer-management/getall");

        if (!mounted) return;

        const incomingCustomers: Customer[] = Array.isArray(response.data)
          ? response.data
          : [];

        // sort latest first (by createdAt)
        const sorted = [...incomingCustomers].sort((a, b) => {
          const at = new Date(a.createdAt).getTime();
          const bt = new Date(b.createdAt).getTime();
          return bt - at;
        });

        setCustomers(sorted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customers");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCustomers();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===========================
     FILTER + SEARCH
  =========================== */
  const filteredCustomers = useMemo(() => {
    // First filter by status
    const byStatus =
      filter === "ALL"
        ? customers
        : customers.filter((c) => {
            if (filter === "ACTIVE") return c.isActive === true;
            if (filter === "INACTIVE") return c.isActive === false;
            return true;
          });

    // Then filter by search
    if (!search.trim()) return byStatus;

    const q = search.toLowerCase().trim();
    return byStatus.filter((c) => {
      const name = `${c.firstname} ${c.lastname}`.toLowerCase();
      const email = safeString(c.email).toLowerCase();
      const phone = safeString(c.phone).toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [customers, filter, search]);

  /* ===========================
     PAGINATION
  =========================== */
  const totalPages = useMemo(() => {
    const total = filteredCustomers.length;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [filteredCustomers.length, pageSize]);

  useEffect(() => {
    // when filters/search/pageSize change, reset page to 1
    setPage(1);
  }, [filter, search, pageSize]);

  const pagedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredCustomers.slice(start, end);
  }, [filteredCustomers, page, pageSize]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  /* ===========================
     TOGGLE CUSTOMER STATUS (ACTIVE/INACTIVE)
  =========================== */
  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = !customer.isActive;
    const action = newStatus ? "activate" : "deactivate";

    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} customer?`,
      html: `
        <p><strong>${customer.firstname} ${customer.lastname}</strong></p>
        <p class="text-sm">This customer will be ${action}d.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: newStatus ? "#10b981" : "#e11d48",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "!rounded-3xl",
        confirmButton: "!rounded-full !px-6 !py-2 !text-sm !font-semibold",
        cancelButton: "!rounded-full !px-6 !py-2 !text-sm !font-semibold",
      },
      scrollbarPadding: false,
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/customer-management/update/${customer._id}`, {
        isActive: newStatus,
      });

      toast.success(`Customer ${action}d successfully`);

      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, isActive: newStatus } : c,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} customer`);
    }
  };

  /* ===========================
     VIEW / EDIT / DELETE
  =========================== */
  const openViewModal = (customer: Customer) => {
    setModalMode("VIEW");
    setActiveCustomer(customer);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setModalMode("EDIT");
    setActiveCustomer(customer);
    setIsModalOpen(true);
  };

  const confirmDelete = async (customer: Customer) => {
    const result = await Swal.fire({
      title: "Delete customer?",
      text: `${customer.firstname} ${customer.lastname}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "!rounded-3xl",
        confirmButton: "!rounded-full !px-5 !py-2 !text-sm !font-semibold",
        cancelButton: "!rounded-full !px-5 !py-2 !text-sm !font-semibold",
      },
      scrollbarPadding: false,
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/customer-management/delete/${customer._id}`);

      toast.success("Customer deleted");
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleSaveFromModal = async (payload: CustomerFormState) => {
    if (!activeCustomer) return;

    setSaving(true);

    try {
      const updates = {
        firstname: payload.firstname,
        lastname: payload.lastname,
        phone: payload.phone,
        gender: payload.gender.toLowerCase(),
      };

      const res = await api.put(
        `/customer-management/update/${activeCustomer._id}`,
        updates,
      );

      const updated: Customer | undefined = res?.data?.customer;

      if (!updated) {
        // fallback: patch local
        setCustomers((prev) =>
          prev.map((c) =>
            c._id === activeCustomer._id ? { ...c, ...updates } : c,
          ),
        );
      } else {
        setCustomers((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      }

      toast.success("Customer updated");
      setIsModalOpen(false);
      setActiveCustomer(null);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ===========================
      Loading UI
   =========================== */
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-24 h-24 sm:w-32 sm:h-32 sm:-mt-16 -mt-50"
        >
          <Lottie animationData={gemAnimation} loop />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-4 sm:p-6 ${inter.className}`}>
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-0 sm:mt-0 mt-5">
        <div>
          <h2 className="text-2xl sm:text-4xl text-rose-500 font-bold">
            Customer Management
          </h2>
          <p className="text-sm sm:text-md text-gray-500">
            View and manage all registered customers.
          </p>
        </div>

        <div className="text-sm px-4 py-3 sm:py-2.5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-100 to-amber-100 border border-rose-300 text-rose-800 inline-flex items-center justify-center">
          <span className="font-semibold">Total: {customers.length}</span>
        </div>
      </div>

      {/* Mobile Filter Button - Only visible on mobile */}
      <div className="block sm:hidden px-2">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-rose-300 rounded-2xl text-rose-700"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters & Search</span>
          </div>
          <div className="flex items-center gap-2">
            {(filter !== "ALL" || search) && (
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            )}
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Desktop Filters - Hidden on mobile */}
      <div className="hidden sm:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left side - Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-full text-xs font-medium cursor-pointer transition-all duration-300 ease-in-out transform ${
                filter === s
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold scale-105 shadow-md"
                  : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-300 hover:scale-105 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Right side - Search & Page Size */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative w-full sm:w-[420px]">
            <div className="relative">
              {/* Search Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-500 pointer-events-none">
                <Search className="h-4 w-4" />
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name / email / phone / address"
                className="w-full text-white border bg-rose-50/30 font-medium border-rose-300 rounded-3xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-300 pr-10 pl-10"
              />

              {/* Clear button - only shows when there's text */}
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-500 hover:text-rose-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <select
            className="border border-rose-300 text-rose-800 rounded-2xl px-4 py-2 text-sm bg-white"
            value={pageSize}
            onChange={(e) =>
              setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])
            }
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 sm:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-[-16] left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 sm:hidden"
            >
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1.5 rounded-full bg-rose-300"></div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-rose-900">
                    Filters & Search
                  </h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-full bg-rose-100 border border-rose-300"
                  >
                    <X className="w-4 h-4 text-rose-700" />
                  </button>
                </div>

                {/* Search Input with Clear Button */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-rose-700 mb-1 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rose-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search customers..."
                      className="w-full pl-9 pr-10 text-rose-900 py-2.5 border border-rose-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    />
                    {/* Clear button - only shows when there's text */}
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-500 hover:text-rose-700 transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                  <label className="text-xs font-medium text-rose-700 mb-2 block">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                          filter === s
                            ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                            : "bg-rose-50 text-rose-700 border border-rose-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto bg-white rounded-3xl shadow border border-rose-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-200">
            <tr>
              <th className="px-4 py-3 text-left text-rose-800">Customer</th>
              <th className="px-4 py-3 text-left text-rose-800">Contact</th>
              <th className="px-4 py-3 text-left text-rose-800">Status</th>
              <th className="px-4 py-3 text-left text-rose-800">Joined</th>
              <th className="px-4 py-3 text-right text-rose-800">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pagedCustomers.map((customer) => {
              const joinedDate = new Date(
                customer.createdAt,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <tr
                  key={customer._id}
                  className="border-b last:border-none hover:bg-rose-50/50"
                >
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-rose-700 flex items-center justify-center font-semibold overflow-hidden border border-rose-300">
                        <span className="text-rose-700">
                          {getInitials(customer.firstname, customer.lastname)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold font-md truncate text-rose-900">
                          {customer.firstname} {customer.lastname}
                        </p>
                        <p className="text-sm font-normal text-gray-500 truncate">
                          {customer.gender || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-rose-800">
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customer.phone || "Not Available"}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-2.5 py-3">
                    <span
                      className={`px-3 py-2 rounded-full text-xs font-semibold ${
                        customer.isActive
                          ? "bg-green-100 text-green-800 border border-green-400"
                          : "bg-rose-100 text-rose-800 border border-rose-400"
                      }`}
                    >
                      {customer.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-rose-700">{joinedDate}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openViewModal(customer)}
                      className="px-3 py-2 rounded-3xl border bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors inline-flex items-center space-x-1"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => openEditModal(customer)}
                      className="px-3 py-2 rounded-3xl border bg-rose-100 text-rose-800 text-xs font-medium hover:bg-rose-200 transition-colors inline-flex items-center space-x-1"
                      title="Edit customer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(customer)}
                      className={`px-3 py-2 rounded-3xl text-xs font-medium inline-flex items-center space-x-1 ${
                        customer.isActive
                          ? "bg-orange-200 text-black border border-black hover:bg-orange-200"
                          : "bg-green-100 text-green-800 border border-green-400 hover:bg-green-200"
                      }`}
                      title={customer.isActive ? "Deactivate" : "Activate"}
                    >
                      {customer.isActive ? (
                        <UserX className="w-3.5 h-3.5" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {customer.isActive ? "Deactivate" : "Activate"}
                      </span>
                    </button>

                    <button
                      onClick={() => confirmDelete(customer)}
                      className="px-3 py-2 rounded-3xl bg-gray-900 text-white text-xs font-medium hover:bg-black transition-colors inline-flex items-center space-x-1"
                      title="Delete customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {pagedCustomers.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="py-12 text-center">
                    <div className="inline-block mb-8 mt-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-rose-400 to-amber-400 rotate-45 transform"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-rose-800 mb-2">
                      No Customers Found
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer records will appear here
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t border-rose-200 bg-rose-50/30">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-rose-800">
              {filteredCustomers.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-rose-800">
              {Math.min(page * pageSize, filteredCustomers.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-rose-800">
              {filteredCustomers.length}
            </span>{" "}
            customers
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={page === 1}
              className="px-2 py-1 rounded-lg bg-white border border-rose-300 text-rose-700 text-xs disabled:opacity-50 hover:bg-rose-50"
            >
              Prev
            </button>

            <div className="text-sm text-rose-700">
              Page <span className="font-semibold">{page}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <button
              onClick={goNext}
              disabled={page === totalPages}
              className="px-2 py-1 rounded-lg bg-white border border-rose-300 text-rose-700 text-xs disabled:opacity-50 hover:bg-rose-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View - Only visible on mobile */}
      <div className="block sm:hidden space-y-3 px-2">
        {pagedCustomers.map((customer) => {
          const isExpanded = expandedCards.has(customer._id);
          const joinedDate = new Date(customer.createdAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          );

          return (
            <motion.div
              key={customer._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden"
            >
              {/* Card Header - Always visible */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-rose-700 flex items-center justify-center font-semibold overflow-hidden flex-shrink-0 border border-rose-300">
                      <span className="text-lg">
                        {getInitials(customer.firstname, customer.lastname)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-rose-900 truncate">
                        {customer.firstname} {customer.lastname}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {customer.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            customer.isActive
                              ? "bg-green-100 text-green-800 border border-green-400"
                              : "bg-rose-100 text-rose-800 border border-rose-400"
                          }`}
                        >
                          {customer.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {joinedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleCardExpand(customer._id)}
                    className="p-1.5 rounded-full bg-rose-100 border border-rose-300"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-rose-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-rose-700" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-rose-100"
                  >
                    <div className="p-4 space-y-4">
                      {/* Contact Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-rose-500" />
                          <span className="text-rose-900">
                            {customer.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-rose-500" />
                          <span className="text-rose-900">
                            {customer.phone || "Not Available"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-rose-500" />
                          <span className="text-rose-900">
                            {customer.gender || "Gender not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-rose-500" />
                          <span className="text-rose-900">
                            Joined: {joinedDate}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 overflow-x-auto pb-1">
                        <button
                          onClick={() => openViewModal(customer)}
                          className="flex items-center justify-center
                            w-10 h-10 sm:w-auto sm:h-auto
                            rounded-full sm:rounded-xl
                            sm:px-3 sm:py-2
                            bg-amber-100 border border-amber-400
                            text-amber-800 text-xs font-medium
                            hover:bg-amber-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">View</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(customer)}
                          className="flex items-center justify-center
                          w-10 h-10 sm:w-auto sm:h-auto
                          rounded-full sm:rounded-xl
                          sm:px-3 sm:py-2
                          bg-rose-100 border border-rose-400
                          text-rose-800 text-xs font-medium
                          hover:bg-rose-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </button>

                        {/* Active/deactive buttons */}
                        <button
                          onClick={() => handleToggleStatus(customer)}
                          className={`flex items-center justify-center
                              w-10 h-10 sm:w-auto sm:h-auto
                              rounded-full sm:rounded-xl
                              sm:px-3 sm:py-2
                              text-xs font-medium
                              ${
                                customer.isActive
                                  ? "bg-orange-200 border border-orange-400 text-orange-800 hover:bg-orange-200"
                                  : "bg-green-200 border border-green-400 text-green-800 hover:bg-green-200"
                              }`}
                        >
                          {customer.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}

                          <span className="hidden sm:inline ml-1">
                            {customer.isActive ? "Deactivate" : "Activate"}
                          </span>
                        </button>

                        {/*Delete Button*/}
                        <button
                          onClick={() => confirmDelete(customer)}
                          className="flex items-center justify-center
                            w-10 h-10 sm:w-auto sm:h-auto
                            rounded-full sm:rounded-xl
                            sm:px-3 sm:py-2
                            bg-gray-900 text-white
                            text-xs font-medium
                            hover:bg-black transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Empty State for Mobile */}
        {pagedCustomers.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-rose-200">
            <div className="inline-block mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-rose-800 mb-1">
              No Customers Found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or search
            </p>
          </div>
        )}

        {/* Mobile Pagination */}
        <div className="flex items-center justify-between py-4">
          <p className="text-xs text-gray-500">
            {filteredCustomers.length === 0
              ? "0 customers"
              : `${(page - 1) * pageSize + 1}-${Math.min(
                  page * pageSize,
                  filteredCustomers.length,
                )} of ${filteredCustomers.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-rose-700">
              {page}/{totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Modal (View/Edit) */}
      {isModalOpen && activeCustomer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-3"
          onClick={() => !saving && setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-xl rounded-3xl bg-white shadow-xl border border-rose-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomerModal
              mode={modalMode}
              customer={activeCustomer}
              onClose={() => {
                if (!saving) {
                  setIsModalOpen(false);
                  setActiveCustomer(null);
                }
              }}
              onSave={handleSaveFromModal}
              saving={saving}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageCustomersPage;

/* ===========================
   CUSTOMER MODAL (View/Edit)
=========================== */

interface CustomerModalProps {
  mode: "VIEW" | "EDIT";
  customer: Customer;
  onClose: () => void;
  onSave: (payload: CustomerFormState) => Promise<void>;
  saving: boolean;
}

const CustomerModal = ({
  mode,
  customer,
  onClose,
  onSave,
  saving,
}: CustomerModalProps) => {
  const [form, setForm] = useState<CustomerFormState>({
    firstname: customer?.firstname ?? "",
    lastname: customer?.lastname ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    gender: customer?.gender ?? "",
    isActive: customer?.isActive ?? true,
  });

  const isView = mode === "VIEW";
  const isEdit = mode === "EDIT";

  const updateField = (key: keyof CustomerFormState, value: string) => {
    if (isView) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    if (isView) return true;

    if (!form.firstname.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!form.lastname.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!form.phone.trim()) {
      toast.error("Phone is required");
      return false;
    }
    if (!form.gender.trim()) {
      toast.error("Gender is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Show confirmation modal for EDIT mode
    if (isEdit) {
      const result = await Swal.fire({
        title: "Update Customer Details?",
        html: `
          <p>You are about to update the details for:</p>
          <p class="font-semibold mt-1 text-rose-800">${form.firstname} ${form.lastname}</p>
          <div class="mt-3 p-3 bg-rose-50 rounded-lg text-sm">
            <p class="font-medium mb-1 text-rose-700">Changes will include:</p>
            <ul class="list-disc list-inside space-y-1 text-center font-semibold text-gray-700">
              ${form.firstname !== customer?.firstname ? `<li>First name: ${customer?.firstname} → ${form.firstname}</li>` : ""}
              ${form.lastname !== customer?.lastname ? `<li>Last name: ${customer?.lastname} → ${form.lastname}</li>` : ""}
              ${form.phone !== customer?.phone ? `<li>Phone: ${customer?.phone || "Not set"} → ${form.phone}</li>` : ""}
              ${form.gender !== customer?.gender ? `<li>Gender: ${customer?.gender || "Not set"} → ${form.gender}</li>` : ""}
            </ul>
            <p class="mt-2 text-[11px] text-amber-700 italic">Note: Email cannot be changed.</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Update",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#6b7280",
        customClass: {
          popup: "!rounded-3xl !font-inter",
          title: "!text-lg !font-bold !text-rose-800",
          htmlContainer: "!text-sm !text-gray-700",
          confirmButton: "!rounded-full !px-6 !py-2 !text-sm !font-semibold",
          cancelButton: "!rounded-full !px-6 !py-2 !text-sm !font-semibold",
        },
        scrollbarPadding: false,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    await onSave(form);
  };

  return (
    <motion.div
      initial={{ scale: 0.98, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.95, y: 20, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full max-w-2xl bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-rose-800">
              {isView ? "Customer Details" : "Edit Customer"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isView
                ? "View customer information"
                : "Update customer information"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-2xl text-xs font-medium text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-300 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-4">
          {/* Status Badge for VIEW mode */}
          {isView && (
            <div className="flex justify-start mb-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  customer.isActive
                    ? "bg-green-100 text-green-800 border border-green-400"
                    : "bg-rose-100 text-rose-800 border border-rose-400"
                }`}
              >
                {customer.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          )}

          {/* Row 1: First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-rose-700">
                First name {!isView && <span className="text-red-500">*</span>}
              </label>
              <input
                value={form.firstname}
                onChange={(e) => updateField("firstname", e.target.value)}
                disabled={isView}
                className="w-full px-3 py-2.5 text-sm text-rose-900 border border-rose-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-200 outline-none transition-colors disabled:bg-rose-50 disabled:text-rose-500"
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-rose-700">
                Last name {!isView && <span className="text-red-500">*</span>}
              </label>
              <input
                value={form.lastname}
                onChange={(e) => updateField("lastname", e.target.value)}
                disabled={isView}
                className="w-full px-3 py-2.5 text-sm text-rose-900 border border-rose-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-200 outline-none transition-colors disabled:bg-rose-50 disabled:text-rose-500"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Row 2: Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-rose-700">Email</label>
              <input
                value={form.email}
                disabled={true}
                className="w-full px-3 py-2.5 text-sm text-rose-500 border border-rose-300 rounded-xl bg-rose-50 cursor-not-allowed"
                placeholder="john.doe@example.com"
              />
              {isEdit && (
                <p className="text-[10px] text-gray-500 mt-1">
                  Cannot be changed
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-rose-700">
                Phone {!isView && <span className="text-red-500">*</span>}
              </label>
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                disabled={isView}
                className="w-full px-3 py-2.5 text-sm text-rose-900 border border-rose-300 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-200 outline-none transition-colors disabled:bg-rose-50 disabled:text-rose-500"
                placeholder="+44 7700 900123"
              />
            </div>
          </div>

          {/* Row 3: Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-rose-700">
              Gender {!isView && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
              {["male", "female", "other"].map((g) => (
                <label
                  key={g}
                  className={`
                  flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border cursor-pointer
                  ${
                    form.gender === g
                      ? "border-amber-500 bg-amber-50"
                      : "border-rose-300 bg-white hover:bg-rose-50"
                  }
                  ${isView ? "cursor-default" : ""}
                `}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => updateField("gender", g)}
                    disabled={isView}
                    className="w-3.5 h-3.5 text-amber-500 border-rose-300 focus:ring-0"
                  />
                  <span className="text-xs text-rose-700 capitalize">{g}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-rose-200 bg-rose-50/30">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-medium text-rose-700 bg-white border border-rose-400 hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            {isView ? "Close" : "Cancel"}
          </button>
          {!isView && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:shadow-lg transition-all disabled:opacity-50 min-w-[120px]"
            >
              {saving ? "Saving..." : "Update Customer"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

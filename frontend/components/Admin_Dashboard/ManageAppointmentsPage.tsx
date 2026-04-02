"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Booking {
  _id: string;
  serviceName: string;
  serviceCategory: string;
  servicePrice: number;
  serviceDuration: number;
  appointmentDate: string;
  queueNumber: number;
  status: string;
  customerName: string;
  customerEmail: string;
}

const API_URL =
  "http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com/api/bookings";

export default function ManageAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "confirmed" | "completed" | "canceled"
  >("all");

  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  /* ===========================
     FETCH BOOKINGS
  =========================== */
  const fetchBookings = async () => {
    try {
      const res = await axios.get(API_URL);
      setBookings(res.data?.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ===========================
     CONFIRM BOOKING
  =========================== */
  const handleConfirm = async (id: string) => {
    try {
      setLoadingId(id);

      await axios.patch(`${API_URL}/${id}/status`, {
        status: "CONFIRMED",
      });

      fetchBookings(); // refresh
    } catch (error) {
      console.error("CONFIRM ERROR:", error);
      alert("Failed to confirm booking");
    } finally {
      setLoadingId(null);
    }
  };

  /* ===========================
     FILTER BOOKINGS
  =========================== */
  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.appointmentDate);

    if (activeTab !== "all") {
      return b.status?.toUpperCase() === activeTab.toUpperCase();
    }

    if (searchDate) {
      const selectedDate = new Date(searchDate);

      if (
        bookingDate.getFullYear() !== selectedDate.getFullYear() ||
        bookingDate.getMonth() !== selectedDate.getMonth() ||
        bookingDate.getDate() !== selectedDate.getDate()
      ) {
        return false;
      }
    }

    if (searchTime) {
      const [h, m] = searchTime.split(":").map(Number);

      if (bookingDate.getHours() !== h || bookingDate.getMinutes() !== m) {
        return false;
      }
    }

    return true;
  });

  const tabStyle = (tab: string) =>
    `px-4 py-2 rounded ${activeTab === tab ? "bg-blue-600" : "bg-gray-800"}`;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>

      {/* 🔥 TABS */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setActiveTab("all")} className={tabStyle("all")}>
          All
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={tabStyle("pending")}
        >
          Pending
        </button>

        <button
          onClick={() => setActiveTab("confirmed")}
          className={tabStyle("confirmed")}
        >
          Confirmed
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={tabStyle("completed")}
        >
          Completed
        </button>

        <button
          onClick={() => setActiveTab("canceled")}
          className={tabStyle("canceled")}
        >
          Canceled
        </button>
      </div>

      {/* 🔍 SEARCH (ONLY ALL TAB) */}
      {activeTab === "all" && (
        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg"
          />

          <input
            type="time"
            value={searchTime}
            onChange={(e) => setSearchTime(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg"
          />

          <button
            onClick={() => {
              setSearchDate("");
              setSearchTime("");
            }}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>
      )}

      {/* EMPTY */}
      {filteredBookings.length === 0 && (
        <p className="text-gray-400">No bookings found</p>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:justify-between"
          >
            {/* LEFT */}
            <div>
              <h2 className="text-lg font-semibold">{booking.serviceName}</h2>
              <p className="text-gray-400 text-sm">{booking.serviceCategory}</p>
              <p className="text-xs text-gray-400">
                {new Date(booking.appointmentDate).toLocaleString()}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                👤 {booking.customerName}
              </p>
              <p className="text-xs text-gray-500">
                📧 {booking.customerEmail}
              </p>
            </div>

            {/* MIDDLE */}
            <div className="mt-2 md:mt-0 text-sm">
              <p>💰 Rs. {booking.servicePrice}</p>
              <p>⏱ {booking.serviceDuration} min</p>
              <p>🔢 Queue: {booking.queueNumber}</p>
            </div>

            {/* RIGHT */}
            <div className="mt-2 md:mt-0 flex flex-col items-end gap-2">
              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : booking.status === "CONFIRMED"
                      ? "bg-blue-500/20 text-blue-400"
                      : booking.status === "COMPLETED"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                }`}
              >
                {booking.status}
              </span>

              {/* 🔥 CONFIRM BUTTON (ONLY PENDING TAB) */}
              {activeTab === "pending" && booking.status === "PENDING" && (
                <button
                  onClick={() => handleConfirm(booking._id)}
                  disabled={loadingId === booking._id}
                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                >
                  {loadingId === booking._id ? "Confirming..." : "Confirm"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

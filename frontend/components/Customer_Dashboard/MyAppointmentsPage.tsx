"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "@/app/context/AuthContext";

interface Booking {
  _id: string;
  serviceName: string;
  serviceCategory: string;
  servicePrice: number;
  serviceDuration: number;
  appointmentDate: string;
  queueNumber: number;
  status: string;
  customerEmail: string;
}

const API_URL =
  "http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com//bookings";

export default function MyAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED"
  >("PENDING");

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");

  const { user, loading } = useAuthContext();

  /* ===========================
     FETCH BOOKINGS
  =========================== */
  const fetchBookings = useCallback(async () => {
    if (!user?.email) return;

    try {
      const res = await axios.get(API_URL);

      const allBookings = res.data?.data || [];

      const userBookings = allBookings.filter(
        (b: Booking) => b.customerEmail === user.email,
      );

      setBookings(userBookings);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setBookings([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;

    const loadBookings = async () => {
      try {
        const res = await axios.get(API_URL);

        const allBookings = res.data?.data || [];

        const userBookings = allBookings.filter(
          (b: Booking) => b.customerEmail === user.email,
        );

        setBookings(userBookings);
      } catch (error) {
        console.error("FETCH ERROR:", error);
        setBookings([]);
      }
    };

    loadBookings();
  }, [user]);

  /* ===========================
     CANCEL BOOKING
  =========================== */
  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;

    try {
      await axios.patch(`${API_URL}/${id}/status`, {
        status: "CANCELED",
      });

      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Cancel failed ❌");
    }
  };

  /* ===========================
     UPDATE BOOKING (DATE ONLY)
  =========================== */
  const handleUpdate = async () => {
    if (!editingBooking) return;

    try {
      await axios.patch(`${API_URL}/${editingBooking._id}/update`, {
        appointmentDate: newDate,
      });

      alert("Updated successfully ✅");
      setEditingBooking(null);
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Update failed ❌");
    }
  };

  /* ===========================
     FILTER BY TAB
  =========================== */
  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  const tabStyle = (tab: string) =>
    `px-4 py-2 rounded ${activeTab === tab ? "bg-blue-600" : "bg-gray-800"}`;

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      {/* 🔥 TABS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={tabStyle("PENDING")}
        >
          Pending
        </button>

        <button
          onClick={() => setActiveTab("CONFIRMED")}
          className={tabStyle("CONFIRMED")}
        >
          Confirmed
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={tabStyle("COMPLETED")}
        >
          Completed
        </button>

        <button
          onClick={() => setActiveTab("CANCELED")}
          className={tabStyle("CANCELED")}
        >
          Canceled
        </button>
      </div>

      {/* EMPTY */}
      {filteredBookings.length === 0 && (
        <p className="text-gray-400">No bookings found</p>
      )}

      {/* 🔥 LIST */}
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

              {/* 🔥 ACTIONS ONLY FOR PENDING */}
              {activeTab === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBooking(booking);
                      setNewDate(
                        new Date(booking.appointmentDate)
                          .toISOString()
                          .slice(0, 16),
                      );
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 rounded"
                  >
                    Update
                  </button>

                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="px-3 py-1 text-xs bg-red-600 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 UPDATE MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-lg mb-4">Update Booking</h2>

            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingBooking(null)}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg-blue-600 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

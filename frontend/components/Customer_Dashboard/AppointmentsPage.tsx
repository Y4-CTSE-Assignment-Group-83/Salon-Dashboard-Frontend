"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuthContext } from "@/app/context/AuthContext";

export default function AppointmentsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuthContext();

  const serviceId = params.get("serviceId");
  const serviceName = params.get("name");
  const servicePrice = params.get("price");
  const serviceDuration = params.get("duration");
  const serviceCategory = params.get("category");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    appointmentDate: "",
    notes: "",
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🔥 AUTO FILL USER
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: user.firstname + " " + user.lastname,
        customerEmail: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!user) {
      alert("User not logged in ❌");
      return;
    }

    // 🔥 TIME VALIDATION
    const selectedDate = new Date(form.appointmentDate);
    const hours = selectedDate.getHours();

    if (hours < 9 || hours >= 20) {
      alert("Booking allowed only between 9AM - 8PM ❌");
      return;
    }

    try {
      setLoadingSubmit(true);

      const payload = {
        ...form,
        serviceId,
        serviceName,
        serviceCategory,
        servicePrice: Number(servicePrice),
        serviceDuration: Number(serviceDuration),
      };

      console.log("PAYLOAD:", payload);

      await axios.post("http://localhost:4000/api/bookings", payload);

      alert("Booking Created ✅");

      router.push("/dashboards/customer?tab=my_appointments");

    } catch (error) {
      console.error(error);
      alert("Booking Failed ❌");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Booking</h1>

      {/* SERVICE DETAILS */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800">
        <h2>{serviceName}</h2>
        <p className="text-gray-400">{serviceCategory}</p>
        <p className="text-green-400">Rs. {servicePrice}</p>
        <p>{serviceDuration} minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          required
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />

        <input
          name="customerPhone"
          placeholder="Phone"
          value={form.customerPhone}
          onChange={handleChange}
          required
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />

        {/* AUTO EMAIL */}
        <input
          name="customerEmail"
          value={form.customerEmail}
          readOnly
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        />

        <input
          type="datetime-local"
          name="appointmentDate"
          value={form.appointmentDate}
          onChange={handleChange}
          required
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />

        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
        />

        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full bg-blue-600 py-2 rounded"
        >
          {loadingSubmit ? "Creating..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
}
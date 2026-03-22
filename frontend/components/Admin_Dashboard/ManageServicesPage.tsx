"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  image?: string;
}

const API_URL = "http://localhost:4000/api/services";

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    duration: "",
    description: "",
    image: null as File | null,
  });

  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);

      setServices(res.data?.data || []); // ✅ SAFE
    } catch (error) {
      console.error(error);
      setServices([]); // ✅ prevent crash
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value as any);
    });

    if (editingService) {
      await axios.put(`${API_URL}/${editingService._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    setShowModal(false);
    setEditingService(null);
    setForm({
      name: "",
      category: "",
      price: "",
      duration: "",
      description: "",
      image: null,
    });

    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this service?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchServices();
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category,
      price: String(service.price),
      duration: String(service.duration),
      description: service.description,
      image: null,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Services</h1>

      {/* Top Controls */}
      <div className="flex justify-between mb-6">
        <input
          type="text"
          placeholder="Search services..."
          className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg w-1/3 text-white focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => {
            setEditingService(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium"
        >
          + Add Service
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-300 text-sm uppercase">
            <tr>
              {/* <th className="p-4">Image</th> */}
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.map((service) => (
              <tr
                key={service._id}
                className="border-t border-gray-800 hover:bg-gray-800 transition"
              >
                {/* <td className="p-4">
                  <img
                    src={
                      service.image
                        ? `http://localhost:5001${service.image}`
                        : "/placeholder.png"
                    }
                    className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                  />
                </td> */}

                <td className="p-4 font-medium">{service.name}</td>
                <td className="p-4 text-gray-400">{service.category}</td>
                <td className="p-4 text-green-400">Rs. {service.price}</td>
                <td className="p-4">{service.duration} min</td>

                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-md text-black font-medium"
                  >
                    Update
                  </button>

                  <button
                    onClick={() => handleDelete(service._id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  No services found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-[420px] border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold">
              {editingService ? "Update Service" : "Add Service"}
            </h2>

            <input
              name="name"
              placeholder="Service Name"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="category"
              placeholder="Category"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={form.category}
              onChange={handleChange}
            />

            <input
              name="price"
              placeholder="Price"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="duration"
              placeholder="Duration"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={form.duration}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Description"
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              value={form.description}
              onChange={handleChange}
            />

            <input type="file" onChange={handleChange} />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
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

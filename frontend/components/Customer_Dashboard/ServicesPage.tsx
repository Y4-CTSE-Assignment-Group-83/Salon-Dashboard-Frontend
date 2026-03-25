// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// interface Service {
//   _id: string;
//   name: string;
//   category: string;
//   price: number;
//   duration: number;
//   description: string;
//   image?: string;
// }

// const API_URL = "http://localhost:4000/api/services";

// export default function ServicesPage() {
//   const [services, setServices] = useState<Service[]>([]);
//   const [search, setSearch] = useState("");

//   //  Fetch services
//   const fetchServices = async () => {
//     try {
//       const res = await axios.get(API_URL);

//       console.log("API RESPONSE:", res.data);

//       setServices(res.data?.data || []);
//     } catch (error) {
//       console.error("FETCH ERROR:", error);
//       setServices([]);
//     }
//   };

//   useEffect(() => {
//     fetchServices();
//   }, []);

//   //  Search filter
//   const filteredServices = services.filter((s) =>
//     s.name.toLowerCase().includes(search.toLowerCase()),
//   );

//   // Book button handler
//   const handleBook = (service: Service) => {
//     console.log("Booking:", service);
//     alert(`Booking ${service.name}`);
//   };

//   return (
//     <div className="p-6 text-white">
//       <h1 className="text-3xl font-bold mb-6">Available Services</h1>

//       {/*  Search */}
//       <div className="mb-6">
//         <input
//           type="text"
//           placeholder="Search services..."
//           className="w-full md:w-1/3 bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg focus:outline-none"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/*  Services Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {filteredServices.map((service) => {
//           console.log("SERVICE:", service); //

//           const imageUrl = service.image
//             ? encodeURI(`http://localhost:4000${service.image}?t=${Date.now()}`)
//             : "/placeholder.jpg";

//           console.log("IMAGE URL:", imageUrl); //

//           return (
//             <div
//               key={service._id}
//               className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:scale-[1.02] transition"
//             >
//               {/* Image */}
//               <img
//                 src={imageUrl}
//                 alt={service.name}
//                 onError={(e) => {
//                   console.log("IMAGE FAILED:", imageUrl); //
//                   (e.target as HTMLImageElement).src = "/placeholder.jpg";
//                 }}
//                 className="w-full h-40 object-cover"
//               />

//               {/* Content */}
//               <div className="p-4 space-y-2">
//                 <h2 className="text-lg font-semibold">{service.name}</h2>

//                 <p className="text-gray-400 text-sm">{service.category}</p>

//                 <p className="text-green-400 font-medium">
//                   Rs. {service.price}
//                 </p>

//                 <p className="text-sm text-gray-300">
//                   {service.duration} minutes
//                 </p>

//                 <p className="text-xs text-gray-500 line-clamp-2">
//                   {service.description}
//                 </p>

//                 {/* Button */}
//                 <button
//                   onClick={() => handleBook(service)}
//                   className="w-full mt-3 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition"
//                 >
//                   Book Now
//                 </button>
//               </div>
//             </div>
//           );
//         })}

//         {/* Empty state */}
//         {filteredServices.length === 0 && (
//           <p className="text-gray-400">No services found</p>
//         )}
//       </div>
//     </div>
//   );
// }

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");

  // 🔄 Fetch services
  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("API RESPONSE:", res.data);
      setServices(res.data?.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setServices([]);
    }
  };

  // ✅ FIXED useEffect
  useEffect(() => {
    const load = async () => {
      await fetchServices();
    };
    load();
  }, []);

  // 🔍 Search filter
  const filteredServices = services.filter((s: Service) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleBook = (service: Service) => {
    console.log("Booking:", service);
    alert(`Booking ${service.name}`);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Available Services</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search services..."
          className="w-full md:w-1/3 bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredServices.map((service: Service) => {
          const imageUrl = service.image
            ? encodeURI(`http://localhost:4000${service.image}`)
            : "/placeholder.jpg";

          return (
            <div
              key={service._id}
              className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:scale-[1.02] transition"
            >
              <img
                src={imageUrl}
                alt={service.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                }}
                className="w-full h-40 object-cover"
              />

              <div className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <p className="text-gray-400 text-sm">{service.category}</p>
                <p className="text-green-400 font-medium">
                  Rs. {service.price}
                </p>
                <p className="text-sm text-gray-300">
                  {service.duration} minutes
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {service.description}
                </p>

                <button
                  onClick={() => handleBook(service)}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <p className="text-gray-400">No services found</p>
        )}
      </div>
    </div>
  );
}

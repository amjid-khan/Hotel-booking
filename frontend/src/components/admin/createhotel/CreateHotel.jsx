// src/components/admin/createhotel/CreateHotel.jsx
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function CreateHotel() {
  const { user, login, fetchHotels } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    phone: "",
    email: "",
    starRating: "",
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const forceCreate = new URLSearchParams(location.search).get("new") === "true";

  useEffect(() => {
    const checkHotel = async () => {
      try {
        const token = user?.token || localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
        const res = await axios.get(`${BASE_URL}/api/hotels/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.hasHotel && !forceCreate) {
          navigate(`/admin/hotel/${res.data.hotelId}`, { replace: true });
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Error checking hotel:", err);
        alert("Error checking hotel status. Redirecting to dashboard.");
        navigate("/admin");
      }
    };
    checkHotel();
  }, [user, navigate, forceCreate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        navigate("/login");
        return;
      }
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const res = await axios.post(`${BASE_URL}/api/hotels/create`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newHotel = res.data.hotel;
      login({ ...user, hotelId: newHotel.id }, token);
      fetchHotels?.();

      // Keep loader visible for 2 seconds
      setTimeout(() => {
        navigate(`/admin/hotel/${newHotel.id}`, { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error creating hotel:", err);
      alert(err?.response?.data?.message || "Error creating hotel");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Checking hotel status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-4 sm:py-6">
      <div className="w-full max-w-3xl">
        {/* Success Loader Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Your Hotel</h3>
              <p className="text-gray-600 mb-4">Setting up your property...</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
              Create Your Hotel
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
              Provide basic details to register your property and start managing your hotel business
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Name & Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Enter hotel name"
                  required
                  className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="hotel@example.com"
                  required
                  className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Enter full street address"
                required
                className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* City, State, Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["city", "state", "country"].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)} *
                  </label>
                  <input
                    name={field}
                    value={form[field]}
                    onChange={onChange}
                    placeholder={field}
                    required
                    className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Zip & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "zip", label: "Zip Code *", placeholder: "12345" },
                { name: "phone", label: "Phone Number *", placeholder: "+1 (555) 123-4567" }
              ].map((f, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={onChange}
                    placeholder={f.placeholder}
                    required
                    className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating *</label>
              <select
                name="starRating"
                value={form.starRating}
                onChange={onChange}
                required
                className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select star rating</option>
                {[1,2,3,4,5].map((star) => (
                  <option key={star} value={star}>
                    {"⭐".repeat(star)} {star} Star{star>1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Describe your hotel's amenities..."
                rows={3}
                required
                className="border border-gray-300 rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Hotel...
                  </span>
                ) : (
                  "Create Hotel"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

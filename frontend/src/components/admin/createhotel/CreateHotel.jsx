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
      alert("Hotel created successfully!");
      navigate(`/admin/hotel/${newHotel.id}`, { replace: true });
    } catch (err) {
      console.error("Error creating hotel:", err);
      alert(err?.response?.data?.message || "Error creating hotel");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Checking hotel status...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
          Create Your Hotel
        </h2>
        <p className="text-gray-500 mb-4 text-center text-sm">
          Provide basic details to register your property.
        </p>

        <form className="space-y-2" onSubmit={onSubmit}>
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Hotel Name"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Hotel Email"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Address */}
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="Street Address"
            required
            className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          />

          {/* City, State, Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              name="city"
              value={form.city}
              onChange={onChange}
              placeholder="City"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              name="state"
              value={form.state}
              onChange={onChange}
              placeholder="State"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              name="country"
              value={form.country}
              onChange={onChange}
              placeholder="Country"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Zip & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              name="zip"
              value={form.zip}
              onChange={onChange}
              placeholder="Zip Code"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Phone Number"
              required
              className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Star Rating */}
          <input
            name="starRating"
            value={form.starRating}
            onChange={onChange}
            placeholder="Star Rating (1-5)"
            type="number"
            min="1"
            max="5"
            required
            className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          />

          {/* Description */}
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Short description of your hotel..."
            rows={3}
            required
            className="border rounded-lg p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 transition resize-none"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
          >
            {loading ? "Creating..." : "Create Hotel"}
          </button>
        </form>
      </div>
    </div>
  );
}

// src/components/admin/createhotel/CreateHotel.jsx
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateHotel.css";

export default function CreateHotel() {
  const { user, login, fetchHotels } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: "", address: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Query param "new=true" indicates admin wants to create additional hotel
  const forceCreate = new URLSearchParams(location.search).get("new") === "true";

  // ------------------- Step 1: Check if admin already has hotels -------------------
  useEffect(() => {
    const checkHotel = async () => {
      try {
        const token = user?.token || localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Vite-compatible env variable
        const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

        const res = await axios.get(`${BASE_URL}/api/hotels/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.hasHotel && !forceCreate) {
          // Admin already has hotel(s) → redirect to first hotel's dashboard
          navigate(`/admin/hotel/${res.data.hotelId}`, { replace: true });
        } else {
          // Show create hotel form
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

  // ------------------- Input handler -------------------
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ------------------- Submit handler -------------------
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
      console.log("Created hotel response:", res.data.hotel);

      const newHotel = res.data.hotel;

      // ------------------- Step 2: Update AuthContext -------------------
      login({ ...user, hotelId: newHotel.id }, token);

      // Refresh admin hotels (for navbar)
      fetchHotels?.();

      alert("Hotel created successfully!");

      // ------------------- Step 3: Redirect to new hotel's dashboard -------------------
      navigate(`/admin/hotel/${newHotel.id}`, { replace: true });
    } catch (err) {
      console.error("Error creating hotel:", err);
      alert(err?.response?.data?.message || "Error creating hotel");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Step 4: Loading state while checking -------------------
  if (checking) return <div>Checking hotel status...</div>;

  // ------------------- Step 5: Render create hotel form -------------------
  return (
    <div className="ch-card">
      <h2>Create Your Hotel</h2>
      <p className="ch-sub">Tell us a bit about your property to get started.</p>

      <form className="ch-form" onSubmit={onSubmit}>
        <label>
          Hotel Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="e.g., Oceanview Resort"
            required
          />
        </label>

        <label>
          Address
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="Street, City, Country"
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Short description of your hotel..."
            rows={5}
            required
          />
        </label>

        <button type="submit" className="ch-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Hotel"}
        </button>
      </form>
    </div>
  );
}

// src/components/admin/createhotel/CreateHotel.jsx
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./CreateHotel.css";

export default function CreateHotel() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", address: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // ---- Step 1: Check if admin already has a hotel ----
  useEffect(() => {
    const checkHotel = async () => {
      try {
        const token = user?.token || localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/hotels/check", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.hasHotel) {
          navigate("/admin"); // Already has hotel → redirect to dashboard
        } else {
          setChecking(false); // Show form
        }
      } catch (err) {
        console.error("Error checking hotel:", err);
        alert("Error checking hotel status. Redirecting to dashboard.");
        navigate("/admin");
      }
    };

    checkHotel();
  }, [user, navigate]);

  // ---- Form input handler ----
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ---- Form submit handler ----
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

      const res = await axios.post(
        "http://localhost:5000/api/hotels/create",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newHotel = res.data.hotel;

      // Update AuthContext with new hotelId
      login({ ...user, hotelId: newHotel.id }, token);

      alert("Hotel created successfully!");
      navigate("/admin"); // Redirect to dashboard
    } catch (err) {
      console.error("Error creating hotel:", err);
      alert(err?.response?.data?.message || "Error creating hotel");
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 2: Show loading while checking ----
  if (checking) return <div>Checking hotel status...</div>;

  // ---- Step 3: Show form only if no hotel exists ----
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

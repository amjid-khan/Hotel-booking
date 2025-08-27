// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // ---------------- Restore user + token ----------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // ---------------- Fetch rooms ----------------
  const fetchRooms = useCallback(async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/rooms?hotelId=${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(Array.isArray(res.data) ? res.data : res.data.rooms || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    }
  }, [token]);

  // ---------------- Fetch hotel users ----------------
  const fetchUsers = useCallback(async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/users?hotelId=${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  }, [token]);

  // ---------------- Create user ----------------
  const createUser = async (userData) => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("full_name", userData.full_name);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("role", userData.role);
      formData.append("status", userData.status || "active");
      formData.append("hotelId", userData.hotelId || "");
      if (userData.phone) formData.append("phone", userData.phone);
      if (userData.profile_image) formData.append("profile_image", userData.profile_image);

      const res = await axios.post(`${BASE_URL}/api/auth/register`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (userData.hotelId) fetchUsers(userData.hotelId);
      return res.data;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  };

  // ---------------- Update user ----------------
  const updateUser = async (userId, userData) => {
    if (!token || !userId) return;
    try {
      const formData = new FormData();
      formData.append("full_name", userData.full_name);
      formData.append("email", userData.email);
      if (userData.password) formData.append("password", userData.password);
      formData.append("role", userData.role);
      formData.append("status", userData.status || "active");
      if (userData.phone) formData.append("phone", userData.phone);
      if (userData.profile_image) formData.append("profile_image", userData.profile_image);
      if (userData.hotelId) formData.append("hotelId", userData.hotelId);

      const res = await axios.put(`${BASE_URL}/api/auth/hotel-users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (userData.hotelId) fetchUsers(userData.hotelId);
      return res.data;
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  // ---------------- Delete user ----------------
  const deleteUser = async (hotelId, userId) => {
    if (!token || !hotelId || !userId) return;
    try {
      await axios.delete(`${BASE_URL}/api/auth/hotel-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(hotelId);
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  };

  // ---------------- Fetch hotel name / details ----------------
  const fetchHotelName = useCallback(async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotelName(res.data.hotel?.name || "");
    } catch (err) {
      console.error("Error fetching hotel name:", err);
      setHotelName("");
    }
  }, [token]);

  // ---------------- Fetch all hotels ----------------
  const fetchHotels = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/my-hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.hotels || [];
      setHotels(list);
      if (list.length > 0 && !selectedHotelId) setSelectedHotelId(list[0].id);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    }
  }, [token, selectedHotelId]);

  // ---------------- Select hotel ----------------
  const selectHotel = (hotelId) => {
    setSelectedHotelId(hotelId);
    fetchRooms(hotelId);
    fetchUsers(hotelId);
    fetchHotelName(hotelId);
  };

  // ---------------- Auto fetch on login / token ----------------
  useEffect(() => {
    if (token) fetchHotels();
  }, [token, fetchHotels]);

  useEffect(() => {
    if (selectedHotelId) {
      fetchRooms(selectedHotelId);
      fetchUsers(selectedHotelId);
      fetchHotelName(selectedHotelId);
    }
  }, [selectedHotelId, fetchRooms, fetchUsers, fetchHotelName]);

  // ---------------- Login ----------------
  const login = (userData, tokenData) => {
    const updatedUser = {
      id: userData.id,
      full_name: userData.full_name || userData.name,
      email: userData.email,
      role: userData.role,
      hotelId: userData.hotelId || null,
    };
    setUser(updatedUser);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("token", tokenData);

    fetchHotels();
    if (updatedUser.hotelId) selectHotel(updatedUser.hotelId);
  };

  // ---------------- Logout ----------------
  const logout = () => {
    setUser(null);
    setToken(null);
    setRooms([]);
    setUsers([]);
    setHotels([]);
    setSelectedHotelId(null);
    setHotelName("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        rooms,
        fetchRooms,
        users,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        hotelName,
        hotels,
        selectedHotelId,
        selectHotel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

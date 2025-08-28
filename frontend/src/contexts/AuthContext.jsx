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

      // Instant update: Add new user to local state
      if (res.data.user && userData.hotelId === selectedHotelId) {
        setUsers(prev => [...prev, res.data.user]);
      }
      
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

      // Instant update: Update user in local state
      if (res.data.user && userData.hotelId === selectedHotelId) {
        setUsers(prev => prev.map(u => u.id === userId ? res.data.user : u));
      }
      
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
      
      // Instant update: Remove user from local state
      if (hotelId === selectedHotelId) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
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
      const hotelData = res.data.hotel;
      if (hotelData) {
        setHotelName(hotelData.name || "");
        // Update hotels array with fresh data
        setHotels(prev => prev.map(h => h.id === hotelId ? { ...h, ...hotelData } : h));
      }
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
      if (list.length > 0 && !selectedHotelId) {
        setSelectedHotelId(list[0].id);
        setHotelName(list[0].name || "");
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    }
  }, [token, selectedHotelId]);

  // ---------------- Select hotel ----------------
  const selectHotel = (hotelId) => {
    setSelectedHotelId(hotelId);
    const selectedHotel = hotels.find(h => h.id === hotelId);
    if (selectedHotel) {
      setHotelName(selectedHotel.name || "");
    }
    fetchRooms(hotelId);
    fetchUsers(hotelId);
    fetchHotelName(hotelId); // This will ensure latest data
  };

  // ---------------- Update hotel ----------------
  const updateHotel = async (hotelId, hotelData) => {
    if (!token || !hotelId) return;
    try {
      const res = await axios.put(`${BASE_URL}/api/hotels/${hotelId}`, hotelData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      
      if (res.data?.hotel) {
        const updatedHotel = res.data.hotel;
        
        // Instant update: Update hotels array
        setHotels(prev =>
          prev.map(h => (h.id === hotelId ? { ...h, ...updatedHotel } : h))
        );
        
        // Instant update: Update hotelName if current hotel
        if (hotelId === selectedHotelId) {
          setHotelName(updatedHotel.name || "");
        }
      }
      
      return res.data;
    } catch (err) {
      console.error("Error updating hotel:", err);
      throw err;
    }
  };

  // ---------------- Delete hotel ----------------
  const deleteHotel = async (hotelId) => {
    if (!token || !hotelId) return;
    try {
      await axios.delete(`${BASE_URL}/api/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Instant update: Remove hotel from local state
      const remainingHotels = hotels.filter(h => h.id !== hotelId);
      setHotels(remainingHotels);

      if (selectedHotelId === hotelId) {
        // Automatically select another hotel if available
        if (remainingHotels.length > 0) {
          const nextHotel = remainingHotels[0];
          setSelectedHotelId(nextHotel.id);
          setHotelName(nextHotel.name || "");
          fetchRooms(nextHotel.id);
          fetchUsers(nextHotel.id);
        } else {
          setSelectedHotelId(null);
          setHotelName("");
          setRooms([]);
          setUsers([]);
        }
      }
    } catch (err) {
      console.error("Error deleting hotel:", err);
      throw err;
    }
  };

  // ---------------- Add room ----------------
  const addRoom = async (roomData) => {
    if (!token || !selectedHotelId) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/rooms`, 
        { ...roomData, hotelId: selectedHotelId }, 
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      
      // Instant update: Add room to local state
      if (res.data.room) {
        setRooms(prev => [...prev, res.data.room]);
      }
      
      return res.data;
    } catch (err) {
      console.error("Error adding room:", err);
      throw err;
    }
  };

  // ---------------- Update room ----------------
  const updateRoom = async (roomId, roomData) => {
    if (!token || !roomId) return;
    try {
      const res = await axios.put(`${BASE_URL}/api/rooms/${roomId}`, roomData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      
      // Instant update: Update room in local state
      if (res.data.room) {
        setRooms(prev => prev.map(r => r.id === roomId ? res.data.room : r));
      }
      
      return res.data;
    } catch (err) {
      console.error("Error updating room:", err);
      throw err;
    }
  };

  // ---------------- Delete room ----------------
  const deleteRoom = async (roomId) => {
    if (!token || !roomId) return;
    try {
      await axios.delete(`${BASE_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Instant update: Remove room from local state
      setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      console.error("Error deleting room:", err);
      throw err;
    }
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
        addRoom,
        updateRoom,
        deleteRoom,
        users,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        hotelName,
        hotels,
        setHotels,
        selectedHotelId,
        selectHotel,
        updateHotel,
        deleteHotel
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
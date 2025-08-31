// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-hotel scoped
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // Super-admin global
  const [allHotels, setAllHotels] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  // ---------------- Restore saved session ----------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const savedHotel = localStorage.getItem("selectedHotelId");

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);

      if (savedHotel) {
        setSelectedHotelId(savedHotel);
      } else if (parsedUser.hotelId) {
        setSelectedHotelId(parsedUser.hotelId);
      }
    }
    setLoading(false);
  }, []);

  // ---------------- Per-hotel data ----------------
  const fetchRooms = useCallback(async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/rooms?hotelId=${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.rooms || [];
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    }
  }, [token]);

  const fetchUsers = useCallback(async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/users?hotelId=${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  }, [token]);

  const fetchHotelName = useCallback(async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hotelData = res.data.hotel || res.data;
      if (hotelData) {
        setHotelName(hotelData.name || "");
        setHotels(prev =>
          prev.map(h => h.id === hotelId ? { ...h, ...hotelData } : h)
        );
      }
    } catch (err) {
      console.error("Error fetching hotel name:", err);
      setHotelName("");
    }
  }, [token]);

  const fetchHotels = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/my-hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data) ? res.data : res.data.hotels || [];
      setHotels(list);

      if (list.length > 0 && !selectedHotelId) {
        setSelectedHotelId(list[0].id);
        setHotelName(list[0].name || "");
        localStorage.setItem("selectedHotelId", list[0].id);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    }
  }, [token, selectedHotelId]);

  const selectHotel = (hotelId) => {
    if (!hotelId) return;
    setSelectedHotelId(hotelId);
    localStorage.setItem("selectedHotelId", hotelId); 
    const selectedHotel = hotels.find(h => h.id === hotelId);
    if (selectedHotel) setHotelName(selectedHotel.name || "");
    fetchRooms(hotelId);
    fetchUsers(hotelId);
    fetchHotelName(hotelId);
  };

  // ---------------- Authentication ----------------
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

    fetchHotels().then(() => {
      const lastHotel = localStorage.getItem("selectedHotelId") || updatedUser.hotelId;
      if (lastHotel) selectHotel(lastHotel);
      if (updatedUser.role === "user" && lastHotel) {
        navigate(`/hotel/${lastHotel}`);
      }
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRooms([]);
    setUsers([]);
    setHotels([]);
    setAllHotels([]);
    setAllUsers([]);
    setAllRooms([]);
    setSelectedHotelId(null);
    setHotelName("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedHotelId");
  };

  // ---------------- Super-admin global fetches ----------------
  // const fetchAllHotels = useCallback(async () => {
  //   if (!token) return;
  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/hotels`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = Array.isArray(res.data) ? res.data : res.data.hotels || [];
  //     setAllHotels(data);
  //   } catch (err) {
  //     console.error("Error fetching all hotels:", err);
  //     setAllHotels([]);
  //   }
  // }, [token]);

  // const fetchAllUsers = useCallback(async () => {
  //   if (!token) return;
  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/auth/users`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = Array.isArray(res.data) ? res.data : res.data.users || [];
  //     setAllUsers(data);
  //   } catch (err) {
  //     console.error("Error fetching all users:", err);
  //     setAllUsers([]);
  //   }
  // }, [token]);

  // const fetchAllRooms = useCallback(async () => {
  //   if (!token) return;
  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/rooms`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = Array.isArray(res.data) ? res.data : res.data.rooms || [];
  //     setAllRooms(data);
  //   } catch (err) {
  //     console.error("Error fetching all rooms:", err);
  //     setAllRooms([]);
  //   }
  // }, [token]);

  // ---------------- Auto fetch on login ----------------
  useEffect(() => {
    if (token) fetchHotels();
  }, [token, fetchHotels]);

  useEffect(() => {
    if (!selectedHotelId) return;
    fetchRooms(selectedHotelId);
    fetchUsers(selectedHotelId);
    fetchHotelName(selectedHotelId);
  }, [selectedHotelId, fetchRooms, fetchUsers, fetchHotelName]);

  useEffect(() => {
    if (user?.role === "super-admin" && token) {
      fetchAllHotels();
      fetchAllUsers();
      fetchAllRooms();
    }
  }, [user, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,

        // per-hotel
        rooms,
        users,
        hotels,
        hotelName,
        selectedHotelId,
        selectHotel,
        fetchRooms,
        fetchUsers,
        fetchHotels,
        fetchHotelName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

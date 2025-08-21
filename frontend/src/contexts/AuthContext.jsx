import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;  // Env se le rahe hain

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelName, setHotelName] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  // ------------------ Restore user + token ------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // ------------------ Fetch rooms ------------------
  const fetchRooms = useCallback(async (hotelId) => {
    try {
      if (!hotelId) return;
      const res = await axios.get(
        `${BASE_URL}/api/rooms?hotelId=${hotelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    }
  }, [token]);

  // ------------------ Auto fetch when token/user changes ------------------
  useEffect(() => {
    if (token && user?.hotelId) fetchRooms(user.hotelId);
  }, [token, user]);

  // ------------------ Login ------------------
  const login = (userData, tokenData) => {
    const updatedUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      hotelId: userData.hotelId || null,
    };
    setUser(updatedUser);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("token", tokenData);
    fetchUsers();  // <-- Agar ye API call use kar rahe ho toh BASE_URL se lagana padega
  };

  // ------------------ Logout ------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    setRooms([]);
    setUsers([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateHotelName = (name) => setHotelName(name);



  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        hotelName,
        updateHotelName,
        rooms,
        fetchRooms,
        users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

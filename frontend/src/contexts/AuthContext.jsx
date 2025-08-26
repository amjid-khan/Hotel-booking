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
const fetchRooms = useCallback(
  async (hotelId) => {
    if (!hotelId || !token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/rooms?hotelId=${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ensure rooms is always an array
      setRooms(Array.isArray(res.data) ? res.data : res.data.rooms || []);
      console.log("Fetched rooms for hotel", hotelId, res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    }
  },
  [token]
);

  // ---------------- Fetch hotel users ----------------
  const fetchUsers = useCallback(
    async (hotelId) => {
      if (!hotelId || !token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/hotel-users?hotelId=${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
        console.log("Fetched users for hotel", hotelId, res.data.users);
      } catch (err) {
        console.error("Error fetching hotel users:", err);
        setUsers([]);
      }
    },
    [token]
  );

  // ---------------- Fetch hotel name / details ----------------
  const fetchHotelName = useCallback(
    async (hotelId) => {
      if (!hotelId || !token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotelName(res.data.hotel?.name || "");
        console.log("Fetched hotel details:", res.data.hotel);
      } catch (err) {
        console.error("Error fetching hotel name:", err);
        setHotelName("");
      }
    },
    [token]
  );

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
      }
      console.log("Fetched all hotels:", list);
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
    if (token) {
      fetchHotels();
    }
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
      name: userData.name,
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

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

  // --- new states for hotels dropdown ---
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
        const res = await axios.get(
          `${BASE_URL}/api/rooms?hotelId=${hotelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRooms(res.data || []);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setRooms([]);
      }
    },
    [token]
  );

  // ---------------- Fetch hotel users ----------------
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotel-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching hotel users:", err);
      setUsers([]);
    }
  }, [token]);

  // ---------------- Fetch hotel name ----------------
  const fetchHotelName = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.hasHotel) {
        setHotelName(res.data.hotelName);
        if (user && !user.hotelId && res.data.hotelId) {
          const updatedUser = { ...user, hotelId: res.data.hotelId };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        setHotelName("");
      }
    } catch (err) {
      console.error("Error fetching hotel name:", err);
      setHotelName("");
    }
  }, [token, user]);

  // ---------------- Fetch all hotels (NEW) ----------------
  const fetchHotels = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/my-hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.hotels || [];
      setHotels(list);
      if (list.length > 0 && !selectedHotelId) {
        setSelectedHotelId(list[0].id); // default select first hotel
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    }
  }, [token, selectedHotelId]);

  // ---------------- Select hotel (NEW) ----------------
  const selectHotel = (hotelId) => {
    setSelectedHotelId(hotelId);
    fetchRooms(hotelId); // fetch rooms immediately
  };

  // ---------------- Auto fetch ----------------
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchHotelName();
      fetchHotels();
      if (user?.hotelId) {
        fetchRooms(user.hotelId);
      }
    }
  }, [token, user, fetchRooms, fetchUsers, fetchHotelName, fetchHotels]);

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

    fetchUsers();
    fetchHotelName();
    fetchHotels();
    if (updatedUser.hotelId) fetchRooms(updatedUser.hotelId);
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
        hotels, // added
        selectedHotelId, // added
        selectHotel, // added
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

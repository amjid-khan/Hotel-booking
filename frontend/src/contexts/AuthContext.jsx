import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelName, setHotelName] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  // ------------------ Restore user + token from localStorage ------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // ------------------ Fetch rooms by hotelId ------------------
  const fetchRooms = useCallback(async (hotelId) => {
    try {
      if (!hotelId) return;
      const response = await axios.get(
        `http://localhost:5000/api/rooms?hotelId=${hotelId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  }, [token]);

  // ------------------ Fetch all users with role="user" ------------------
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];
      const onlyUsers = list.filter((u) => u.role === "user");
      setUsers(onlyUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  }, [token]);

  // ------------------ Auto-fetch rooms + users whenever token/user changes ------------------
  useEffect(() => {
    if (token && user?.hotelId) {
      fetchRooms(user.hotelId);
    }
    if (token) {
      fetchUsers();
    }
  }, [token, user, fetchRooms, fetchUsers]);

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

    fetchUsers(); // Load user list after login
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

  // ------------------ Create a new user ------------------
  const createUser = async (newUser) => {
    try {
      const payload = {
        ...newUser,
        role: newUser.role || "user",
        hotelId: newUser.hotelId || user?.hotelId || null
      };

      const res = await axios.post("http://localhost:5000/api/auth/register", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => [...prev, res.data.user]);
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  };

  // ------------------ Delete user ------------------
const deleteUser = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  } catch (err) {
    console.error("Error deleting user:", err);
  }
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
        fetchUsers,
        createUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

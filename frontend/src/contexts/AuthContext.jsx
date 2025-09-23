// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-hotel scoped states
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // Bookings
  const [hotelBookings, setHotelBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  // Superadmin scoped states
  const [allHotels, setAllHotels] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const navigationDoneRef = useRef(false);

  // Roles & Permissions
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Superadmin Bookings
  const [allBookings, setAllBookings] = useState([]);

  // ---------------- Restore saved session ----------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const savedHotel = localStorage.getItem("selectedHotelId");

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);

      // ✅ Prioritize saved hotel selection over user's default hotelId
      if (savedHotel) {
        setSelectedHotelId(savedHotel);
      } else if (parsedUser.hotelId) {
        setSelectedHotelId(parsedUser.hotelId);
      }
    }
    setLoading(false);
  }, []);

  // ---------------- Per-hotel data ----------------
  const fetchRooms = useCallback(
    async (hotelId) => {
      if (!token) return;
      try {
        let url;
        if (user?.role === "user") {
          url = `${BASE_URL}/api/rooms/user`;
        } else {
          if (!hotelId) return;
          url = `${BASE_URL}/api/rooms?hotelId=${hotelId}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data.rooms || [];
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setRooms([]);
      }
    },
    [token, user]
  );

  const fetchUsers = useCallback(
    async (hotelId) => {
      if (!hotelId || !token) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/api/auth/users?hotelId=${hotelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = Array.isArray(res.data) ? res.data : res.data.users || [];
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    },
    [token]
  );

  const fetchHotelName = useCallback(
    async (hotelId) => {
      if (!hotelId || !token) return;
      if (user?.role === "user") return;

      try {
        const res = await axios.get(`${BASE_URL}/api/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hotelData = res.data.hotel || res.data;
        if (hotelData) {
          setHotelName(hotelData.name || "");
          setHotels((prev) =>
            prev.map((h) => (h.id === hotelId ? { ...h, ...hotelData } : h))
          );
        }
      } catch (err) {
        console.error("Error fetching hotel name:", err);
        setHotelName("");
      }
    },
    [token, user]
  );

  const fetchHotels = useCallback(async () => {
    if (!token || user?.role === "user") return;

    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/my-hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data) ? res.data : res.data.hotels || [];
      setHotels(list);

      // ✅ Check if we have a saved hotel selection first
      const savedHotelId = localStorage.getItem("selectedHotelId");

      if (list.length > 0) {
        if (savedHotelId && list.find((h) => h.id == savedHotelId)) {
          // ✅ If saved hotel exists in the list, use it
          setSelectedHotelId(savedHotelId);
          const savedHotel = list.find((h) => h.id == savedHotelId);
          setHotelName(savedHotel.name || "");
          console.log(
            "Using saved hotel selection:",
            savedHotelId,
            savedHotel.name
          );
        } else if (!selectedHotelId) {
          // ✅ Only set first hotel if no selection exists
          setSelectedHotelId(list[0].id);
          setHotelName(list[0].name || "");
          localStorage.setItem("selectedHotelId", list[0].id);
          console.log("Set default hotel selection:", list[0].id, list[0].name);
        }
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    }
  }, [token, selectedHotelId, user]);

  const selectHotel = (hotelId) => {
    if (!hotelId) return;
    setSelectedHotelId(hotelId);
    localStorage.setItem("selectedHotelId", hotelId);
    const selectedHotel = hotels.find((h) => h.id === hotelId);
    if (selectedHotel) setHotelName(selectedHotel.name || "");
    fetchRooms(hotelId);
    fetchUsers(hotelId);
    fetchHotelName(hotelId);

    // ALWAYS fetch hotel bookings for ALL users
    fetchHotelBookings(hotelId);

    // ✅ Fetch personal bookings for the selected hotel
    fetchMyBookings(hotelId);
  };

  // ---------------- Superadmin data ----------------
  const fetchAllHotels = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/hotels/superadmin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllHotels(res.data.hotels || []);
    } catch (err) {
      console.error("Error fetching all hotels (superadmin):", err);
      setAllHotels([]);
    }
  };

  const fetchAllUsers = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching all users (superadmin):", err);
      setAllUsers([]);
    }
  };

  // ---------------- Super Admin Hotel Management ----------------
  const updateHotelSuperAdmin = async (hotelId, hotelData) => {
    try {
      await axios.put(
        `${BASE_URL}/api/hotels/superadmin/hotel/${hotelId}`,
        hotelData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAllHotels();
    } catch (err) {
      console.error("Error updating hotel (superadmin):", err);
      throw err;
    }
  };

  const deleteHotelSuperAdmin = async (hotelId) => {
    try {
      await axios.delete(`${BASE_URL}/api/hotels/superadmin/hotel/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllHotels();
    } catch (err) {
      console.error("Error deleting hotel (superadmin):", err);
      throw err;
    }
  };

  const getHotelByIdSuperAdmin = async (hotelId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/hotels/superadmin/hotel/${hotelId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.hotel;
    } catch (err) {
      console.error("Error fetching hotel by ID (superadmin):", err);
      throw err;
    }
  };

  // ---------------- Super Admin User Management ----------------
  const updateUserSuperAdmin = async (id, formData) => {
    try {
      await axios.put(`${BASE_URL}/api/auth/superadmin/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchAllUsers();
    } catch (err) {
      console.error("Error updating user (superadmin):", err);
      throw err;
    }
  };

  const deleteUserSuperAdmin = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/auth/superadmin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllUsers();
    } catch (err) {
      console.error("Error deleting user (superadmin):", err);
      throw err;
    }
  };

  // ---------------- Roles & Permissions ----------------
  const createRole = async (formData) => {
    if (!token) throw new Error("No token found");
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        permissionIds: formData.permissions,
      };

      await axios.post(`${BASE_URL}/api/roles`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchRoles();
    } catch (err) {
      console.error("Error creating role:", err);
      throw err;
    }
  };

  const fetchRoles = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.roles || [];
      setRoles(data.filter((r) => r.name.toLowerCase() !== "superadmin"));
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  }, [token]);

  const fetchPermissions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.permissions && Array.isArray(res.data.permissions)) {
        data = res.data.permissions;
      }

      setPermissions(data);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setPermissions([]);
    }
  }, [token]);

  // ---------------- Authentication ----------------
  const login = (userData, tokenData) => {
    const updatedUser = {
      id: userData.id,
      full_name: userData.full_name || userData.name,
      email: userData.email,
      role: (userData.role || "").toLowerCase(),
      hotelId: userData.hotelId || null,
      permissions: userData.permissions || [],
    };

    setUser(updatedUser);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("token", tokenData);

    fetchHotels().then(() => {
      // ✅ Prioritize localStorage selection over user's default hotelId
      const savedHotelId = localStorage.getItem("selectedHotelId");
      const lastHotel = savedHotelId || updatedUser.hotelId;

      if (lastHotel) {
        selectHotel(lastHotel);
        console.log(
          "Login: Selected hotel:",
          lastHotel,
          savedHotelId ? "(from localStorage)" : "(from user.hotelId)"
        );
      }

      if (updatedUser.role !== "superadmin" && updatedUser.hotelId) {
        fetchHotelName(updatedUser.hotelId);
        fetchRooms(updatedUser.hotelId);
        fetchUsers(updatedUser.hotelId);
        // ✅ Fetch personal bookings for the user's hotel
        fetchMyBookings(updatedUser.hotelId);
      }
    });

    if (updatedUser.role === "superadmin") {
      fetchAllHotels();
      fetchAllUsers();
      fetchRoles();
      fetchPermissions();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRooms([]);
    setUsers([]);
    setHotels([]);
    setSelectedHotelId(null);
    setHotelName("");
    setAllHotels([]);
    setAllUsers([]);
    setRoles([]);
    setPermissions([]);
    setHotelBookings([]);
    setMyBookings([]);
    setAllBookings([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedHotelId");
    navigationDoneRef.current = false;
  };

  // ---------------- User management (per-hotel) ----------------
  const createUser = async (formData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (selectedHotelId) await fetchUsers(selectedHotelId);

      return response.data;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  };

  const updateUser = async (id, formData) => {
    try {
      await axios.put(`${BASE_URL}/api/auth/hotel-users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (selectedHotelId) fetchUsers(selectedHotelId);
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/auth/hotel-users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selectedHotelId) fetchUsers(selectedHotelId);
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  };

  // ---------------- Bookings ----------------
  const fetchHotelBookings = useCallback(
    async (hotelId) => {
      if (!token || !hotelId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/api/bookings/hotel/${hotelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.bookings || [];

        // Extract roomId from room object
        const mappedData = data.map((booking) => ({
          ...booking,
          // Extract roomId from room object
          roomId: booking.room?.id || booking.roomId || null,
          roomName: booking.room
            ? `${booking.room.type} (#${booking.room.roomNumber})`
            : booking.roomName || `Room ${booking.room?.id || "Unknown"}`,
          hotelName: booking.hotelName || "Unknown Hotel",
          guestName: booking.guestName || "N/A",
          status: booking.status || "pending",
        }));

        console.log("Hotel bookings fetched for all users:", mappedData.length);

        setHotelBookings(mappedData);
      } catch (err) {
        console.error("Error fetching hotel bookings:", err);
        setHotelBookings([]);
      }
    },
    [token]
  );

  const fetchMyBookings = useCallback(
    async (hotelId = null) => {
      if (!token) return;

      try {
        // ✅ Build URL with hotelId parameter if provided
        let url = `${BASE_URL}/api/bookings/my`;
        if (hotelId) {
          url += `?hotelId=${hotelId}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.bookings || [];

        // Extract roomId from room object
        const mappedData = data.map((booking) => ({
          ...booking,
          // Extract roomId from room object
          roomId: booking.room?.id || booking.roomId || null,
          roomName: booking.room
            ? `${booking.room.type} (#${booking.room.roomNumber})`
            : booking.roomName || `Room ${booking.room?.id || "Unknown"}`,
          hotelName:
            booking.hotelName ||
            (booking.Hotel ? booking.Hotel.name : null) ||
            "Unknown Hotel",
          guestName: booking.guestName || "N/A",
          status: booking.status || "pending",
        }));

        setMyBookings(mappedData);
        console.log(
          `Fetched ${mappedData.length} bookings for hotel:`,
          hotelId || "all hotels"
        );
      } catch (err) {
        console.error("Error fetching my bookings:", err);
        setMyBookings([]);
      }
    },
    [token]
  );

  const createBooking = async (bookingRequestData) => {
    if (!token) throw new Error("No token found");
    if (!selectedHotelId) throw new Error("No hotel selected");

    try {
      const payload = {
        hotelId: selectedHotelId,
        roomId: bookingRequestData.roomId,
        guestName: bookingRequestData.guestName,
        guestEmail: bookingRequestData.guestEmail,
        guestPhone: bookingRequestData.guestPhone,
        checkIn: bookingRequestData.checkIn,
        checkOut: bookingRequestData.checkOut,
        guests: bookingRequestData.guests || 1,
        totalAmount: bookingRequestData.totalAmount,
      };

      // Create booking via API
      const res = await axios.post(`${BASE_URL}/api/bookings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle response data - could be res.data.booking or res.data directly
      const responseBooking = res.data.booking || res.data;

      // Map roomName & hotelName immediately
      const newBooking = {
        ...responseBooking,
        roomName: responseBooking.Room
          ? `${responseBooking.Room.type} (#${responseBooking.Room.roomNumber})`
          : responseBooking.room
          ? `${responseBooking.room.type} (#${responseBooking.room.roomNumber})`
          : `Room ${responseBooking.roomId}`, // fallback
        hotelName: responseBooking.Hotel
          ? responseBooking.Hotel.name
          : responseBooking.hotel
          ? responseBooking.hotel.name
          : responseBooking.hotelName || "Unknown Hotel", // fallback
      };

      // IMPORTANT: Refresh booking data for ALL users after booking creation
      fetchHotelBookings(selectedHotelId);
      // ✅ Fetch personal bookings for the selected hotel
      fetchMyBookings(selectedHotelId);

      return newBooking;
    } catch (err) {
      console.error("Error creating booking:", err.response || err);
      throw err;
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!token) throw new Error("No token found");
    try {
      await axios.delete(`${BASE_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh list after delete for ALL users
      if (selectedHotelId) {
        fetchHotelBookings(selectedHotelId);
        // ✅ Fetch personal bookings for the selected hotel
        fetchMyBookings(selectedHotelId);
      }
    } catch (err) {
      console.error("Error deleting booking:", err.response || err);
      throw err;
    }
  };

  // Admin: update booking status (pending → confirmed/cancelled)
  const updateBookingStatus = async (bookingId, status) => {
    if (!token) throw new Error("No token found");
    try {
      await axios.put(
        `${BASE_URL}/api/bookings/status/${bookingId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // IMPORTANT: Refresh booking data after status update for ALL users
      if (selectedHotelId) {
        fetchHotelBookings(selectedHotelId);
        // ✅ Fetch personal bookings for the selected hotel
        fetchMyBookings(selectedHotelId);
      }
    } catch (err) {
      console.error("Error updating booking status:", err.response || err);
      throw err;
    }
  };

  // ---------------- Superadmin Bookings ----------------
  const fetchAllBookings = useCallback(async () => {
    if (!token || user?.role !== "superadmin") return;

    try {
      const res = await axios.get(`${BASE_URL}/api/bookings/hotel/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];

      const mappedData = data.map((booking) => ({
        ...booking,
        roomName: booking.room
          ? `${booking.room.type} (#${booking.room.roomNumber})`
          : booking.roomId,
        hotelName: booking.hotelName || "Unknown Hotel",
        guestName: booking.guestName || "N/A",
        status: booking.status || "pending",
      }));

      setAllBookings(mappedData);
    } catch (err) {
      console.error("Error fetching all bookings:", err);
      setAllBookings([]);
    }
  }, [token, user]);

  // ---------------- Auto fetch on login ----------------
  useEffect(() => {
    if (token) {
      fetchHotels();
      fetchRoles();
      fetchPermissions();
    }
  }, [token, fetchHotels, fetchRoles, fetchPermissions]);

  // FIXED: Updated useEffect for selected hotel - fetches booking data for ALL users
  useEffect(() => {
    if (!selectedHotelId || !token) return;

    // Fetch basic hotel data
    fetchRooms(selectedHotelId);
    fetchUsers(selectedHotelId);
    fetchHotelName(selectedHotelId);

    // CRITICAL: Always fetch hotel bookings for ALL users
    fetchHotelBookings(selectedHotelId);

    // Handle navigation for regular users
    if (user?.role === "user" && !navigationDoneRef.current) {
      navigate(`/admin/hotel/${selectedHotelId}`);
      navigationDoneRef.current = true;
    }

    // ✅ Fetch personal bookings for the selected hotel
    fetchMyBookings(selectedHotelId);
  }, [
    selectedHotelId,
    token,
    user,
    navigate,
    fetchRooms,
    fetchUsers,
    fetchHotelName,
    fetchHotelBookings,
    fetchMyBookings,
  ]);

  // Fetch superadmin data when user changes
  useEffect(() => {
    if (user?.role === "superadmin" && token) {
      fetchAllHotels();
      fetchAllUsers();
      fetchRoles();
      fetchPermissions();
      fetchAllBookings();
      fetchRevenue();
    }
  }, [user, token, fetchAllBookings]);

  // Additional useEffect to refresh booking data when user changes
  useEffect(() => {
    if (token && selectedHotelId) {
      // Refresh booking data whenever user or token changes
      fetchHotelBookings(selectedHotelId);
      // ✅ Fetch personal bookings for the selected hotel
      fetchMyBookings(selectedHotelId);
    }
  }, [user, token, selectedHotelId, fetchHotelBookings, fetchMyBookings]);

  // Super Admin revenue
  const [revenue, setRevenue] = useState(null);
  const fetchRevenue = useCallback(async () => {
    if (!token || user?.role !== "superadmin") return;

    try {
      const res = await axios.get(`${BASE_URL}/api/bookings/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // response agar object me ho { revenue: xxx } to handle kar lo
      const data = res.data.revenue !== undefined ? res.data.revenue : res.data;
      setRevenue(data);
    } catch (err) {
      console.error("Error fetching revenue (superadmin):", err);
      setRevenue(null);
    }
  }, [token, user]);

  // Analytics  .....................................................................................

  const [analyticsRevenue, setAnalyticsRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState(null);

  // 🔹 Total revenue (per hotel ya all hotels for superadmin)
  const fetchAnalyticsRevenue = useCallback(
    async (hotelId = null) => {
      if (!token) return;
      try {
        let url = `${BASE_URL}/api/analytics/revenue`;
        if (hotelId) url += `?hotelId=${hotelId}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data.data) ? res.data.data : res.data;
        setAnalyticsRevenue(data);
      } catch (err) {
        console.error("Error fetching analytics revenue:", err);
        setAnalyticsRevenue([]);
      }
    },
    [token]
  );

  // 🔹 Monthly revenue (chart/graph ke liye)
  const fetchMonthlyRevenue = useCallback(
    async (hotelId = null) => {
      if (!token) return;
      try {
        let url = `${BASE_URL}/api/analytics/revenue/monthly`;
        if (hotelId) url += `?hotelId=${hotelId}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data.data) ? res.data.data : res.data;
        setMonthlyRevenue(data);
      } catch (err) {
        console.error("Error fetching monthly revenue:", err);
        setMonthlyRevenue([]);
      }
    },
    [token]
  );

  // 🔹 Occupancy (rooms vs occupied)
  const fetchOccupancy = useCallback(
    async (hotelId = null) => {
      if (!token) return;
      try {
        let url = `${BASE_URL}/api/analytics/occupancy`;
        if (hotelId) url += `?hotelId=${hotelId}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOccupancy(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching occupancy:", err);
        setOccupancy(null);
      }
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,

        // per-hotel data
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

        // bookings
        hotelBookings,
        myBookings,
        fetchHotelBookings,
        fetchMyBookings,
        createBooking,
        cancelBooking,
        updateBookingStatus,

        // user management actions
        createUser,
        updateUser,
        deleteUser,

        // superadmin data
        allHotels,
        allUsers,
        fetchAllHotels,
        fetchAllUsers,
        revenue,
        fetchRevenue,

        // superadmin hotel management
        updateHotelSuperAdmin,
        deleteHotelSuperAdmin,
        getHotelByIdSuperAdmin,

        // superadmin user management
        updateUserSuperAdmin,
        deleteUserSuperAdmin,
        setUser,
        allBookings,
        fetchAllBookings,

        // roles & permissions
        roles,
        permissions,
        fetchRoles,
        fetchPermissions,
        createRole,

        // Analytics
        analyticsRevenue,
        monthlyRevenue,
        occupancy,
        fetchAnalyticsRevenue,
        fetchMonthlyRevenue,
        fetchOccupancy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

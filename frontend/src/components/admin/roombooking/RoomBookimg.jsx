import React, { useContext, useState, useMemo } from "react";
import {
  Bed,
  Users,
  Calendar,
  Search,
  Grid3X3,
  List,
  X,
  CheckCircle,
  User,
  Mail,
  Phone,
  SlidersHorizontal,
  Star,
  MapPin,
  CreditCard,
  Clock,
  Wifi,
  Car,
  Coffee,
  Tv,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";

const RoomBooking = () => {
  const { rooms, hotelName, selectedHotelId, createBooking, hotelBookings, fetchHotelBookings, fetchMyBookings } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  const BASE_URL = import.meta.env?.VITE_BASE_URL || "";

  // Check if a room is available based on bookings
// Replace your isRoomAvailable function with this fixed version:
// Replace your isRoomAvailable function with this detailed debug version temporarily:
// const isRoomAvailable = (roomId, checkInDate = null, checkOutDate = null) => {
//   console.log("=== DETAILED DEBUG ===");
//   console.log("Room ID to check:", roomId, typeof roomId);
//   console.log("All hotel bookings:", hotelBookings);
  
//   if (!hotelBookings || hotelBookings.length === 0) {
//     console.log("No bookings found");
//     return true;
//   }
  
//   // Log each booking's roomId for comparison
//   hotelBookings.forEach((booking, index) => {
//     console.log(`Booking ${index + 1}:`, {
//       id: booking.id,
//       roomId: booking.roomId,
//       roomIdType: typeof booking.roomId,
//       status: booking.status,
//       guestName: booking.guestName,
//       checkIn: booking.checkIn,
//       checkOut: booking.checkOut,
//       matchesRoom: booking.roomId == roomId,
//       strictMatch: booking.roomId === roomId
//     });
//   });
  
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   console.log("Today:", today.toISOString());
  
//   // Check current availability (no specific dates)
//   if (!checkInDate || !checkOutDate) {
//     console.log("Checking current availability for today");
    
//     const conflictingBookings = hotelBookings.filter(booking => {
//       const roomMatch = booking.roomId == roomId;
//       const notCancelled = booking.status !== 'cancelled';
      
//       console.log(`Booking ${booking.id} check:`, {
//         roomMatch,
//         notCancelled,
//         status: booking.status,
//         roomId: booking.roomId,
//         targetRoomId: roomId
//       });
      
//       if (!roomMatch || !notCancelled) return false;
      
//       const checkIn = new Date(booking.checkIn);
//       const checkOut = new Date(booking.checkOut);
//       checkIn.setHours(0, 0, 0, 0);
//       checkOut.setHours(0, 0, 0, 0);
      
//       const isCurrentlyOccupied = checkIn <= today && checkOut > today;
      
//       console.log(`Date check for booking ${booking.id}:`, {
//         checkIn: checkIn.toISOString(),
//         checkOut: checkOut.toISOString(),
//         today: today.toISOString(),
//         checkInBeforeToday: checkIn <= today,
//         checkOutAfterToday: checkOut > today,
//         isCurrentlyOccupied
//       });
      
//       return isCurrentlyOccupied;
//     });
    
//     console.log("Conflicting bookings found:", conflictingBookings.length);
//     const available = conflictingBookings.length === 0;
//     console.log("Room available:", available);
//     return available;
//   }
  
//   // Check for specific dates
//   console.log("Checking for specific dates:", checkInDate, "to", checkOutDate);
  
//   const requestedCheckIn = new Date(checkInDate);
//   const requestedCheckOut = new Date(checkOutDate);
//   requestedCheckIn.setHours(0, 0, 0, 0);
//   requestedCheckOut.setHours(0, 0, 0, 0);
  
//   const conflictingBooking = hotelBookings.find(booking => {
//     if (booking.roomId != roomId || booking.status === 'cancelled') return false;
    
//     const bookingCheckIn = new Date(booking.checkIn);
//     const bookingCheckOut = new Date(booking.checkOut);
//     bookingCheckIn.setHours(0, 0, 0, 0);
//     bookingCheckOut.setHours(0, 0, 0, 0);
    
//     const hasOverlap = (requestedCheckIn < bookingCheckOut) && (requestedCheckOut > bookingCheckIn);
    
//     if (hasOverlap) {
//       console.log("Date conflict found:", {
//         bookingId: booking.id,
//         bookingDates: `${bookingCheckIn.toISOString()} to ${bookingCheckOut.toISOString()}`,
//         requestedDates: `${requestedCheckIn.toISOString()} to ${requestedCheckOut.toISOString()}`
//       });
//     }
    
//     return hasOverlap;
//   });
  
//   const available = !conflictingBooking;
//   console.log("Room available for specific dates:", available);
//   console.log("=== END DEBUG ===");
//   return available;
  //   };
  
  // ✅ Enhanced isRoomAvailable function - now uses backend availability + booking data
const isRoomAvailable = (room, checkInDate = null, checkOutDate = null) => {
  // ✅ First check backend availability status
  if (room.hasActiveBooking === true) {
    return false; // Backend says room has active booking
  }
  
  // ✅ If backend says room is available, double-check with booking data
  if (!hotelBookings || hotelBookings.length === 0) {
    return room.isAvailable !== false; // Use backend status as fallback
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Agar specific dates nahi diye → current availability check
  if (!checkInDate || !checkOutDate) {
    const conflictingBookings = hotelBookings.filter((booking) => {
      const roomMatch = booking.roomId == room.id;
      const isConfirmed = booking.status === "confirmed"; // ✅ Only confirmed bookings
      if (!roomMatch || !isConfirmed) return false;

      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      // Agar aaj ke din already confirm booking hai → room occupied
      return checkIn <= today && checkOut > today;
    });

    return conflictingBookings.length === 0;
  }

  // Agar specific dates diye gaye ho to overlap check karo
  const requestedCheckIn = new Date(checkInDate);
  const requestedCheckOut = new Date(checkOutDate);
  requestedCheckIn.setHours(0, 0, 0, 0);
  requestedCheckOut.setHours(0, 0, 0, 0);

  const conflictingBooking = hotelBookings.find((booking) => {
    if (booking.roomId != room.id || booking.status !== "confirmed") return false; // ✅ only confirmed bookings

    const bookingCheckIn = new Date(booking.checkIn);
    const bookingCheckOut = new Date(booking.checkOut);
    bookingCheckIn.setHours(0, 0, 0, 0);
    bookingCheckOut.setHours(0, 0, 0, 0);

    // Date overlap check
    return (
      requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn
    );
  });

  return !conflictingBooking;
};

  



  const roomPriceRange = useMemo(() => {
    if (!rooms.length) return { min: 0, max: 0 };
    const prices = rooms.map((room) => room.price).filter(Boolean);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [rooms]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesSearch = roomType === "all" || room.type === roomType;
        const matchesText =
          room.type?.toLowerCase().includes(search.toLowerCase()) ||
          room.description?.toLowerCase().includes(search.toLowerCase()) ||
          room.roomNumber?.toString().includes(search);
        const matchesPrice =
          (!priceRange.min || room.price >= Number(priceRange.min)) &&
          (!priceRange.max || room.price <= Number(priceRange.max));
        return matchesSearch && matchesText && matchesPrice;
      }),
    [rooms, search, roomType, priceRange]
  );

  const roomTypes = useMemo(
    () => [...new Set(rooms.map((r) => r.type).filter(Boolean))],
    [rooms]
  );

  const getImageUrl = (room) => {
    const raw = room.image || (room.images && room.images[0]);
    if (!raw) return null;
    if (typeof raw !== "string") return null;
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/")) return `${BASE_URL}${raw}`;
    return `${BASE_URL}/uploads/${raw}`;
  };

  const calculateCost = () => {
    if (!form.checkIn || !form.checkOut || !selectedRoom)
      return { nights: 0, total: 0 };
    const nights = Math.max(
      0,
      Math.ceil(
        (new Date(form.checkOut) - new Date(form.checkIn)) /
          (1000 * 60 * 60 * 24)
      )
    );
    return { nights, total: nights * selectedRoom.price };
  };

  const handleBook = (room) => {
    setSelectedRoom(room);
    setShowBooking(true);
  };

  const submitBooking = async () => {
    const { nights, total } = calculateCost();

    // Validate
    if (nights <= 0 || !form.guestName || !form.guestEmail) {
      alert("Please fill all required fields and select valid dates");
      return;
    }

    if (!selectedRoom) {
      alert("Please select a room to book");
      return;
    }

    // Check room availability for selected dates
    if (!isRoomAvailable(selectedRoom, form.checkIn, form.checkOut)) {
      alert("Sorry, this room is not available for the selected dates. Please choose different dates or another room.");
      return;
    }

    setIsLoading(true);

    try {
      // Call API from AuthContext
      const response = await createBooking({
        roomId: selectedRoom.id,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
        totalAmount: total,
      });

      // Prepare success data
      setSuccessBookingData({
        bookingId: response.booking?.id || response.id || "N/A",
        guestName: form.guestName,
        roomType: selectedRoom.type,
        roomNumber: selectedRoom.roomNumber,
        nights: nights,
        total: total,
        checkIn: form.checkIn,
        checkOut: form.checkOut
      });

      // Force refresh the bookings data to update room availability
      if (selectedHotelId) {
        await fetchHotelBookings(selectedHotelId);
      }
      await fetchMyBookings();

      // Show success modal after delay
      setTimeout(() => {
        setIsLoading(false);
        setShowBooking(false);
        setShowSuccessModal(true);
        
        // Reset form
        setSelectedRoom(null);
        setForm({
          checkIn: "",
          checkOut: "",
          guests: 1,
          guestName: "",
          guestEmail: "",
          guestPhone: "",
        });
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      console.error("Booking failed:", err);
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message || "Booking failed! Please try again.";
      if (code === 'ROOM_UNAVAILABLE') {
        const conflict = err?.response?.data?.conflict;
        const from = conflict?.checkIn ? new Date(conflict.checkIn).toLocaleDateString() : null;
        const to = conflict?.checkOut ? new Date(conflict.checkOut).toLocaleDateString() : null;
        alert(`${message}${from && to ? ` (${from} - ${to})` : ''}`);
      } else {
        alert(message);
      }
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoomType("all");
    setPriceRange({ min: "", max: "" });
  };

  const hasActiveFilters =
    search || roomType !== "all" || priceRange.min || priceRange.max;

  if (!selectedHotelId) {
    return (
      <div className="min-h-screen bg-white md:pl-64 px-4 md:px-8 py-8 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-lg border border-gray-200">
          <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow">
            <Bed className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            No Hotel Selected
          </h2>
          <p className="text-gray-600 text-lg">
            Please select a hotel to view available rooms for booking
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen bg-white md:pl-64 pt-20 md:pt-0 transition-all duration-300 ${(showBooking && isLoading) || showSuccessModal ? 'blur-sm' : ''}`}>
        <div className="px-4 md:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Room Booking</h1>
                <p className="text-gray-600 text-lg mt-1">
                  {hotelName || "Premium Hotel Management"}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white border border-blue-100 text-blue-700 rounded-xl font-semibold shadow">
                  {filteredRooms.length} room
                  {filteredRooms.length !== 1 ? "s" : ""} available
                </div>
                {hasActiveFilters && (
                  <div className="px-4 py-2 bg-orange-100 border border-orange-200 text-orange-700 rounded-xl font-semibold shadow">
                    Filters Active
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition duration-200 ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Smart Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Search Rooms
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search here..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pr-11 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
                  />
                  <Search className="absolute right-4 top-4 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Room Category
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
                >
                  <option value="all">All Categories</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Minimum Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-400 text-sm font-medium">
                    PKR{" "}
                  </span>
                  <input
                    type="number"
                    placeholder={`${roomPriceRange.min}`}
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Maximum Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-400 text-sm font-medium">
                    PKR{" "}
                  </span>
                  <input
                    type="number"
                    placeholder={`${roomPriceRange.max}`}
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Display */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow border border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Bed className="w-20 h-20 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No Rooms Found
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                Try adjusting your filters to see more results
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-shadow"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "flex flex-col gap-6"
              }
            >
              {filteredRooms.map((room) => {
                      const roomAvailable = isRoomAvailable(room);
                return (
                  <div
                    key={room.id}
                    className={`bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex ${
                      viewMode === "list" ? "flex-row" : "flex-col"
                    } ${!roomAvailable ? 'opacity-75' : ''}`}
                  >
                    <div
                      className={`${
                        viewMode === "list" ? "w-80 flex-shrink-0" : "w-full"
                      } h-64 bg-gray-100 relative`}
                    >
                      {getImageUrl(room) ? (
                        <img
                          src={getImageUrl(room)}
                          alt={room.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                          <Bed className="w-20 h-20 text-blue-300" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow text-gray-800 font-semibold text-sm">
                        #{room.roomNumber}
                      </div>
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-lg shadow text-gray-800 font-semibold text-sm">
                        PKR {room.price?.toLocaleString()}
                      </div>
                      {!roomAvailable && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                            Currently Booked
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {room.type}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {room.description ||
                            "Luxurious room with premium amenities"}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-gray-600 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />{" "}
                            {room.capacity || 2} Guests
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4 text-blue-500" /> King Bed
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-500" /> City View
                          </div>
                        </div>
                      </div>
                      {roomAvailable ? (
                        <button
                          onClick={() => handleBook(room)}
                          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                        >
                          Book This Room
                        </button>
                      ) : (
                        <div className="mt-4 w-full">
                          <button
                            disabled
                            className="w-full bg-red-100 text-red-700 py-3 rounded-xl font-semibold cursor-not-allowed border border-red-200"
                          >
                            Currently Booked
                          </button>
                          <p className="text-xs text-red-600 mt-2 text-center">
                            This room has a confirmed booking
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Your Booking</h3>
            <p className="text-gray-600">Please wait while we confirm your reservation...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successBookingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-green-100">Your reservation has been successfully created</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">{successBookingData.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest:</span>
                      <span className="font-medium">{successBookingData.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{successBookingData.roomType} - #{successBookingData.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{new Date(successBookingData.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{new Date(successBookingData.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{successBookingData.nights} night(s)</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-green-600">PKR {successBookingData.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && !isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBooking(false)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Book Your Stay</h2>
                    <p className="text-blue-100 mt-1">
                      {selectedRoom?.type} - Room #{selectedRoom?.roomNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBooking(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Left Side - Room Details */}
                <div className="lg:col-span-1 bg-gray-50 p-6">
                  <div className="sticky top-0">
                    {/* Room Image */}
                    <div className="h-48 bg-gray-100 rounded-xl overflow-hidden mb-6">
                      {getImageUrl(selectedRoom) ? (
                        <img
                          src={getImageUrl(selectedRoom)}
                          alt={selectedRoom?.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                          <Bed className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                    </div>

                    {/* Room Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedRoom?.type}</h3>
                        <p className="text-gray-600 text-sm">{selectedRoom?.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          {selectedRoom?.capacity} Guests
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-blue-500" />
                          King Bed
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            WiFi
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            TV
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            AC
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Room Service
                          </div>
                        </div>
                      </div>

                      {/* Pricing Summary */}
                      {form.checkIn && form.checkOut && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Pricing Summary</h4>
                          {(() => {
                            const { nights, total } = calculateCost();
                            return (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    PKR {selectedRoom?.price?.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}
                                  </span>
                                  <span className="font-medium">PKR {total.toLocaleString()}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total</span>
                                  <span className="text-blue-600">PKR {total.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Booking Form */}
                <div className="lg:col-span-2 p-6">
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Information</h3>
                    
                    <div className="space-y-6">
                      {/* Check-in/Check-out */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Check-in Date *
                          </label>
                          <input
                            type="date"
                            value={form.checkIn}
                            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Check-out Date *
                          </label>
                          <input
                            type="date"
                            value={form.checkOut}
                            onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            min={form.checkIn || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      {/* Date Availability Check */}
                      {form.checkIn && form.checkOut && selectedRoom && (
                        <div className={`p-4 rounded-xl border ${
                          isRoomAvailable(selectedRoom, form.checkIn, form.checkOut)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          {isRoomAvailable(selectedRoom, form.checkIn, form.checkOut) ? (
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">Room is available for selected dates!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-700">
                              <X className="w-5 h-5" />
                              <span className="font-medium">Room is not available for these dates. Please choose different dates.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Guests */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Guests *
                        </label>
                        <select
                          value={form.guests}
                          onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          {Array.from({ length: selectedRoom?.capacity || 4 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} Guest{i > 0 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Guest Information */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-500" />
                          Guest Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              placeholder="Enter full name"
                              value={form.guestName}
                              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              placeholder="Enter email address"
                              value={form.guestEmail}
                              onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              placeholder="Enter phone number"
                              value={form.guestPhone}
                              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                          onClick={() => setShowBooking(false)}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitBooking}
                          disabled={!form.checkIn || !form.checkOut || !isRoomAvailable(selectedRoom, form.checkIn, form.checkOut)}
                          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Confirm Booking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomBooking;
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
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";

const RoomBooking = () => {
  const { rooms, hotelName, selectedHotelId } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;

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
    const img = room.image || (room.images && room.images[0]);
    return img ? (img.startsWith("http") ? img : `${BASE_URL}${img}`) : null;
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

  const submitBooking = () => {
    const { nights, total } = calculateCost();
    if (nights <= 0 || !form.guestName || !form.guestEmail) {
      alert("Please fill all required fields and select valid dates");
      return;
    }
    alert(
      `✅ Booking Confirmed!\n\nGuest: ${form.guestName}\nRoom: ${
        selectedRoom.type
      } - #${selectedRoom.roomNumber}\nDuration: ${nights} night${
        nights > 1 ? "s" : ""
      }\nTotal: ₨ ${total.toLocaleString()}\n\nThank you!`
    );
    setShowBooking(false);
    setForm({
      checkIn: "",
      checkOut: "",
      guests: 1,
      guestName: "",
      guestEmail: "",
      guestPhone: "",
    });
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
    <div className="min-h-screen bg-white md:pl-64 pt-20 md:pt-0">
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
                  ₨{" "}
                </span>
                <input
                  type="number"
                  placeholder={`${roomPriceRange.min}`}
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Maximum Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-400 text-sm font-medium">
                  ₨{" "}
                </span>
                <input
                  type="number"
                  placeholder={`${roomPriceRange.max}`}
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
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
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex ${
                  viewMode === "list" ? "flex-row" : "flex-col"
                }`}
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
                    <div className="w-full h-full flex items-center justify-center">
                      <Bed className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow text-gray-800 font-semibold text-sm">
                    #{room.roomNumber}
                  </div>
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-lg shadow text-gray-800 font-semibold text-sm">
                    ₨ {room.price?.toLocaleString()}
                  </div>
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
                  <button
                    onClick={() => handleBook(room)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    Book This Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomBooking;

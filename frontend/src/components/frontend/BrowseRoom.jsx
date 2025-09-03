import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Calendar, MapPin, Users, Wifi, Car, Coffee, Tv, Bath, Star, Filter, Search, X, Clock, Phone, Mail, CreditCard, ChevronDown, Sliders, SortAsc } from "lucide-react";

const BrowseRoom = () => {
  const { rooms, fetchRooms, selectedHotelId, user, hotelName } = useContext(AuthContext);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [roomType, setRoomType] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    address: "",
    idNumber: "",
    emergencyContact: "",
    emergencyPhone: "",
    paymentMethod: "credit-card",
    specialRequests: "",
    earlyCheckIn: false,
    lateCheckOut: false,
    airport: false,
    breakfast: false
  });

  // Fetch rooms on component mount
  useEffect(() => {
    if (user?.hotelId || selectedHotelId) {
      const hotelId = user?.role === "user" ? user.hotelId : selectedHotelId;
      fetchRooms(hotelId);
    }
  }, [user, selectedHotelId, fetchRooms]);

  // Filter and sort rooms
  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = (!priceRange.min || room.price >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || room.price <= parseFloat(priceRange.max));
      const matchesType = !roomType || room.type === roomType;
      
      return matchesSearch && matchesPrice && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "name": return a.name.localeCompare(b.name);
        case "rating": return 4.8 - 4.5; // Mock rating sort
        default: return 0;
      }
    });

  // Get unique room types for filter
  const roomTypes = [...new Set(rooms.map(room => room.type))];

  // Handle booking
  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setCurrentStep(1);
    setShowBookingModal(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setCurrentStep(1);
    document.body.style.overflow = 'unset'; // Restore scroll
  };

  const handleBookingSubmit = () => {
    console.log("Booking Data:", { room: selectedRoom, booking: bookingData });
    alert("Booking form completed! (UI Only)");
    closeBookingModal();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setRoomType("");
    setSortBy("price-low");
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Calculate total nights and price with dynamic pricing
  const calculateStay = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      // Dynamic pricing based on length of stay
      let roomPrice = selectedRoom?.price || 0;
      if (nights >= 7) roomPrice = roomPrice * 0.9; // 10% discount for weekly stays
      if (nights >= 30) roomPrice = roomPrice * 0.8; // 20% discount for monthly stays
      
      const basePrice = roomPrice * nights * bookingData.rooms;
      const extras = 
        (bookingData.earlyCheckIn ? 25 : 0) +
        (bookingData.lateCheckOut ? 25 : 0) +
        (bookingData.airport ? 50 : 0) +
        (bookingData.breakfast ? 15 * bookingData.guests * nights : 0);
      
      const discount = nights >= 7 ? (selectedRoom?.price * nights * bookingData.rooms - basePrice) : 0;
      
      return { 
        nights, 
        basePrice, 
        extras, 
        discount: Math.abs(discount),
        total: basePrice + extras,
        discountedRate: roomPrice
      };
    }
    return { nights: 0, basePrice: 0, extras: 0, discount: 0, total: 0, discountedRate: selectedRoom?.price || 0 };
  };

  const stayDetails = selectedRoom ? calculateStay() : { nights: 0, basePrice: 0, extras: 0, discount: 0, total: 0, discountedRate: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Browse Rooms
              </h1>
              {hotelName && (
                <p className="mt-2 text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {hotelName}
                </p>
              )}
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                {filteredRooms.length} rooms available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Price Range */}
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 px-3 py-2">
                <span className="text-sm font-medium text-gray-700">Price:</span>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  placeholder="Min"
                  className="w-16 px-2 py-1 text-sm border-0 bg-transparent focus:ring-0"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  placeholder="Max"
                  className="w-16 px-2 py-1 text-sm border-0 bg-transparent focus:ring-0"
                />
              </div>

              {/* Room Type */}
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="px-3 py-2 text-sm bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="rating">Rating: High to Low</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border p-16 max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No rooms found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div key={room.id} className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-500">
                {/* Room Image */}
                <div className="relative h-72 overflow-hidden">
                  {room.image ? (
                   <img
  src={
    room.image 
      ? `${import.meta.env.VITE_BASE_URL}${room.image}` 
      : "/placeholder-room.jpg"
  }
  alt={room.name || `Room ${room.roomNumber}`}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
/>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
                      <svg className="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-800 shadow-lg">
                      {room.type}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-800 ml-1">4.8</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">${room.price}</span>
                        <span className="text-sm text-gray-600">per night</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {room.description || "Experience luxury and comfort in this beautifully designed room with premium amenities and stunning views."}
                  </p>

                  {/* Amenities */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <Wifi className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-700">WiFi</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <Tv className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-700">TV</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <Bath className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-700">Bath</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <Car className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-700">Parking</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookRoom(room)}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-blue-300"
                  >
                    Book Now
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

export default BrowseRoom;
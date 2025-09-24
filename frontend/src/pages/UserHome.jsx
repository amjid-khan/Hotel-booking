import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './UserHome.css';

export default function UserHome() {
  const { user, hotelName, hotels, selectedHotelId, myBookings } = useContext(AuthContext);

  const assignedHotelName = useMemo(() => {
    return (
      hotels.find(h => h.id == (selectedHotelId || user?.hotelId))?.name ||
      hotelName ||
      user?.hotelName ||
      'Your Hotel'
    );
  }, [hotels, selectedHotelId, user, hotelName]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 md:hidden"></div>

      {/* Hero */}
      <div className="user-home-hero text-white px-4 md:px-8 py-10 md:py-14 md:ml-64">
        <div className="max-w-5xl">
          <div className="text-sm opacity-90">LuxStay</div>
          <h1 className="text-2xl md:text-4xl font-bold mt-1">
            Welcome{user?.full_name ? `, ${user.full_name}` : ''}!
          </h1>
          <p className="mt-2 text-white/90">
            You are currently using <span className="font-semibold">{assignedHotelName}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 -mt-6 md:ml-64">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl border user-home-card p-5">
            <div className="text-sm text-gray-500">Assigned Hotel</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{assignedHotelName}</div>
            <div className="text-xs text-gray-500 mt-1">Hotel ID: {selectedHotelId || user?.hotelId || 'N/A'}</div>
          </div>

          <div className="bg-white rounded-xl border user-home-card p-5">
            <div className="text-sm text-gray-500">My Bookings</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{myBookings?.length || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Across your assigned hotel</div>
          </div>

          <div className="bg-white rounded-xl border user-home-card p-5">
            <div className="text-sm text-gray-500">Quick Tips</div>
            <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>Browse rooms and make a booking</li>
              <li>View your booking history</li>
              <li>Update your profile details</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl border user-home-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
          <p className="text-sm text-gray-600 mt-2">
            Use the sidebar to navigate. You can explore rooms, create bookings, and manage your profile.
          </p>
        </div>
      </div>
    </div>
  );
}



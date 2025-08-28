import React, { useContext, useState, useEffect } from "react";
import {
  Edit, Save, AlertTriangle, Star, Phone, Mail, MapPin, Building, Settings, Hash, User, Trash2
} from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";

const Setting = () => {
  const { hotels, selectedHotelId, token, selectHotel } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [editedHotel, setEditedHotel] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const BASE_URL = "http://localhost:5000/api/hotels";

  useEffect(() => {
    if (selectedHotelId && hotels && hotels.length > 0) {
      const currentHotel = hotels.find(h => h.id === selectedHotelId);
      setHotel(currentHotel || null);
      setEditedHotel(currentHotel ? { ...currentHotel } : {});
    }
  }, [selectedHotelId, hotels]);

  if (!hotel) return <div className="p-8 text-gray-600">No hotel selected or available.</div>;

  const fieldGroups = [
    {
      title: "Basic Information",
      icon: Building,
      fields: [
        { key: "name", label: "Hotel Name", icon: Building, type: "text", required: true },
        { key: "email", label: "Email Address", icon: Mail, type: "email", required: true },
        { key: "phone", label: "Phone Number", icon: Phone, type: "tel", required: true },
        { key: "starRating", label: "Star Rating", icon: Star, type: "select", required: true },
      ]
    },
    {
      title: "Address Details",
      icon: MapPin,
      fields: [
        { key: "address", label: "Street Address", icon: MapPin, type: "text", required: true },
        { key: "city", label: "City", icon: Building, type: "text", required: true },
        { key: "state", label: "State/Province", icon: MapPin, type: "text", required: true },
        { key: "country", label: "Country", icon: MapPin, type: "text", required: true },
        { key: "zip", label: "Postal Code", icon: Hash, type: "text", required: true },
      ]
    },
    {
      title: "Additional Information",
      icon: User,
      fields: [
        { key: "description", label: "Hotel Description", icon: Building, type: "textarea", required: false },
      ]
    }
  ];

  const handleInputChange = (key, value) => {
    setEditedHotel(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.required && !editedHotel[field.key]?.toString().trim()) {
          newErrors[field.key] = `${field.label} is required`;
        }
        if (field.type === "email" && editedHotel[field.key]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(editedHotel[field.key])) newErrors[field.key] = "Invalid email";
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setEditedHotel({ ...hotel });
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await axios.put(`${BASE_URL}/${selectedHotelId}`, editedHotel, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local hotel state
      setHotel(prev => ({ ...prev, ...editedHotel }));
      setEditedHotel(prev => ({ ...prev, id: hotel.id }));
      
      // Update hotels array in AuthContext to trigger dashboard refresh
      if (editedHotel.name) {
        // This will update the hotels array and trigger hotelName update in context
        const updatedHotels = hotels.map(h => 
          h.id === selectedHotelId ? { ...h, ...editedHotel } : h
        );
        // Force context update by calling selectHotel which refreshes hotel name
        selectHotel(selectedHotelId);
      }
      
      // Keep loader visible for 2 seconds
      setTimeout(() => {
        setIsEditing(false);
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error updating hotel:", err);
      alert("Error updating hotel. Please check console for details.");
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/${selectedHotelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const remaining = (hotels || []).filter(h => h.id !== selectedHotelId);
      const next = remaining.length > 0 ? remaining[0] : null;

      // Keep loader for 2 seconds
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setIsLoading(false);
        
        if (next) {
          selectHotel(next.id);
        } else {
          setHotel(null);
        }
      }, 2000);
    } catch (err) {
      console.error("Error deleting hotel:", err);
      setTimeout(() => {
        setIsLoading(false);
        setShowDeleteConfirm(false);
      }, 2000);
      alert("Error deleting hotel. Check console for details.");
    }
  };

  const renderStarRating = (rating, editable = false) => {
    const safeRating = Number(rating) || 0;
    if (editable) {
      return (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 cursor-pointer transition-colors ${i < safeRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
              onClick={() => handleInputChange("starRating", i + 1)}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < safeRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="text-sm text-gray-600">({safeRating}/5)</span>
      </div>
    );
  };

  const renderField = (field) => {
    const value = isEditing ? editedHotel[field.key] : hotel[field.key];
    const hasError = errors[field.key];
    const IconComponent = field.icon;

    return (
      <div key={field.key} className={field.type === "textarea" ? "col-span-full" : ""}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <IconComponent className="w-4 h-4 text-gray-500" />
          {field.label}{field.required && <span className="text-red-500">*</span>}
        </label>

        {field.key === "starRating" ? (
          <div className="p-3 border rounded-xl bg-gray-50">{renderStarRating(value, isEditing)}</div>
        ) : field.type === "textarea" ? (
          <textarea
            value={value || ""}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            readOnly={!isEditing}
            rows={4}
            className={`w-full border rounded-xl p-4 transition-all ${isEditing ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white" : "border-gray-200 bg-gray-50 cursor-not-allowed"}`}
          />
        ) : (
          <input
            type={field.type}
            value={value || ""}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            readOnly={!isEditing}
            className={`w-full border rounded-xl p-4 transition-all ${isEditing ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white" : "border-gray-200 bg-gray-50 cursor-not-allowed"}`}
          />
        )}

        {hasError && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Main Content with Blur Effect */}
      <div className={`p-4 sm:p-6 lg:p-8 lg:pl-64 transition-all duration-300 ${isLoading || showDeleteConfirm ? 'blur-sm' : ''}`} 
           style={{ filter: isLoading || showDeleteConfirm ? 'blur(2px)' : 'none' }}>
        {/* Header */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="ml-7 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hotel Settings</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your hotel information and preferences</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            {!isEditing ? (
              <>
                <button 
                  onClick={handleEdit} 
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-medium"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-medium"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={isLoading} 
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-medium"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
                <button 
                  onClick={handleCancel} 
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
          {fieldGroups.map((group, i) => {
            const GroupIcon = group.icon;
            return (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200">
                <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <GroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">{group.title}</h2>
                </div>
                <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {group.fields.map(renderField)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Professional Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center border border-gray-100">
            {/* Modern Animated Loader */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              {/* Main Spinning Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
              {/* Inner Ring */}
              <div className="absolute inset-2 rounded-full border-3 border-transparent border-t-purple-500 animate-spin-slow"></div>
              {/* Center Dot */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
            </div>
            
            {/* Dynamic Loading Text */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800">
                {showDeleteConfirm ? 'Deleting Hotel...' : 'Updating Hotel Information'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {showDeleteConfirm 
                  ? 'Please wait while we delete the hotel from our system...' 
                  : 'Please wait while we save your changes to the database...'
                }
              </p>
            </div>
            
            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 h-full rounded-full animate-progress"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Processing...</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && !isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100">
            <div className="text-center mb-8">
              {/* Warning Icon with Animation */}
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                <AlertTriangle className="w-10 h-10 text-red-600 relative z-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Delete Hotel?</h2>
              <p className="text-gray-600 leading-relaxed">
                Are you absolutely sure you want to delete "<span className="font-semibold text-gray-800">{hotel.name}</span>"? 
                This action cannot be undone and all hotel data will be permanently removed.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Hotel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default Setting;
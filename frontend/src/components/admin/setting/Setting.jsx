import React, { useState } from "react";
import { 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Settings,
  AlertTriangle,
  Check,
  User,
  Hash
} from "lucide-react";

const Setting = () => {
  const [hotel, setHotel] = useState({
    name: "Amjid's Hotel",
    email: "amjid@example.com",
    address: "Street 10, City Center",
    city: "Karachi",
    state: "Sindh",
    country: "Pakistan",
    zip: "75500",
    phone: "+92 300 1234567",
    starRating: 4,
    description: "A modern hotel with excellent services and amenities located in the heart of the city.",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedHotel, setEditedHotel] = useState({ ...hotel });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.required && !editedHotel[field.key]?.toString().trim()) {
          newErrors[field.key] = `${field.label} is required`;
        }
        
        if (field.type === 'email' && editedHotel[field.key]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(editedHotel[field.key])) {
            newErrors[field.key] = 'Please enter a valid email address';
          }
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedHotel({ ...hotel });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setHotel({ ...editedHotel });
      setIsEditing(false);
      setIsLoading(false);
      // You would typically show a success message here
    }, 1000);
  };

  const handleCancel = () => {
    setEditedHotel({ ...hotel });
    setIsEditing(false);
    setErrors({});
  };

  const handleDelete = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Hotel deleted");
      setShowDeleteConfirm(false);
      setIsLoading(false);
      // In a real app, you would redirect or show success message
    }, 1000);
  };

  const handleInputChange = (key, value) => {
    setEditedHotel(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const renderStarRating = (rating, editable = false) => {
    if (editable) {
      return (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 cursor-pointer transition-colors ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
              }`}
              onClick={() => handleInputChange('starRating', i + 1)}
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const renderField = (field) => {
    const IconComponent = field.icon;
    const value = isEditing ? editedHotel[field.key] : hotel[field.key];
    const hasError = errors[field.key];

    return (
      <div key={field.key} className={field.type === 'textarea' ? 'col-span-full' : ''}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <IconComponent className="w-4 h-4 text-gray-500" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        
        {field.key === 'starRating' ? (
          <div className="p-3 border rounded-xl bg-gray-50">
            {renderStarRating(value, isEditing)}
          </div>
        ) : field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            readOnly={!isEditing}
            rows={4}
            placeholder={isEditing ? `Enter ${field.label.toLowerCase()}...` : ''}
            className={`w-full border rounded-xl p-4 transition-all duration-200 resize-none ${
              isEditing
                ? hasError
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            } outline-none`}
          />
        ) : (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            readOnly={!isEditing}
            placeholder={isEditing ? `Enter ${field.label.toLowerCase()}...` : ''}
            className={`w-full border rounded-xl p-4 transition-all duration-200 ${
              isEditing
                ? hasError
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            } outline-none`}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 pl-64">
      {/* Modern Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="ml-7 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Hotel Settings</h1>
              <p className="text-gray-600 mt-1">Manage your hotel information and preferences</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Edit className="w-4 h-4" />
                  Edit Settings
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Hotel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {fieldGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon;
            return (
              <div key={groupIndex} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <GroupIcon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{group.title}</h2>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {group.fields.map(renderField)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Professional Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete Hotel</h3>
                <p className="text-gray-600">This action is permanent</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-red-700">"{hotel.name}"</span>? 
                This will permanently remove all hotel data, reservations, and cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
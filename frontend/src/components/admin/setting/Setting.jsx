import React, { useContext, useState, useEffect } from "react";
import { 
  Edit, Save, X, Trash2, Star, Phone, Mail, MapPin, Building, Settings, AlertTriangle, User, Hash 
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";

const Setting = () => {
  const { hotels, selectedHotelId } = useContext(AuthContext);
  const [hotel, setHotel] = useState(null);
  const [editedHotel, setEditedHotel] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update hotel data whenever selectedHotelId changes
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const currentHotel = hotels.find(h => h.id === selectedHotelId);
      setHotel(currentHotel || null);
      setEditedHotel(currentHotel ? { ...currentHotel } : {});
    }
  }, [selectedHotelId, hotels]);

  if (!hotel) return <div className="p-8 text-gray-600">Loading hotel data...</div>;

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
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.required && !editedHotel[field.key]?.toString().trim()) {
          newErrors[field.key] = `${field.label} is required`;
        }
        if (field.type === 'email' && editedHotel[field.key]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(editedHotel[field.key])) newErrors[field.key] = 'Invalid email';
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedHotel({ ...hotel });
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setIsLoading(true);
    // Simulate API call for demo purposes
    setTimeout(() => {
      setHotel({ ...editedHotel });
      setIsEditing(false);
      setIsLoading(false);
      console.log("Hotel updated:", editedHotel);
    }, 1000);
  };

  const handleDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Hotel deleted:", hotel.name);
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }, 1000);
  };

  const renderStarRating = (rating, editable = false) => {
    if (editable) {
      return (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 cursor-pointer ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
              onClick={() => handleInputChange('starRating', i + 1)}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const renderField = (field) => {
    const value = isEditing ? editedHotel[field.key] : hotel[field.key];
    const hasError = errors[field.key];
    const IconComponent = field.icon;

    return (
      <div key={field.key} className={field.type === 'textarea' ? 'col-span-full' : ''}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <IconComponent className="w-4 h-4 text-gray-500" />
          {field.label}{field.required && <span className="text-red-500">*</span>}
        </label>

        {field.key === 'starRating' ? (
          <div className="p-3 border rounded-xl bg-gray-50">{renderStarRating(value, isEditing)}</div>
        ) : field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            readOnly={!isEditing}
            rows={4}
            placeholder={isEditing ? `Enter ${field.label}` : ''}
            className={`w-full border rounded-xl p-4 ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'} outline-none`}
          />
        ) : (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            readOnly={!isEditing}
            placeholder={isEditing ? `Enter ${field.label}` : ''}
            className={`w-full border rounded-xl p-4 ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' : 'border-gray-200 bg-gray-50 cursor-not-allowed'} outline-none`}
          />
        )}

        {hasError && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{hasError}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pl-64">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="ml-7 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hotel Settings</h1>
            <p className="text-gray-600 mt-1">Manage your hotel information and preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button onClick={handleEdit} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Edit</button>
              <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl">Delete</button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={isLoading} className="px-6 py-3 bg-green-600 text-white rounded-xl">{isLoading ? 'Saving...' : 'Save'}</button>
              <button onClick={handleCancel} className="px-6 py-3 bg-gray-600 text-white rounded-xl">Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8 max-w-6xl mx-auto">
        {fieldGroups.map((group, i) => {
          const GroupIcon = group.icon;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <GroupIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{group.title}</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">{group.fields.map(renderField)}</div>
            </div>
          );
        })}
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete Hotel</h3>
                <p className="text-gray-600">This action is permanent</p>
              </div>
            </div>
            <p className="bg-red-50 border border-red-200 p-4 rounded-xl text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold text-red-700">{hotel.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-3 border rounded-xl text-gray-600">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-3 bg-red-600 text-white rounded-xl">{isLoading ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;

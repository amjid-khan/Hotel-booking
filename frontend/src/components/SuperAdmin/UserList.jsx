import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Eye, Edit2, Trash2, User, Mail, Phone, MapPin, Calendar, Building2, Shield, X, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const UserList = () => {
  const { allUsers, updateUserSuperAdmin, deleteUserSuperAdmin } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    phone: '',
    status: '',
    hotelId: ''
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter out superadmin users
  const filteredUsers = allUsers.filter(user => user.role !== 'superadmin');
  
  // Apply top card filter
  const displayedUsers =
    activeFilter === 'all'
      ? filteredUsers
      : filteredUsers.filter(user => user.role === activeFilter);

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    // Add blur to body content
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    // Remove blur from body content
    document.body.style.overflow = 'unset';
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.name || user.full_name || '',
      email: user.email || '',
      role: user.role || '',
      phone: user.phone || '',
      status: user.status || 'active',
      hotelId: user.hotelId || ''
    });
    setIsEditModalOpen(true);
    // Add blur to body content
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
    setEditFormData({
      full_name: '',
      email: '',
      role: '',
      phone: '',
      status: '',
      hotelId: ''
    });
    // Remove blur from body content
    document.body.style.overflow = 'unset';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('full_name', editFormData.full_name);
      formData.append('email', editFormData.email);
      formData.append('role', editFormData.role);
      formData.append('phone', editFormData.phone);
      formData.append('status', editFormData.status);
      if (editFormData.hotelId) {
        formData.append('hotelId', editFormData.hotelId);
      }

      await updateUserSuperAdmin(selectedUser.id, formData);
      
      // Show success toast
      toast.success('User updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Show loader for 1.5 seconds
      setTimeout(() => {
        setLoading(false);
        closeEditModal();
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

const handleDeleteUser = async (userId) => {
  setLoading(true);

  try {
    await deleteUserSuperAdmin(userId);
    toast.success('User deleted successfully!', {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Failed to delete user. Please try again.', {
      position: "top-right",
      autoClose: 3000,
    });
  } finally {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }
};


  


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Managers': return 'bg-green-100 text-green-800 border-green-200';
      case 'user': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCardClick = (role) => {
    setActiveFilter(role);
  };

  const getHotelName = (user) => {
    return user.hotel_name || user.hotelName || 'Hotel Luxe';
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-100">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
            <p className="text-gray-600 text-center">Please wait while we update the information.</p>
          </div>
        </div>
      )}

      {/* Adjusted padding for mobile/desktop based on sidebar state */}
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'}`}>
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage all users across your hotels</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[ 
              { label: 'Total Users', role: 'all', count: filteredUsers.length, icon: <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />, bg: 'bg-blue-100' },
              { label: 'Admins', role: 'admin', count: filteredUsers.filter(u => u.role === 'admin').length, icon: <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />, bg: 'bg-blue-100' },
              { label: 'Managers', role: 'manager', count: filteredUsers.filter(u => u.role === 'manager').length, icon: <Building2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />, bg: 'bg-green-100' },
              { label: 'Users', role: 'user', count: filteredUsers.filter(u => u.role === 'user').length, icon: <User className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />, bg: 'bg-purple-100' },
            ].map((card) => (
              <div
                key={card.role}
                className={`bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6 cursor-pointer transition-all duration-300 h-28 md:h-32 flex flex-col justify-between ${
                  activeFilter === card.role ? 'border-2 border-blue-500' : 'border border-gray-200'
                }`}
                onClick={() => handleCardClick(card.role)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">{card.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{card.count}</p>
                  </div>
                  <div className={`p-2 md:p-3 ${card.bg} rounded-lg`}>{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* User Table */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 transition-all duration-300 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {activeFilter === 'all'
                  ? 'All Users'
                  : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}s`}
              </h2>
            </div>

            <div className="overflow-x-auto transition-all duration-300">
              <table className="w-full transition-all duration-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 transition-all duration-300">
                  {displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 md:px-6 py-8 md:py-12 text-center text-gray-500">
                        <User className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-4" />
                        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No Users Found</h3>
                        <p className="text-xs md:text-sm text-gray-500">There are no users to display at the moment.</p>
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-all duration-300 hover:bg-gray-50"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 relative">
                              {user.profile_image ? (
                                <img
                                  className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover border-2 border-gray-200"
                                  src={`${import.meta.env.VITE_BASE_URL}/uploads/${user.profile_image}`}
                                  alt={user.full_name || user.name || 'User'}
                                />
                              ) : (
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs md:text-base">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                                {user.full_name || user.name || user.email.split('@')[0]}
                              </div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mr-1 md:mr-2" />
                            <span className="text-xs md:text-sm text-gray-900 truncate max-w-[100px] md:max-w-none">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mr-1 md:mr-2" />
                            <div className="truncate max-w-[80px] md:max-w-none">
                              <span className="text-xs md:text-sm text-gray-900">{getHotelName(user)}</span>
                              {user.hotelId && <div className="text-xs text-gray-500">ID: {user.hotelId}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium space-x-1 md:space-x-2">
                          <button
                            onClick={() => openModal(user)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" /> View
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
                          >
                            <Edit2 className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-300"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Professional View Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div 
              className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm transition-opacity" 
              onClick={closeModal}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-2xl border border-gray-100">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Professional User Avatar */}
                    <div className="flex-shrink-0">
                      {selectedUser.profile_image ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                          src={`${import.meta.env.VITE_BASE_URL}/uploads/${selectedUser.profile_image}`}
                          alt={selectedUser.full_name || selectedUser.name || 'User'}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-lg">
                          <User className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {selectedUser.full_name || selectedUser.name || selectedUser.email.split('@')[0]}
                      </h3>
                      <p className="text-blue-100 text-sm">ID: {selectedUser.id}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(selectedUser.role)} bg-white bg-opacity-90`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-full bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Professional Content */}
              <div className="bg-white px-6 py-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Contact Information
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Email Address</p>
                          <p className="text-sm text-gray-900 break-all">{selectedUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Phone Number</p>
                          <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Address</p>
                          <p className="text-sm text-gray-900">{selectedUser.address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Professional Details
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Role</p>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${getRoleBadgeColor(selectedUser.role)}`}>
                            {selectedUser.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <Building2 className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Hotel Assignment</p>
                          <p className="text-sm text-gray-900 font-medium">{getHotelName(selectedUser)}</p>
                          {selectedUser.hotelId && (
                            <p className="text-xs text-gray-500 mt-1">Hotel ID: {selectedUser.hotelId}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Account Status</p>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedUser.status || 'active'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Member Since</p>
                          <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="inline-flex justify-center items-center px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div 
              className="fixed inset-0 backdrop-blur-sm transition-opacity" 
              onClick={closeEditModal}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-lg border border-gray-100">
              {/* Header with blur background */}
              <div className="bg-white bg-opacity-20 backdrop-blur-md px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Edit User Profile</h3>
                  <button
                    onClick={closeEditModal}
                    className="rounded-full bg-gray-100 p-2 text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Professional Edit Form */}
              <form onSubmit={handleEditUser} className="bg-white px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={editFormData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={editFormData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      required
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {editFormData.role !== 'admin' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Hotel ID</label>
                      <input
                        type="text"
                        name="hotelId"
                        value={editFormData.hotelId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder="Enter hotel ID"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 -mx-6 -mb-6 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="inline-flex justify-center items-center px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-sm hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserList;
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Eye, Edit2, Trash2, User, Mail, Phone, MapPin, Calendar, Building2, Shield, X, Loader } from 'lucide-react';

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
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
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
      
      // Show loader for 1.5 seconds
      setTimeout(() => {
        setLoading(false);
        closeEditModal();
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true);
      
      try {
        await deleteUserSuperAdmin(userId);
        
        // Show loader for 1.5 seconds
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error deleting user:', error);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
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
      case 'manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'user': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCardClick = (role) => {
    setActiveFilter(role);
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
            <p className="text-gray-600 text-center">Please wait while we update the user information.</p>
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
                              <span className="text-xs md:text-sm text-gray-900">{user.hotel_name || 'Not Assigned'}</span>
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

      {/* View Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={closeModal}></div>

            <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-lg">
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={closeModal}
                  className="rounded-md bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-white px-6 py-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {selectedUser.profile_image ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        src={`${import.meta.env.VITE_BASE_URL}/uploads/${selectedUser.profile_image}`}
                        alt={selectedUser.full_name || selectedUser.name || 'User'}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedUser.full_name || selectedUser.name || selectedUser.email.split('@')[0]}</h4>
                    <p className="text-sm text-gray-500">User ID: {selectedUser.id}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hotel</p>
                      <p className="text-sm text-gray-900">{selectedUser.hotel_name || 'Not Assigned'}</p>
                      {selectedUser.hotelId && <p className="text-xs text-gray-500">Hotel ID: {selectedUser.hotelId}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{selectedUser.address || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button
                  onClick={closeModal}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={closeEditModal}></div>

            <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-lg">
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button
                  onClick={closeEditModal}
                  className="rounded-md bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="bg-white px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editFormData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {editFormData.role !== 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel ID</label>
                    <input
                      type="text"
                      name="hotelId"
                      value={editFormData.hotelId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 -mx-6 -mb-6 mt-6">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
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
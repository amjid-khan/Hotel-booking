import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Eye, User, Mail, Phone, MapPin, Calendar, Building2, Shield, X } from 'lucide-react';

const UserList = () => {
  const { allUsers } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter out superadmin users
  const filteredUsers = allUsers.filter(user => user.role !== 'superadmin');

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <div className="pl-64 min-h-screen bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage all users across your hotels</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredUsers.filter(u => u.role === 'admin').length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-green-600">{filteredUsers.filter(u => u.role === 'manager').length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Users</p>
                  <p className="text-2xl font-bold text-purple-600">{filteredUsers.filter(u => u.role === 'user').length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                        <p className="text-gray-500">There are no users to display at the moment.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profile_image ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                  src={`${import.meta.env.VITE_BASE_URL}${user.profile_image}`}
                                  alt={user.full_name}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${user.profile_image ? 'hidden' : 'flex'}`}>
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.full_name || user.name || user.email.split('@')[0]}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <span className="text-sm text-gray-900">{user.hotel_name || 'Not Assigned'}</span>
                              {user.hotelId && (
                                <div className="text-xs text-gray-500">ID: {user.hotelId}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal(user)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
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

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={closeModal}></div>
            
            <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-lg">
              {/* Modal Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                  <button
                    onClick={closeModal}
                    className="rounded-md bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="bg-white px-6 py-6">
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {selectedUser.profile_image ? (
                        <img
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                          src={`${import.meta.env.VITE_BASE_URL}${selectedUser.profile_image}`}
                          alt={selectedUser.full_name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl ${selectedUser.profile_image ? 'hidden' : 'flex'}`}>
                        {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
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
                        {selectedUser.hotelId && (
                          <p className="text-xs text-gray-500">Hotel ID: {selectedUser.hotelId}</p>
                        )}
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
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-end">
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
        </div>
      )}
    </>
  );
};

export default UserList;
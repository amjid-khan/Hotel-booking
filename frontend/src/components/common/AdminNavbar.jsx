// src/components/admin/AdminNavbar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSignOutAlt,
  FaCheck,
  FaBed,
  FaUserTag,
  FaSearch,
  FaShieldAlt,
} from "react-icons/fa";
import { MdDashboard, MdBookOnline, MdAnalytics } from "react-icons/md";
import { HiPlus, HiUsers, HiCog } from "react-icons/hi";
import { GiModernCity } from "react-icons/gi";
import { AuthContext } from "../../contexts/AuthContext";
import useUserPermissions from "../../contexts/useUserPermissions";
import { FaClipboardList } from "react-icons/fa";

const AdminNavbar = () => {
  const perms = useUserPermissions(); // logged-in user's permissions
  const {
    user,
    logout,
    hotels = [],
    selectedHotelId,
    selectHotel,
    createRole,
    permissions = [],
  } = useContext(AuthContext);
  const [mobileActive, setMobileActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loadingHotel, setLoadingHotel] = useState(false);
  const [switchingHotelName, setSwitchingHotelName] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Show ALL permissions - no filtering
  const getFilteredPermissions = () => {
    return permissions; // Return all permissions without any filtering
  };

  // Group permissions by category for better organization
  const getGroupedPermissions = () => {
    const filteredPermissions = getFilteredPermissions();
    const grouped = {};

    filteredPermissions.forEach((permission) => {
      const category = permission.category || "General";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    return grouped;
  };

  // Filter permissions based on search and category
  const getSearchFilteredPermissions = () => {
    const filteredPermissions = getFilteredPermissions();

    return filteredPermissions.filter((permission) => {
      const matchesSearch =
        !permissionSearch ||
        permission.name
          .toLowerCase()
          .includes(permissionSearch.toLowerCase()) ||
        permission.description
          ?.toLowerCase()
          .includes(permissionSearch.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        (permission.category || "General") === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  // Get unique categories for filter
  const getCategories = () => {
    const filteredPermissions = getFilteredPermissions();
    const categories = [
      ...new Set(filteredPermissions.map((p) => p.category || "General")),
    ];
    return ["all", ...categories.sort()];
  };

  // Format permission name for better display
  const formatPermissionName = (name) => {
    // Convert snake_case to Title Case and reorder specific cases
    let formatted = name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Handle specific reordering cases
    if (formatted === "User Create") {
      return "Create User";
    }
    
    return formatted;
  };

  // Get permission description or generate one from name
  const getPermissionDescription = (permission) => {
    if (permission.description) {
      return permission.description;
    }
    
    // Generate description from name if none exists
    const name = formatPermissionName(permission.name);
    return `Allow user to ${name.toLowerCase()}`;
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const handleCreateHotel = () => {
    navigate("/admin/create-hotel?new=true");
    setShowDropdown(false);
  };

  const handleSwitchHotel = async (hotel) => {
    if (hotel.id === selectedHotelId) return;
    setSwitchingHotelName(hotel.name);
    setLoadingHotel(true);
    selectHotel(hotel.id);
    setShowDropdown(false);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate(`/admin/hotel/${hotel.id}`);
    setLoadingHotel(false);
  };

  const handleCreateRole = () => {
    setShowRoleModal(true);
    setPermissionSearch("");
    setSelectedCategory("all");
    setRoleFormData({
      name: "",
      description: "",
      permissions: [],
    });
  };

  const handleRoleFormChange = (field, value) => {
    setRoleFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSelectAllInCategory = (category) => {
    const categoryPermissions = getSearchFilteredPermissions()
      .filter((p) => (p.category || "General") === category)
      .map((p) => p.id);

    const allSelected = categoryPermissions.every((id) =>
      roleFormData.permissions.includes(id)
    );

    if (allSelected) {
      // Deselect all in category
      setRoleFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (id) => !categoryPermissions.includes(id)
        ),
      }));
    } else {
      // Select all in category
      setRoleFormData((prev) => ({
        ...prev,
        permissions: [
          ...new Set([...prev.permissions, ...categoryPermissions]),
        ],
      }));
    }
  };

  const handleSubmitRole = async () => {
    if (!roleFormData.name.trim()) {
      alert("Role name is required");
      return;
    }

    setIsCreatingRole(true);
    try {
      await createRole(roleFormData);
      setShowRoleModal(false);
      setRoleFormData({
        name: "",
        description: "",
        permissions: [],
      });
      alert("Role created successfully!");
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role. Please try again.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Define all possible links with their permission requirements
  const allLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <MdDashboard />,
      permission: () =>
        perms?.hotel?.dashboardView ||
        user?.role === "admin" ||
        user?.role === "superadmin",
    },
    {
      name: "Add Room",
      path: "/add-room",
      icon: <HiPlus />,
      permission: () =>
        perms?.room?.create ||
        user?.role === "admin" ||
        user?.role === "superadmin",
    },
    {
      name: "Room Booking",
      path: "/room-booking",
      icon: <FaBed />,
      permission: () =>
        perms?.room?.viewAny ||
        perms?.room?.viewSelf ||
        user?.role === "admin" ||
        user?.role === "superadmin",
    },
    {
      name: "Booking Orders",
      path: "/bookings",
      icon: <MdBookOnline />,
      // ✅ only for those who have booking_view_any OR admin/superadmin
      permission: () =>
        perms?.booking?.viewAny ||
        user?.role === "admin" ||
        user?.role === "superadmin",
    },
    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: <FaClipboardList />,
      // ✅ har role ke liye, kyunki sab apni booking dekh sakte hain
      permission: () =>
        perms?.booking?.create || perms?.booking?.viewSelf || user?.role,
    },

    {
      name: "Users",
      path: "/users",
      icon: <HiUsers />,
      permission: () =>
        perms?.user?.viewAll ||
        user?.role === "admin" ||
        user?.role === "superadmin",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <HiCog />,
      permission: () => user?.role === "admin" || user?.role === "superadmin",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <MdAnalytics />,
      permission: () =>
        perms?.hotel?.dashboardView ||
        user?.role === "admin" ||
        user?.role === "superadmin",
    },
  ];

  // Filter links based on user permissions
  const links = allLinks.filter((link) => link.permission());

  // --- For USER ROLE: Find the hotel name assigned ---
  const assignedHotelName =
    user?.role === "user"
      ? hotels.find((h) => h.id === user.hotelId)?.name || "Assigned Hotel"
      : null;

  const filteredPermissions = getSearchFilteredPermissions();
  const groupedPermissions = getGroupedPermissions();
  const categories = getCategories();

  return (
    <>
      {/* Hotel Switching Loader */}
      {loadingHotel && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-600 font-medium">
              Switching to:{" "}
              <span className="text-blue-600 font-semibold">
                {switchingHotelName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3 md:hidden z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GiModernCity className="text-white text-lg" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">LuxStay</div>
            <div className="text-xs text-gray-500">
              {user?.role === "user" ? assignedHotelName : user?.role === "admin" ? "Admin" : user?.role === "superadmin" ? "Super Admin" : ""}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileActive(true)}
          className="bg-white border border-gray-300 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <FaBars className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileActive && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileActive(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          mobileActive ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:z-30`}
      >
        {/* Header (Visible on Desktop) */}
        <div className="hidden md:flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GiModernCity className="text-white text-lg" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">LuxStay</div>
              <div className="text-xs text-gray-500">
                {user?.role === "user" ? assignedHotelName : user?.role === "admin" ? "Admin Panel" : user?.role === "superadmin" ? "Super Admin Panel" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Close button for mobile */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={() => setMobileActive(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* User Section */}
        {user && (
          <div className="p-6 border-b border-gray-200 bg-gray-50/30 mt-16 md:mt-0 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <FaUserCircle className="w-10 h-10 text-gray-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {user.full_name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role === "user"
                    ? assignedHotelName
                    : user.role === "admin"
                    ? "Administrator"
                    : user.role === "superadmin"
                    ? "Super Administrator"
                    : ""}
                </div>
              </div>
            </div>

            {/* Only show Create Hotel + Dropdown + Create Role if NOT normal user */}
            {user.role !== "user" && (
              <>
                <div className="grid grid-cols-1 gap-2 mb-3">
                  {(user?.role === "admin" ||
                    user?.role === "superadmin" ||
                    perms?.hotel?.create) && (
                    <button
                      onClick={handleCreateHotel}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      Create Hotel
                    </button>
                  )}

                  {(user?.role === "admin" ||
                    user?.role === "superadmin" ||
                    perms?.role?.create) && (
                    <button
                      onClick={handleCreateRole}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaUserTag className="w-4 h-4" />
                      Create Role
                    </button>
                  )}
                </div>

                {hotels.length > 0 && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors duration-200"
                    >
                      <span className="truncate">
                        {(() => {
                          // ✅ More robust hotel name finding
                          if (!selectedHotelId || !hotels.length) return "Select Hotel";
                          
                          const selectedHotel = hotels.find((h) => h.id == selectedHotelId);
                          return selectedHotel?.name || "Select Hotel";
                        })()}
                      </span>
                      <FaChevronDown
                        className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                          Available Hotels
                        </div>
                        {hotels.map((hotel) => {
                          // ✅ Use loose comparison to handle string/number mismatch
                          const isSelected = selectedHotelId == hotel.id;
                          return (
                            <button
                              key={hotel.id}
                              onClick={() => handleSwitchHotel(hotel)}
                              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              <span className="truncate">{hotel.name}</span>
                              {isSelected && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <FaCheck className="w-3 h-3" />
                                  <span className="text-xs font-medium">
                                    Active
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <nav className="h-full overflow-y-auto p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Navigation
            </div>
            <div className="space-y-1 pb-4">
              {links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileActive(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {link.icon}
                  </span>
                  {link.name}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>

        {/* Logout Section - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 hover:border-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Create Role Modal - Modern Consistent Design */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <FaUserTag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Create New Role</h3>
                    <p className="text-blue-100 text-sm">Define permissions and access levels</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                {/* Role Basic Info */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={roleFormData.name}
                        onChange={(e) => handleRoleFormChange("name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter role name (e.g., Manager, Receptionist)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Description
                      </label>
                      <textarea
                        value={roleFormData.description}
                        onChange={(e) => handleRoleFormChange("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        placeholder="Describe the role and its responsibilities..."
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaShieldAlt className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Role Permissions</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            {roleFormData.permissions.length} selected
                          </span>
                          <span className="text-xs text-gray-500">
                            {filteredPermissions.length} available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={permissionSearch}
                        onChange={(e) => setPermissionSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {category === "all" ? "All Categories" : category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Permissions Display */}
                  {filteredPermissions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FaShieldAlt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No permissions found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                        const filteredCategoryPerms = categoryPermissions.filter((permission) =>
                          getSearchFilteredPermissions().includes(permission)
                        );

                        if (filteredCategoryPerms.length === 0) return null;

                        const allSelected = filteredCategoryPerms.every((p) =>
                          roleFormData.permissions.includes(p.id)
                        );

                        return (
                          <div key={category} className="border-b border-gray-200 last:border-b-0">
                            {/* Category Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                                    <FaShieldAlt className="w-3 h-3 text-blue-600" />
                                  </div>
                                  <h5 className="font-semibold text-gray-900">{category}</h5>
                                  <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full border">
                                    {filteredCategoryPerms.length}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleSelectAllInCategory(category)}
                                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                                    allSelected
                                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  }`}
                                >
                                  {allSelected ? "Deselect All" : "Select All"}
                                </button>
                              </div>
                            </div>

                            {/* Category Permissions */}
                            <div className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredCategoryPerms.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                      roleFormData.permissions.includes(permission.id)
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() => handlePermissionToggle(permission.id)}
                                  >
                                    {/* Checkbox */}
                                    <div className="flex items-center h-5 mr-3">
                                      <input
                                        type="checkbox"
                                        checked={roleFormData.permissions.includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <label className="text-sm font-medium text-gray-900 cursor-pointer block mb-1">
                                        {formatPermissionName(permission.name)}
                                      </label>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        {getPermissionDescription(permission)}
                                      </p>
                                    </div>

                                    {/* Check Icon for Selected */}
                                    {roleFormData.permissions.includes(permission.id) && (
                                      <div className="ml-2 flex-shrink-0">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                          <FaCheck className="w-3 h-3 text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRole}
                disabled={isCreatingRole || !roleFormData.name.trim()}
                className="flex-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingRole ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Role...
                  </>
                ) : (
                  <>
                    <FaUserTag className="w-4 h-4" />
                    Create Role ({roleFormData.permissions.length} permissions)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaSignOutAlt className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Sign Out
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to sign out? You'll need to
                    authenticate again.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
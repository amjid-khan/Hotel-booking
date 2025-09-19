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
              {user?.role === "user" ? assignedHotelName : "Admin"}
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
                {user?.role === "user" ? assignedHotelName : "Admin Panel"}
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
                  {user.role === "user" ? assignedHotelName : "Administrator"}
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
                        {selectedHotelId
                          ? hotels.find((h) => h.id === selectedHotelId)
                              ?.name || "Select Hotel"
                          : "Select Hotel"}
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
                          const isSelected = selectedHotelId === hotel.id;
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

      {/* Create Role Modal - Modern Design */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
            {/* Modal Header - Modern Gradient */}
            <div className="relative px-8 py-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                    <FaUserTag className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Create New Role
                    </h3>
                    <p className="text-emerald-100 font-medium mt-1">
                      Define permissions and access levels
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-280px)] bg-gradient-to-br from-gray-50/50 to-white">
              {/* Role Basic Info - Modern Cards */}
              <div className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      Role Name
                      <span className="text-red-500 text-lg">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={roleFormData.name}
                        onChange={(e) =>
                          handleRoleFormChange("name", e.target.value)
                        }
                        className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 font-semibold text-gray-800 shadow-sm group-hover:shadow-md"
                        placeholder="Enter role name (e.g., Manager, Receptionist)"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        value={roleFormData.description}
                        onChange={(e) =>
                          handleRoleFormChange("description", e.target.value)
                        }
                        rows={4}
                        className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 resize-none font-medium text-gray-800 shadow-sm group-hover:shadow-md"
                        placeholder="Describe the role and its responsibilities..."
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FaShieldAlt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">
                        Role Permissions
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                          {roleFormData.permissions.length} selected
                        </div>
                        <div className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-2 rounded-full">
                          {filteredPermissions.length} available
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search and Filter Controls */}
                <div className="mb-8 space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      className="relative w-full pl-6 pr-14 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-sm font-medium bg-white shadow-sm group-hover:shadow-md"
                    />
                    <FaSearch className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {category === "all" ? "All Categories" : category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions Display */}
                {filteredPermissions.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
                      <FaShieldAlt className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold mb-3">
                      No permissions found
                    </p>
                    <p className="text-lg">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 rounded-3xl overflow-hidden shadow-lg bg-white">
                    {Object.entries(groupedPermissions).map(
                      ([category, categoryPermissions]) => {
                        const filteredCategoryPerms =
                          categoryPermissions.filter((permission) =>
                            getSearchFilteredPermissions().includes(permission)
                          );

                        if (filteredCategoryPerms.length === 0) return null;

                        const allSelected = filteredCategoryPerms.every((p) =>
                          roleFormData.permissions.includes(p.id)
                        );

                        return (
                          <div
                            key={category}
                            className="border-b-2 border-gray-200 last:border-b-0"
                          >
                            {/* Category Header - Modern Gradient */}
                            <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 px-8 py-6 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                    <FaShieldAlt className="w-5 h-5 text-white" />
                                  </div>
                                  <h5 className="font-bold text-gray-900 text-xl">
                                    {category}
                                  </h5>
                                  <div className="bg-white text-gray-700 text-sm font-bold px-4 py-2 rounded-full border-2 border-gray-200 shadow-sm">
                                    {filteredCategoryPerms.length}
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    handleSelectAllInCategory(category)
                                  }
                                  className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                    allSelected
                                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                  }`}
                                >
                                  {allSelected ? "Deselect All" : "Select All"}
                                </button>
                              </div>
                            </div>

                            {/* Category Permissions - Modern Grid with Radio Button Style */}
                            <div className="p-8">
                              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                {filteredCategoryPerms.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className={`group relative flex items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                      roleFormData.permissions.includes(
                                        permission.id
                                      )
                                        ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg scale-102"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 shadow-sm"
                                    }`}
                                    onClick={() =>
                                      handlePermissionToggle(permission.id)
                                    }
                                  >
                                    {/* Custom Radio Button Style */}
                                    <div className="flex items-center h-6 mr-4">
                                      <div
                                        className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                                          roleFormData.permissions.includes(
                                            permission.id
                                          )
                                            ? "border-emerald-500 bg-emerald-500"
                                            : "border-gray-300 bg-white group-hover:border-gray-400"
                                        }`}
                                      >
                                        {roleFormData.permissions.includes(
                                          permission.id
                                        ) && (
                                          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <label className="text-sm font-bold text-gray-900 cursor-pointer block mb-2">
                                        {permission.name}
                                      </label>
                                      {permission.description && (
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                          {permission.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Check Icon */}
                                    {roleFormData.permissions.includes(
                                      permission.id
                                    ) && (
                                      <div className="ml-4 flex-shrink-0">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                          <FaCheck className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    )}

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer - Modern Gradient */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-t-2 border-gray-200 flex gap-4">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-4 px-8 rounded-2xl text-sm font-bold border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRole}
                disabled={isCreatingRole || !roleFormData.name.trim()}
                className="flex-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
              >
                {isCreatingRole ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Role...
                  </>
                ) : (
                  <>
                    <FaUserTag className="w-5 h-5" />
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

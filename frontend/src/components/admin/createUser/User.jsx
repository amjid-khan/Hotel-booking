import React, { useState } from 'react';
import axios from 'axios';
import "./User.css";

const User = () => {
  // Correct way to access env variables in Vite:
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    profile_image: null,
  });

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_image") {
      setFormData({ ...formData, profile_image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found — please log in first.");
        return;
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const res = await axios.post(`${BASE_URL}/api/hotel-users`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("User created successfully!");
      console.log(res.data);
      handleCloseModal();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className='user'>
      <div className="top-section">
        <h3>User Overview</h3>
        <button className="create-btn" onClick={handleOpenModal}>Create User</button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h4>Create New User</h4>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form className="user-form" onSubmit={handleSubmit}>
                <label>
                  Full Name
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter full name" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" required />
                </label>
                <label>
                  Phone
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
                </label>
                <label>
                  Password
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
                </label>
                <label>
                  Role
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                </label>
                <label>
                  Status
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label>
                  Profile Picture
                  <input type="file" name="profile_image" accept="image/*" onChange={handleChange} />
                </label>
                <button type="submit" className="submit-btn">Create User</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;

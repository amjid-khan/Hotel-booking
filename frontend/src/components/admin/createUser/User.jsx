import React, { useState } from 'react';
import "./User.css";

const User = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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
              <form className="user-form">
                <label>
                  Full Name
                  <input type="text" placeholder="Enter full name" />
                </label>
                <label>
                  Email
                  <input type="email" placeholder="Enter email" />
                </label>
                <label>
                  Phone
                  <input type="text" placeholder="Enter phone number" />
                </label>
                <label>
                  Password
                  <input type="password" placeholder="Enter password" />
                </label>
                <label>
                  Role
                  <select>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </label>
                <label>
                  Status
                  <select>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label>
                  Profile Picture
                  <input type="file" accept="image/*" />
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

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import "./User.css";

const User = () => {
  const { user, users, fetchUsers, createUser, deleteUser } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        name,
        email,
        password,
        role: "user",
        hotelId: user?.hotelId || null,
      });
      setName("");
      setEmail("");
      setPassword("");
      setShowModal(false);
    } catch (err) {
      alert("Error creating user, check console.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
      } catch {
        alert("Error deleting user, check console.");
      }
    }
  };

  return (
    <div className="user-manager">
      <div className="header">
        <h2>Manage Users</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="3">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add User */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New User</h3>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="save-btn">Create</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function LoginRegister() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'admin' }); // role default admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const full_name = formData.full_name.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const role = formData.role; // will always be "admin"

    // Validation
    if (isRegister && !full_name) {
      setError('Full name is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Registration (role is always "admin")
        await axios.post(`${BASE_URL}/api/auth/register`, {
          full_name,
          email,
          password,
          role
        });
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setFormData({ full_name: '', email: '', password: '', role: 'admin' });
      } else {
        // Login
        const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
        const { user, token } = response.data;

        // Save to AuthContext & localStorage
        login(user, token);

        // Navigate based on role
        if (user.role === 'admin') {
          // Fetch admin hotels
          const hotelRes = await axios.get(`${BASE_URL}/api/hotels/admin/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const hotels = hotelRes.data || [];

          if (hotels.length > 0) navigate('/admin', { replace: true });
          else navigate('/admin/create-hotel', { replace: true });
        } else if (user.role === 'superadmin') {
          navigate('/superadmin', { replace: true });
        } else if (user.role === 'user') {
          navigate('/user', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="left-side">
        <div className="decorative-shape"></div>
        <h1>Find Your Perfect Stay</h1>
        <p>Book hotels with best deals and comfort.</p>
        <div className="hotel-icon" aria-hidden="true">
          <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
            <path d="M3 12l7-8 7 8v8H3v-8z" />
          </svg>
        </div>
      </div>

      <div className="right-side">
        <h2 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">Book your perfect stay with us</p>

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={onChange}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <p className="toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setFormData({ full_name: '', email: '', password: '', role: 'admin' });
            }}
            className="toggle-link"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginRegister;

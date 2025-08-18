import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function LoginRegister() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (isRegister && !name) {
      setError('Name is required');
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
        await axios.post('http://localhost:5000/api/auth/register', {
          name,
          email,
          password,
          role: 'admin',
        });
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setFormData({ name: '', email: '', password: '' });
      } else {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const { user, token } = response.data;

        // Save to AuthContext & localStorage
        login(user, token);

        // Redirect based on role
        if (user.role === 'admin') navigate('/admin', { replace: true });
        else if (user.role === 'superadmin') navigate('/superadmin', { replace: true });
        else if (user.role === 'user') navigate('/user', { replace: true });
        else navigate('/', { replace: true });
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
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Password</label>
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
              setFormData({ name: '', email: '', password: '' });
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
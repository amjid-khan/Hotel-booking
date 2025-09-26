// src/components/auth/LoginRegister.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginRegister() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'admin' });
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
    const role = formData.role;

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
        const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
        const { user, token } = response.data;
        login(user, token);
        console.log("User login", response.data);

        if (user.role === 'admin') {
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
    <div className="flex flex-col md:flex-row h-screen font-poppins">
      {/* Left Side */}
      <div className="flex-1 relative flex flex-col justify-center p-12 bg-gradient-to-br from-[#2b5876] to-[#4e4376] text-white">
        <div className="absolute top-0 right-[-80px] w-[200px] h-[96%] bg-white [clip-path:ellipse(60%_100%_at_0%_50%)] hidden md:block"></div>
        <h1 className="text-6xl mb-2.5">Find Your Perfect Stay</h1>
        <p className="text-lg opacity-90">Book hotels with best deals and comfort.</p>
        <div className="mt-10" aria-hidden="true">
          <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
            <path d="M3 12l7-8 7 8v8H3v-8z" />
          </svg>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center p-12 bg-[#f9f9f9]">
        <h2 className="text-2xl mb-1.5 text-center text-[#333]">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-sm text-[#777] mb-7.5 text-center">Book your perfect stay with us</p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {isRegister && (
            <div className="flex flex-col">
              <label htmlFor="full_name" className="mb-1.5 font-medium">Full Name *</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={onChange}
                placeholder="Your full name"
                autoComplete="name"
                className="w-full p-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#4e4376] focus:shadow-md"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1.5 font-medium">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full p-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#4e4376] focus:shadow-md"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1.5 font-medium">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full p-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#4e4376] focus:shadow-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-br from-[#2b5876] to-[#4e4376] text-white rounded-lg font-medium text-base transition-transform duration-200 disabled:opacity-50"
          >
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        {error && <p className="mt-2.5 text-red-500 text-sm">{error}</p>}

        <p className="mt-5 text-sm text-center text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setFormData({ full_name: '', email: '', password: '', role: 'admin' });
            }}
            className="underline font-semibold text-[#4e4376] hover:text-[#2b5876] bg-none border-none cursor-pointer"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginRegister;

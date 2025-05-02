import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import AppConfig from '../config/AppConfig';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate, token]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setApiError('');
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(AppConfig.API_URL + '/login', formData, {
        headers: {
          'Accept': 'application/json'
        }
      });

      // Simpan token ke localStorage
      localStorage.setItem('token', response.data.access_token);

      // Redirect ke halaman dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response) {
        if (err.response.data.errors) {
          // Handle server validation errors
          const serverErrors = err.response.data.errors;
          const newErrors = {};

          Object.keys(serverErrors).forEach(key => {
            newErrors[key] = serverErrors[key][0];
          });

          setErrors(newErrors);
        } else if (err.response.data.message) {
          setApiError(err.response.data.message);
        } else {
          setApiError('Login failed. Please try again.');
        }
      } else {
        setApiError('Login failed. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {apiError && (
            <div className="alert alert-danger">
              {apiError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={errors.email ? 'error-input' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className={errors.password ? 'error-input' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="login-links">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
          <p>
            <Link to="/">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
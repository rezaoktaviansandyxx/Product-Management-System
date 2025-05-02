import React, { useEffect, useState } from 'react';
import '../style/Register.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppConfig from '../config/AppConfig';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_name: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_name: ''
  });

  const [roles, setRoles] = useState([]);
  const [show, setShow] = useState({ password: false, confirm: false });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }

    fetchRoles();
  }, [navigate, token]);



  const fetchRoles = async () => {
    try {
      const response = await axios(AppConfig.API_URL + '/roles');
      const data = response.data.data;
      setRoles(data);

      if (data.length > 0) {
        setFormData(prev => ({
          ...prev,
          role_name: data[0].name.toString()
        }));
      }
    } catch (error) {
      console.log('Error fetching roles:', error);
    }
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
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

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

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords does not match';
      isValid = false;
    }

    if (!formData.role_name) {
      newErrors.role_name = 'Please select a role';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await axios.post(AppConfig.API_URL + '/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role_name: formData.role_name
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Please login with your credentials.',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/login');
      });

    } catch (error) {
      if (error.response) {
        if (error.response.data.errors) {
          const serverErrors = error.response.data.errors;
          const newErrors = {};

          Object.keys(serverErrors).forEach(key => {
            newErrors[key] = serverErrors[key][0];
          });

          setErrors(newErrors);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error.response.data.message || 'Please try again.'
          });
        }
      } else if (error.request) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'No response from server. Please check your network connection.'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create New Account</h2>
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter username"
              className={errors.username ? 'error-input' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
              className={errors.email ? 'error-input' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={show.password ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                minLength="6"
                className={errors.password ? 'error-input' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShow(p => ({ ...p, password: !p.password }))}
              >
                {show.password ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={show.confirm ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                placeholder="Repeat password"
                minLength="6"
                className={errors.password_confirmation ? 'error-input' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
              >
                {show.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password_confirmation && <span className="error-text">{errors.password_confirmation}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role_name">Role</label>
            <select
              id="role_name"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              className={`role-select ${errors.role_name ? 'error-input' : ''}`}
              required
            >
              {roles.map(role => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_name && <span className="error-text">{errors.role_name}</span>}
          </div>

          <button type="submit" className="register-button">Register</button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
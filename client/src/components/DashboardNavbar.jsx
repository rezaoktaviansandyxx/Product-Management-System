import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../style/DashboardNavbar.css';
import axios from 'axios';
import AppConfig from '../config/AppConfig';
import { FaBars, FaTimes } from 'react-icons/fa';

const DashboardNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Check if user is authenticated
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    fetchUserRoles();
  }, [token]);

  const fetchUserRoles = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/me');
      setRole(response.data.role_name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await axios.post(AppConfig.API_URL + '/logout').then(() => {
      localStorage.removeItem('token');
      // Redirect ke halaman login
      navigate('/login');
    });
  };

  // Daftar menu navbar (semua)
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/products', label: 'Product' },
    { path: '/dashboard/categories', label: 'Category' },
    { path: '/dashboard/suppliers', label: 'Supplier' },
    { path: '/dashboard/roles', label: 'Role' },
    { path: '/dashboard/users', label: 'User', onlyFor: 'Administrator' },
  ];

  // Filter menu berdasarkan role
  const menuItems = allMenuItems.filter(
    (item) => !item.onlyFor || item.onlyFor === role
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-brand">
        <h2>ProductFlow</h2>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <div className={`navbar-right ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul className="navbar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
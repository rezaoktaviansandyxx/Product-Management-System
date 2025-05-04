import React, { useEffect, useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Outlet, useNavigate } from 'react-router-dom';
import '../style/DashboardContent.css';
import axios from 'axios';
import AppConfig from '../config/AppConfig';

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);



  return (
    <div className="dashboard-container">
      <DashboardNavbar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export function DashboardContent() {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProducts();
    }

  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(AppConfig.API_URL + '/products');
      setProducts(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-content-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <p className="dashboard-description">
        Selamat datang di dashboard. Gunakan menu di atas untuk mengelola data Anda seperti produk, pengguna, atau laporan.
      </p>

      <div className="stats-container">
        <div className="stat-card">
          <h2 className="stat-title">Total Products</h2>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <h2 className="stat-title">Today's Report</h2>
          <p className="stat-value">9</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
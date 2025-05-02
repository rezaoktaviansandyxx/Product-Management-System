import React, { useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Outlet, useNavigate } from 'react-router-dom';
import '../style/DashboardContent.css';

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
  return (
    <div className="dashboard-content-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <p className="dashboard-description">
        Selamat datang di dashboard. Gunakan menu di atas untuk mengelola data Anda seperti produk, pengguna, atau laporan.
      </p>

      <div className="stats-container">
        <div className="stat-card">
          <h2 className="stat-title">Total Produk</h2>
          <p className="stat-value">123</p>
        </div>
        <div className="stat-card">
          <h2 className="stat-title">Pengguna Aktif</h2>
          <p className="stat-value">58</p>
        </div>
        <div className="stat-card">
          <h2 className="stat-title">Laporan Hari Ini</h2>
          <p className="stat-value">9</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
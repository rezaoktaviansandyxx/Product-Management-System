import React from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Outlet } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <DashboardNavbar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

// Komponen untuk konten dashboard utama
export function DashboardContent() {
  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>Welcome to the dashboard. Select a menu item to manage your data.</p>
    </div>
  );
}

export default DashboardPage;
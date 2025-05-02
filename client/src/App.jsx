import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage, { DashboardContent } from './pages/DashboardPage';
import ProductPage from './pages/dashboard/ProductPage';
import CategoryPage from './pages/dashboard/CategoryPage';
import SupplierPage from './pages/dashboard/SupplierPage';
import RolePage from './pages/dashboard/RolePage';
import UserPage from './pages/dashboard/UserPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardContent />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="suppliers" element={<SupplierPage />} />
          <Route path="roles" element={<RolePage />} />
          <Route path="users" element={<UserPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

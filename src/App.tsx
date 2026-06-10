import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectPlan from './pages/ProjectPlan';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Purchase from './pages/Purchase';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import BulkUpload from './pages/BulkUpload';
import Settings from './pages/Settings';
import SetupGuide from './pages/SetupGuide';
import AndroidGuide from './pages/AndroidGuide';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading MedStock...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show app if authenticated
  return (
    <AnalyticsProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="project-plan" element={<ProjectPlan />} />
          <Route path="sales" element={<Sales />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="reports" element={<Reports />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
          <Route path="settings" element={<Settings />} />
            <Route path="setup-guide" element={<SetupGuide />} />
            <Route path="android-guide" element={<AndroidGuide />} />
          </Route>
      </Routes>
    </AnalyticsProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

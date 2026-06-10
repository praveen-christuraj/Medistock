import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnalyticsProvider } from './context/AnalyticsContext';
import Layout from './components/Layout';
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

function App() {
  return (
    <AnalyticsProvider>
      <BrowserRouter>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AnalyticsProvider>
  );
}

export default App;


import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// Admin Layout
import MainLayout from "./components/layout/MainLayout";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import ManageSchedules from "./pages/ManageSchedules";
import ResearchActivities from "./pages/ResearchActivities";
import PanelMembers from "./pages/PanelMembers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Determine which portal is being deployed
const APP_MODE = import.meta.env.VITE_APP_MODE || "admin";

// Staff Layout
function StaffLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#102746] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">
            NWU Research Scheduling System
          </h1>
          <p className="text-sm text-gray-300">
            Staff Calendar Portal
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      <footer className="text-center text-sm text-gray-500 py-5">
        Northwestern University | Research Scheduling System
      </footer>
    </div>
  );
}

// Admin Portal Routes
function AdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/schedules" element={<ManageSchedules />} />
        <Route path="/research" element={<ResearchActivities />} />
        <Route path="/panel-members" element={<PanelMembers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Staff Portal Routes
function StaffRoutes() {
  return (
    <Routes>
      <Route element={<StaffLayout />}>
        <Route path="/dashboard" element={<Calendar />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

// Main Application
function App() {
  return (
    <BrowserRouter>
      {APP_MODE === "staff" ? (
        <StaffRoutes />
      ) : (
        <AdminRoutes />
      )}
    </BrowserRouter>
  );
}

export default App;

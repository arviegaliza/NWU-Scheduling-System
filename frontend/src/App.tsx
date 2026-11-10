
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

// Staff Page
import StaffCalendar from "./pages/StaffCalendar";

// Deployment mode
const APP_MODE = import.meta.env.VITE_APP_MODE || "admin";

// Staff Layout
function StaffLayout() {
  return (
    <div className="staff-layout">
      <header className="staff-header">
        <div className="staff-header-inner">
          <h1>NWU Research Scheduling System</h1>
          <p>Staff Calendar Portal</p>
        </div>
      </header>

      <main className="staff-main">
        <Outlet />
      </main>

      <footer className="staff-footer">
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

// Staff Portal Routes - READ ONLY
function StaffRoutes() {
  return (
    <Routes>
      <Route element={<StaffLayout />}>
        <Route path="/dashboard" element={<StaffCalendar />} />
        <Route path="/calendar" element={<StaffCalendar />} />
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

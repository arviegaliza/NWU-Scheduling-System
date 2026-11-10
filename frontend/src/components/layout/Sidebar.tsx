
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  FlaskConical,
  Users,
  FileBarChart,
  Settings,
  LogOut,
  CalendarClock,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
  { name: "Manage Schedules", path: "/schedules", icon: CalendarPlus },
  { name: "Research Activities", path: "/research", icon: FlaskConical },
  { name: "Panel Members", path: "/panel-members", icon: Users },
  { name: "Reports", path: "/reports", icon: FileBarChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <CalendarClock size={25} />
        </div>
        <div>
          <h2>Research Scheduler</h2>
          <span>ADMIN PORTAL</span>
        </div>
      </div>

      <div className="sidebar-label">MAIN MENU</div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button">
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

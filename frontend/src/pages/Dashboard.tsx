import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  RefreshCw,
  MapPin,
  User,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

import "../styles/dashboard.css";

interface Schedule {
  id: number;
  researchTitle: string;
  researcher: string;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  panelChair: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
}

const SERVER_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${SERVER_URL}/api/schedules`;

const Dashboard = () => {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [selectedSchedule, setSelectedSchedule] =
    useState<Schedule | null>(null);

  // Fetch schedules from the database
  const fetchSchedules = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to retrieve schedules from the server.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid schedule data received from the server.");
      }

      setSchedules(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading schedules."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading and automatic refresh every 30 seconds
  useEffect(() => {
    fetchSchedules();

    const interval = setInterval(() => {
      fetchSchedules();
    }, 30000);

    const handleFocus = () => {
      fetchSchedules();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchSchedules]);

  // Today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString("en-CA");

  // Dashboard statistics
  const totalSchedules = schedules.length;

  const upcomingSchedules = schedules.filter((schedule) => {
    const scheduleDate = String(schedule.date).slice(0, 10);

    return (
      scheduleDate >= today &&
      schedule.status !== "Completed" &&
      schedule.status !== "Cancelled"
    );
  });

  const completedSchedules = schedules.filter(
    (schedule) => schedule.status === "Completed"
  ).length;

  const panelChairs = new Set(
    schedules
      .map((schedule) => schedule.panelChair?.trim())
      .filter((chair) => chair)
  ).size;

  // Sort upcoming schedules by date and start time
  const sortedUpcomingSchedules = [...upcomingSchedules]
    .sort((a, b) => {
      const dateComparison = String(a.date).localeCompare(String(b.date));

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return String(a.startTime).localeCompare(String(b.startTime));
    })
    .slice(0, 5);

  // Format date
  const formatDate = (date: string) => {
    if (!date) return "N/A";

    const dateOnly = String(date).slice(0, 10);
    const parsedDate = new Date(`${dateOnly}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (time: string) => {
    if (!time) return "N/A";

    const [hours, minutes] = String(time).split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "status-approved";
      case "Completed":
        return "status-completed";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  // Dashboard navigation
  const openSchedules = () => {
    navigate("/schedules");
  };

  const openCalendar = () => {
    navigate("/calendar");
  };

  const openCreateSchedule = () => {
    navigate("/calendar");
  };

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome to your Research Scheduling Management System.
            Monitor your research activities and schedules here.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="dashboard-refresh-button"
            onClick={fetchSchedules}
            disabled={loading}
            type="button"
          >
            <RefreshCw size={16} className={loading ? "spinning" : ""} />
            Refresh
          </button>

          <button
            className="dashboard-create-button"
            onClick={openCreateSchedule}
            type="button"
          >
            <Plus size={18} />
            Create Schedule
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="dashboard-update-info">
        {lastUpdated
          ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
          : "Loading dashboard information..."}
      </div>

      {/* Error Message */}
      {error && (
        <div className="dashboard-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchSchedules} type="button">
            Try Again
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="dashboard-stats-grid">

        {/* Total Schedules */}
        <button
          className="dashboard-stat-card"
          onClick={openSchedules}
          type="button"
        >
          <div className="stat-card-top">
            <div className="stat-icon blue">
              <CalendarDays size={23} />
            </div>
            <span className="stat-card-arrow">
              <ArrowRight size={18} />
            </span>
          </div>

          <div className="stat-card-content">
            <span className="stat-label">Total Schedules</span>
            <h2>{loading ? "..." : totalSchedules}</h2>
            <p>All recorded schedules</p>
          </div>
        </button>

        {/* Upcoming Schedules */}
        <button
          className="dashboard-stat-card"
          onClick={openCalendar}
          type="button"
        >
          <div className="stat-card-top">
            <div className="stat-icon orange">
              <Clock size={23} />
            </div>
            <span className="stat-card-arrow">
              <ArrowRight size={18} />
            </span>
          </div>

          <div className="stat-card-content">
            <span className="stat-label">Upcoming Schedules</span>
            <h2>{loading ? "..." : upcomingSchedules.length}</h2>
            <p>Pending and approved schedules</p>
          </div>
        </button>

        {/* Completed Schedules */}
        <button
          className="dashboard-stat-card"
          onClick={openSchedules}
          type="button"
        >
          <div className="stat-card-top">
            <div className="stat-icon green">
              <CheckCircle2 size={23} />
            </div>
            <span className="stat-card-arrow">
              <ArrowRight size={18} />
            </span>
          </div>

          <div className="stat-card-content">
            <span className="stat-label">Completed Schedules</span>
            <h2>{loading ? "..." : completedSchedules}</h2>
            <p>Successfully completed activities</p>
          </div>
        </button>

        {/* Panel Chairs */}
        <button
          className="dashboard-stat-card"
          onClick={openSchedules}
          type="button"
        >
          <div className="stat-card-top">
            <div className="stat-icon purple">
              <Users size={23} />
            </div>
            <span className="stat-card-arrow">
              <ArrowRight size={18} />
            </span>
          </div>

          <div className="stat-card-content">
            <span className="stat-label">Panel Chairs</span>
            <h2>{loading ? "..." : panelChairs}</h2>
            <p>Unique panel chairs in schedules</p>
          </div>
        </button>

      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-main-grid">

        {/* Upcoming Schedules */}
        <section className="dashboard-content-card">

          <div className="dashboard-section-header">
            <div>
              <h2>Upcoming Schedules</h2>
              <p>Latest scheduled research activities</p>
            </div>

            <button
              className="dashboard-view-all"
              onClick={openSchedules}
              type="button"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="dashboard-empty-state">
              Loading schedules...
            </div>
          ) : sortedUpcomingSchedules.length === 0 ? (
            <div className="dashboard-empty-state">
              <CalendarDays size={38} />
              <h3>No Upcoming Schedules</h3>
              <p>There are currently no upcoming research activities.</p>

              <button
                className="dashboard-create-button"
                onClick={openCreateSchedule}
                type="button"
              >
                <Plus size={17} />
                Add Schedule
              </button>
            </div>
          ) : (
            <div className="dashboard-schedule-list">
              {sortedUpcomingSchedules.map((schedule) => (
                <button
                  className="dashboard-schedule-item"
                  key={schedule.id}
                  onClick={() => setSelectedSchedule(schedule)}
                  type="button"
                >
                  <div className="schedule-date-box">
                    <span>
                      {new Date(
                        `${String(schedule.date).slice(0, 10)}T00:00:00`
                      ).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>

                    <strong>
                      {new Date(
                        `${String(schedule.date).slice(0, 10)}T00:00:00`
                      ).getDate()}
                    </strong>
                  </div>

                  <div className="schedule-item-details">
                    <h3>{schedule.researchTitle}</h3>

                    <p className="schedule-activity">
                      {schedule.activity}
                    </p>

                    <div className="schedule-item-meta">
                      <span>
                        <User size={14} />
                        {schedule.researcher}
                      </span>

                      <span>
                        <Clock size={14} />
                        {formatTime(schedule.startTime)}
                      </span>
                    </div>
                  </div>

                  <div className="schedule-item-right">
                    <span
                      className={`schedule-status ${getStatusClass(
                        schedule.status
                      )}`}
                    >
                      {schedule.status}
                    </span>

                    <ArrowRight size={17} />
                  </div>
                </button>
              ))}
            </div>
          )}

        </section>

        {/* Quick Actions */}
        <section className="dashboard-content-card">

          <div className="dashboard-section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used system functions</p>
            </div>
          </div>

          <div className="dashboard-quick-actions">

            <button
              className="quick-action-item"
              onClick={openCreateSchedule}
              type="button"
            >
              <div className="quick-action-icon blue">
                <Plus size={21} />
              </div>

              <div>
                <h3>Create Schedule</h3>
                <p>Add a new research activity schedule</p>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              className="quick-action-item"
              onClick={openCalendar}
              type="button"
            >
              <div className="quick-action-icon orange">
                <CalendarDays size={21} />
              </div>

              <div>
                <h3>View Calendar</h3>
                <p>View scheduled activities by date</p>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              className="quick-action-item"
              onClick={openSchedules}
              type="button"
            >
              <div className="quick-action-icon green">
                <ClipboardList size={21} />
              </div>

              <div>
                <h3>Manage Schedules</h3>
                <p>View and manage all schedules</p>
              </div>

              <ArrowRight size={17} />
            </button>

          </div>

        </section>

      </div>

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <div
          className="dashboard-modal-overlay"
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            className="dashboard-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dashboard-modal-header">
              <div>
                <span className="modal-eyebrow">
                  Schedule Information
                </span>
                <h2>Schedule Details</h2>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedSchedule(null)}
                type="button"
                aria-label="Close schedule details"
              >
                ×
              </button>
            </div>

            <div className="dashboard-modal-body">

              <div className="modal-research-title">
                {selectedSchedule.researchTitle}
              </div>

              <div className="modal-detail-row">
                <User size={18} />
                <div>
                  <span>Researcher</span>
                  <strong>{selectedSchedule.researcher}</strong>
                </div>
              </div>

              <div className="modal-detail-row">
                <ClipboardList size={18} />
                <div>
                  <span>Research Activity</span>
                  <strong>{selectedSchedule.activity}</strong>
                </div>
              </div>

              <div className="modal-detail-row">
                <CalendarDays size={18} />
                <div>
                  <span>Schedule Date</span>
                  <strong>{formatDate(selectedSchedule.date)}</strong>
                </div>
              </div>

              <div className="modal-detail-row">
                <Clock size={18} />
                <div>
                  <span>Time</span>
                  <strong>
                    {formatTime(selectedSchedule.startTime)} –{" "}
                    {formatTime(selectedSchedule.endTime)}
                  </strong>
                </div>
              </div>

              <div className="modal-detail-row">
                <MapPin size={18} />
                <div>
                  <span>Venue</span>
                  <strong>{selectedSchedule.venue}</strong>
                </div>
              </div>

              <div className="modal-detail-row">
                <Users size={18} />
                <div>
                  <span>Panel Chair</span>
                  <strong>{selectedSchedule.panelChair}</strong>
                </div>
              </div>

              <div className="modal-status-row">
                <span>Status</span>
                <span
                  className={`schedule-status ${getStatusClass(
                    selectedSchedule.status
                  )}`}
                >
                  {selectedSchedule.status}
                </span>
              </div>

            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-secondary-button"
                onClick={() => setSelectedSchedule(null)}
                type="button"
              >
                Close
              </button>

              <button
                className="dashboard-primary-button"
                onClick={() => {
                  navigate("/schedules");
                  setSelectedSchedule(null);
                }}
                type="button"
              >
                Manage Schedules
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import {
  RefreshCw,
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";
import "./StaffCalendar.css";

interface ScheduleRecord {
  id: number;
  researchTitle: string;
  researcher: string;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: string;
}

const SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${SERVER_URL}/api/schedules`;

export default function StaffCalendar() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to retrieve schedules.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid schedule data received.");
      }

      setSchedules(data);
    } catch (err) {
      console.error("Staff calendar error:", err);
      setError("Unable to load schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCount = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date);
    return !Number.isNaN(scheduleDate.getTime()) &&
      scheduleDate >= today &&
      schedule.status !== "Cancelled";
  }).length;

  const completedCount = schedules.filter(
    (schedule) => schedule.status?.toLowerCase() === "completed"
  ).length;

  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "completed";
      case "approved":
        return "approved";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="staff-calendar">
      <div className="staff-calendar-header">
        <div>
          <h2>Research Schedule Calendar</h2>
          <p>
            View the university's shared research activities and schedules.
          </p>
        </div>

        <button
          onClick={fetchSchedules}
          disabled={loading}
          className="staff-refresh-btn"
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="staff-stats">
        <div className="staff-stat-card">
          <p>Total Schedules</p>
          <h3>{schedules.length}</h3>
        </div>

        <div className="staff-stat-card upcoming">
          <p>Upcoming Schedules</p>
          <h3>{upcomingCount}</h3>
        </div>

        <div className="staff-stat-card completed">
          <p>Completed Schedules</p>
          <h3>{completedCount}</h3>
        </div>
      </div>

      {error && (
        <div className="staff-error">
          {error}
        </div>
      )}

      <div className="staff-schedule-container">
        <div className="staff-schedule-heading">
          <h3>University Research Schedules</h3>
          <p>Read-only schedule information for staff.</p>
        </div>

        {loading ? (
          <div className="staff-loading">
            Loading schedules...
          </div>
        ) : sortedSchedules.length === 0 ? (
          <div className="staff-empty">
            <CalendarDays size={38} />
            <p>No schedules available.</p>
          </div>
        ) : (
          <div>
            {sortedSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="staff-schedule-item"
              >
                <div className="staff-schedule-top">
                  <div>
                    <h4>{schedule.researchTitle}</h4>

                    <p className="staff-researcher">
                      {schedule.researcher}
                    </p>

                    <p className="staff-activity">
                      {schedule.activity}
                    </p>
                  </div>

                  <span
                    className={`staff-status ${getStatusClass(
                      schedule.status
                    )}`}
                  >
                    {schedule.status}
                  </span>
                </div>

                <div className="staff-schedule-details">
                  <span className="staff-detail">
                    <CalendarDays size={16} />
                    {formatDate(schedule.date)}
                  </span>

                  <span className="staff-detail">
                    <Clock size={16} />
                    {schedule.startTime} - {schedule.endTime}
                  </span>

                  <span className="staff-detail">
                    <MapPin size={16} />
                    {schedule.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

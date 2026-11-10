import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  CalendarDays,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { socket } from "../socket";
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
  panelChair?: string;
  status: string;
}

const SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${SERVER_URL}/api/schedules`;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getScheduleDateKey(value: string): string {
  if (!value) return "";

  const datePart = value.slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "" : dateKey(parsed);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "ongoing":
      return "ongoing";
    case "completed":
      return "completed";
    case "approved":
      return "approved";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

export default function StaffCalendar() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(
    dateKey(new Date())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSchedules = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial fetch and real-time updates.
  useEffect(() => {
    fetchSchedules();

    const handleScheduleUpdate = () => {
      fetchSchedules(false);
    };

    socket.on("schedules:updated", handleScheduleUpdate);

    return () => {
      socket.off("schedules:updated", handleScheduleUpdate);
    };
  }, [fetchSchedules]);

  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, ScheduleRecord[]> = {};

    schedules.forEach((schedule) => {
      const key = getScheduleDateKey(schedule.date);

      if (!key) return;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(schedule);
    });

    return grouped;
  }, [schedules]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [currentMonth]);

  const selectedSchedules = schedulesByDate[selectedDate] || [];
  const todayKey = dateKey(new Date());

  const upcomingCount = schedules.filter((schedule) => {
    const key = getScheduleDateKey(schedule.date);

    return (
      key >= todayKey &&
      schedule.status?.toLowerCase() !== "cancelled" &&
      schedule.status?.toLowerCase() !== "completed"
    );
  }).length;

  const completedCount = schedules.filter(
    (schedule) => schedule.status?.toLowerCase() === "completed"
  ).length;

  const ongoingCount = schedules.filter(
    (schedule) => schedule.status?.toLowerCase() === "ongoing"
  ).length;

  const changeMonth = (direction: number) => {
    setCurrentMonth((previous) =>
      new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1
      )
    );
  };

  const showToday = () => {
    const today = new Date();

    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setSelectedDate(dateKey(today));
  };

  const handleDateClick = (key: string) => {
    setSelectedDate(key);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const monthLabel = currentMonth.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

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
          className="staff-refresh-btn"
          onClick={() => fetchSchedules()}
          disabled={loading}
          type="button"
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

        <div className="staff-stat-card ongoing">
          <p>Ongoing Schedules</p>
          <h3>{ongoingCount}</h3>
        </div>

        <div className="staff-stat-card completed">
          <p>Completed Schedules</p>
          <h3>{completedCount}</h3>
        </div>
      </div>

      {error && <div className="staff-error">{error}</div>}

      <div className="staff-calendar-panel">
        <div className="staff-month-toolbar">
          <div>
            <h3>{monthLabel}</h3>
            <p>University-wide research activities</p>
          </div>

          <div className="staff-month-actions">
            <button
              onClick={showToday}
              className="staff-today-btn"
              type="button"
            >
              Today
            </button>

            <button
              onClick={() => changeMonth(-1)}
              className="staff-month-nav"
              aria-label="Previous month"
              type="button"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              onClick={() => changeMonth(1)}
              className="staff-month-nav"
              aria-label="Next month"
              type="button"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        <div className="staff-calendar-grid">
          {WEEKDAYS.map((day) => (
            <div className="staff-weekday" key={day}>
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  className="staff-calendar-cell empty"
                  key={`empty-${index}`}
                />
              );
            }

            const key = dateKey(date);
            const daySchedules = schedulesByDate[key] || [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;

            return (
              <button
                type="button"
                key={key}
                className={`staff-calendar-cell ${
                  isSelected ? "selected" : ""
                } ${isToday ? "today" : ""}`}
                onClick={() => handleDateClick(key)}
                aria-label={`View schedules for ${formatDate(date)}`}
              >
                <span className="staff-day-number">
                  {date.getDate()}
                </span>

                <div className="staff-day-events">
                  {daySchedules.slice(0, 2).map((schedule) => (
                    <span
                      key={schedule.id}
                      className={`staff-calendar-event ${getStatusClass(
                        schedule.status
                      )}`}
                      title={schedule.researchTitle}
                    >
                      {schedule.researchTitle}
                    </span>
                  ))}

                  {daySchedules.length > 2 && (
                    <span className="staff-more-events">
                      +{daySchedules.length - 2} more
                    </span>
                  )}
                </div>

                {daySchedules.length > 0 && (
                  <span className="staff-event-count">
                    {daySchedules.length}{" "}
                    {daySchedules.length === 1 ? "event" : "events"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="staff-calendar-legend">
          <span><i className="legend-approved" /> Approved</span>
          <span><i className="legend-pending" /> Pending</span>
          <span><i className="legend-ongoing" /> Ongoing</span>
          <span><i className="legend-completed" /> Completed</span>
          <span><i className="legend-cancelled" /> Cancelled</span>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="staff-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="staff-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-modal-header">
              <div>
                <h3 id="staff-modal-title">
                  Scheduled Activities
                </h3>
                <p>
                  {formatDate(
                    new Date(`${selectedDate}T12:00:00`)
                  )}
                </p>
              </div>

              <button
                className="staff-modal-close"
                onClick={closeModal}
                type="button"
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            <div className="staff-modal-body">
              {loading ? (
                <div className="staff-empty">
                  Loading schedules...
                </div>
              ) : selectedSchedules.length === 0 ? (
                <div className="staff-empty">
                  <CalendarDays size={36} />
                  <p>
                    No research activities scheduled for this date.
                  </p>
                </div>
              ) : (
                selectedSchedules.map((schedule) => (
                  <div
                    className="staff-schedule-item"
                    key={schedule.id}
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
                        <Clock size={16} />
                        {schedule.startTime} - {schedule.endTime}
                      </span>

                      <span className="staff-detail">
                        <MapPin size={16} />
                        {schedule.venue}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="staff-modal-footer">
              <span>
                {selectedSchedules.length}{" "}
                {selectedSchedules.length === 1
                  ? "Schedule"
                  : "Schedules"}
              </span>

              <button
                onClick={closeModal}
                className="staff-modal-done"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
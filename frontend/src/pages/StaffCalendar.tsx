
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  RefreshCw,
  CalendarDays,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
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
  panelists?: string[] | string;
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

// GET LOCAL DATE KEY
function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// GET SCHEDULE DATE
function getScheduleDateKey(value: string): string {
  if (!value) return "";

  const datePart = value.slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "" : dateKey(parsed);
}

// FORMAT DATE
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// FORMAT STATUS CLASS
function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "upcoming":
      return "upcoming";

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

// CONVERT 12-HOUR OR 24-HOUR TIME TO 24-HOUR FORMAT
function convertTo24Hour(time: string): string {
  if (!time) return "";

  const value = time.trim();

  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (hour < 1 || hour > 12 || minute > 59) {
      return "";
    }

    if (period === "AM" && hour === 12) hour = 0;
    if (period === "PM" && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}:00`;
  }

  const twentyFourHourMatch = value.match(
    /^(\d{1,2}):(\d{2})/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (hour > 23 || minute > 59) return "";

    return `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}:00`;
  }

  return "";
}

// GET PANELISTS
// The panelists field stores the assigned Panel Chair name(s).
function getPanelistNames(
  panelists?: string[] | string
): string[] {
  if (!panelists) return [];

  if (Array.isArray(panelists)) {
    return panelists
      .map((name) => String(name).trim())
      .filter(Boolean);
  }

  const value = panelists.trim();

  if (!value) return [];

  // Support JSON array strings.
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((name) => String(name).trim())
          .filter(Boolean);
      }
    } catch {
      // Continue with comma-separated parsing.
    }
  }

  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

export default function StaffCalendar() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  });

  const [selectedDate, setSelectedDate] = useState(
    dateKey(new Date())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  // FETCH SCHEDULES
  const fetchSchedules = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

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

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load schedules. Please try again."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  // INITIAL FETCH AND REAL-TIME UPDATES
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

  // GROUP SCHEDULES BY DATE
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

  // GENERATE CALENDAR DAYS
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];

    // EMPTY CELLS BEFORE FIRST DAY
    for (let i = 0; i < firstDay.getDay(); i++) {
      cells.push(null);
    }

    // DAYS OF THE MONTH
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    // COMPLETE THE LAST WEEK
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [currentMonth]);

  const selectedSchedules = schedulesByDate[selectedDate] || [];

  const todayKey = dateKey(new Date());

  // UPCOMING SCHEDULE COUNT
  const upcomingCount = schedules.filter((schedule) => {
    const key = getScheduleDateKey(schedule.date);

    if (!key) return false;

    const status = schedule.status?.toLowerCase();

    if (status === "cancelled" || status === "completed") {
      return false;
    }

    const convertedTime = convertTo24Hour(schedule.startTime);

    if (!convertedTime) return false;

    const startDateTime = new Date(
      `${key}T${convertedTime}`
    );

    return (
      !Number.isNaN(startDateTime.getTime()) &&
      startDateTime.getTime() > Date.now()
    );
  }).length;

  // COMPLETED SCHEDULE COUNT
  const completedCount = schedules.filter(
    (schedule) =>
      schedule.status?.toLowerCase() === "completed"
  ).length;

  // ONGOING SCHEDULE COUNT
  const ongoingCount = schedules.filter(
    (schedule) =>
      schedule.status?.toLowerCase() === "ongoing"
  ).length;

  // MONTH NAVIGATION
  const changeMonth = (direction: number) => {
    setCurrentMonth((previous) => {
      return new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1
      );
    });
  };

  // RETURN TO TODAY
  const showToday = () => {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(dateKey(today));
  };

  // SELECT A DATE
  const handleDateClick = (key: string) => {
    setSelectedDate(key);
    setIsModalOpen(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // CLOSE MODAL USING ESCAPE KEY
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // MONTH LABEL
  const monthLabel = currentMonth.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="staff-calendar">

      {/* HEADER */}
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

      {/* SUMMARY CARDS */}
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

      {/* ERROR MESSAGE */}
      {error && (
        <div className="staff-error">
          {error}

          <button
            type="button"
            onClick={() => fetchSchedules()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* CALENDAR PANEL */}
      <div className="staff-calendar-panel">

        {/* MONTH TOOLBAR */}
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

        {/* CALENDAR GRID */}
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

        {/* LEGEND */}
        <div className="staff-calendar-legend">
          <span>
            <i className="legend-approved" /> Approved
          </span>

          <span>
            <i className="legend-pending" /> Pending
          </span>

          <span>
            <i className="legend-upcoming" /> Upcoming
          </span>

          <span>
            <i className="legend-ongoing" /> Ongoing
          </span>

          <span>
            <i className="legend-completed" /> Completed
          </span>

          <span>
            <i className="legend-cancelled" /> Cancelled
          </span>
        </div>
      </div>

      {/* SCHEDULE DETAILS MODAL */}
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

            {/* MODAL HEADER */}
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

            {/* MODAL BODY */}
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
                selectedSchedules.map((schedule) => {
                  const panelistNames = getPanelistNames(
                    schedule.panelists
                  );

                  return (
                    <div
                      className="staff-schedule-item"
                      key={schedule.id}
                    >

                      {/* RESEARCH INFORMATION */}
                      <div className="staff-schedule-top">
                        <div>
                          <h4>{schedule.researchTitle}</h4>

                          <p className="staff-researcher">
                            <strong>Proponents:</strong>{" "}
                            {schedule.researcher || "Not specified"}
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

                      {/* DATE, TIME AND VENUE */}
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

                      {/* PANELISTS - ASSIGNED PANEL CHAIR */}
                      <div className="staff-panel-section">
                        <h5>
                          <Users size={16} />
                          Panelists
                        </h5>

                        {panelistNames.length > 0 ? (
                          <ul className="staff-panelist-list">
                            {panelistNames.map((name, index) => (
                              <li key={`${schedule.id}-${index}`}>
                                {name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No Panel Chair assigned yet.</p>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* MODAL FOOTER */}
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

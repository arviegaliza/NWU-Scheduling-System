
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Plus, RefreshCw, Users } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type { EventClickArg } from "@fullcalendar/core";

import Schedule, {
  type ScheduleData,
} from "../components/schedules/ScheduleForm";

import { socket } from "../socket";

import "../styles/calendar.css";

const SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_URL = `${SERVER_URL}/api/schedules`;

type CalendarSchedule = ScheduleData & {
  panelists: string[];
};

// Convert panelist data from the API into an array.
function normalizePanelists(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(/[,\n;]/))
      .map((name) => name.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return normalizePanelists(parsed);
      }
    } catch {
      // Support comma-separated or newline-separated names.
    }

    return trimmed
      .split(/[,\n;]/)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  return [];
}

// Normalize database records before displaying them.
function normalizeSchedule(
  record: Record<string, unknown>
): CalendarSchedule {
  return {
    id: record.id as number | string,
    researchTitle: String(record.researchTitle ?? record.research_title ?? ""),
    researcher: String(record.researcher ?? ""),
    activity: String(record.activity ?? ""),
    date: String(record.date ?? "").slice(0, 10),
    startTime: String(record.startTime ?? record.start_time ?? ""),
    endTime: String(record.endTime ?? record.end_time ?? ""),
    venue: String(record.venue ?? ""),
    panelists: normalizePanelists(record.panelists),
    status: (record.status ?? "Pending") as ScheduleData["status"],
  };
}

// Convert 12-hour or 24-hour time into 24-hour format.
const convertToISOTime = (time: string): string => {
  if (!time) return "";

  const normalizedTime = time.trim();

  const twentyFourHourMatch = normalizedTime.match(
    /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (hour > 23 || minute > 59) return "";

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const twelveHourMatch = normalizedTime.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!twelveHourMatch) return "";

  let hour = Number(twelveHourMatch[1]);
  const minute = Number(twelveHourMatch[2]);
  const period = twelveHourMatch[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute > 59) return "";

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

// Display time in 12-hour AM/PM format.
const formatTime = (time: string): string => {
  if (!time) return "";

  const convertedTime = convertToISOTime(time);

  if (!convertedTime) return time;

  const [hours, minutes] = convertedTime.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

export default function Calendar() {
  const [schedules, setSchedules] = useState<CalendarSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState<CalendarSchedule | null>(null);

  // FETCH SCHEDULES
  const fetchSchedules = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load schedules.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid schedule data received from the server.");
      }

      const normalizedData = data.map((record) =>
        normalizeSchedule(record as Record<string, unknown>)
      );

      setSchedules(normalizedData);

      // Keep selected schedule details updated.
      setSelectedSchedule((previous) => {
        if (!previous) return null;

        return (
          normalizedData.find(
            (schedule) => String(schedule.id) === String(previous.id)
          ) ?? null
        );
      });
    } catch (err) {
      console.error("Fetch schedules error:", err);

      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // INITIAL FETCH AND REAL-TIME SOCKET.IO UPDATES
  useEffect(() => {
    fetchSchedules();

    const handleScheduleUpdate = () => {
      console.log("Real-time schedule update received.");
      fetchSchedules(false);
    };

    socket.on("schedules:updated", handleScheduleUpdate);

    return () => {
      socket.off("schedules:updated", handleScheduleUpdate);
    };
  }, [fetchSchedules]);

  // ADD NEW SCHEDULE
  const handleAddSchedule = async (schedule: ScheduleData) => {
    try {
      setSaving(true);

      const payload = {
        ...schedule,
        panelists: normalizePanelists(schedule.panelists),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save schedule."
        );
      }

      await fetchSchedules(false);

      setShowForm(false);

      alert("Research schedule successfully saved!");
    } catch (err) {
      console.error("Save schedule error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to save schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  // SUMMARY COUNTS
  const summary = useMemo(() => {
    return {
      total: schedules.length,
      approved: schedules.filter((s) => s.status === "Approved").length,
      upcoming: schedules.filter((s) => s.status === "Pending").length,
      ongoing: schedules.filter((s) => s.status === "Ongoing").length,
      completed: schedules.filter((s) => s.status === "Completed").length,
    };
  }, [schedules]);

  // CONVERT DATABASE RECORDS INTO CALENDAR EVENTS
  const events = useMemo(() => {
    const colors: Record<string, string> = {
      Pending: "#f59e0b",
      Approved: "#2563eb",
      Ongoing: "#8b5cf6",
      Completed: "#16a34a",
      Cancelled: "#dc2626",
    };

    return schedules
      .map((schedule) => {
        const color = colors[schedule.status] ?? "#64748b";

        const startTime = convertToISOTime(schedule.startTime);
        const endTime = convertToISOTime(schedule.endTime);

        if (!startTime || !endTime || !schedule.date) {
          console.warn("Invalid schedule date or time:", schedule);
          return null;
        }

        return {
          id: String(schedule.id),
          title: `${schedule.activity} - ${schedule.researcher}`,
          start: `${schedule.date}T${startTime}`,
          end: `${schedule.date}T${endTime}`,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            schedule,
          },
        };
      })
      .filter((event) => event !== null);
  }, [schedules]);

  // VIEW SCHEDULE DETAILS
  const handleEventClick = (info: EventClickArg) => {
    const schedule = info.event.extendedProps
      .schedule as CalendarSchedule;

    setSelectedSchedule(schedule);
  };

  return (
    <div className="calendar-page">

      {/* CALENDAR HEADER */}
      <div className="calendar-header">
        <div>
          <h1>Research Scheduling Calendar</h1>
          <p>
            View and organize research activities and defense schedules.
          </p>
        </div>

        <div className="calendar-header-actions">
          <button
            className="calendar-refresh"
            onClick={() => fetchSchedules()}
            disabled={loading}
            type="button"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="calendar-add-button"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <Plus size={18} />
            Add Schedule
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="calendar-message error">
          {error}
          <button onClick={() => fetchSchedules()} type="button">
            Try Again
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="calendar-summary">
        <div className="calendar-stat">
          <span>Total Schedules</span>
          <strong>{summary.total}</strong>
        </div>

        <div className="calendar-stat">
          <span>Approved</span>
          <strong>{summary.approved}</strong>
        </div>

        <div className="calendar-stat">
          <span>Upcoming</span>
          <strong>{summary.upcoming}</strong>
        </div>

        <div className="calendar-stat">
          <span>Ongoing</span>
          <strong>{summary.ongoing}</strong>
        </div>

        <div className="calendar-stat">
          <span>Completed</span>
          <strong>{summary.completed}</strong>
        </div>
      </div>

      {/* STATUS LEGEND */}
      <div className="calendar-legend">
        <span>
          <i className="legend-approved" /> Approved
        </span>

        <span>
          <i className="legend-pending" /> Upcoming
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

      {/* CALENDAR */}
      <div className="calendar-card">
        {loading ? (
          <div className="calendar-message">
            Loading schedules...
          </div>
        ) : error ? (
          <div className="calendar-message error">
            Unable to display calendar schedules.
          </div>
        ) : (
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEvents={3}
            nowIndicator={true}
            weekends={true}
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
              hour12: true,
            }}
          />
        )}
      </div>

      {/* ADD SCHEDULE MODAL */}
      {showForm && (
        <div
          className="calendar-modal-overlay"
          onClick={() => !saving && setShowForm(false)}
        >
          <div
            className="calendar-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <Schedule
              onSubmit={handleAddSchedule}
              onCancel={() => setShowForm(false)}
            />

            {saving && (
              <div className="saving-overlay">
                Saving schedule...
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCHEDULE DETAILS MODAL */}
      {selectedSchedule && (
        <div
          className="calendar-modal-overlay"
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            className="calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-modal-header">
              <div>
                <span className="modal-label">
                  RESEARCH SCHEDULE
                </span>

                <h2>{selectedSchedule.activity}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedSchedule(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="schedule-detail-list">

              <div>
                <span>Research Title</span>
                <strong>{selectedSchedule.researchTitle}</strong>
              </div>

              <div>
                <span>Proponents</span>
                <strong>{selectedSchedule.researcher || "Not specified"}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{selectedSchedule.date}</strong>
              </div>

              <div>
                <span>Time</span>
                <strong>
                  {formatTime(selectedSchedule.startTime)} -{" "}
                  {formatTime(selectedSchedule.endTime)}
                </strong>
              </div>

              <div>
                <span>Venue</span>
                <strong>{selectedSchedule.venue}</strong>
              </div>

              {/* PANELISTS */}
              <div className="schedule-detail-panelists">
                <span>
                  <Users size={16} />
                  Panelists
                </span>

                {selectedSchedule.panelists.length > 0 ? (
                  <ul>
                    {selectedSchedule.panelists.map((name, index) => (
                      <li key={`${selectedSchedule.id}-${index}`}>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <strong>No panelists assigned yet.</strong>
                )}
              </div>

              <div>
                <span>Status</span>

                <strong
                  className={`status-${selectedSchedule.status.toLowerCase()}`}
                >
                  {selectedSchedule.status}
                </strong>
              </div>

            </div>

            <button
              className="modal-done"
              onClick={() => setSelectedSchedule(null)}
              type="button"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

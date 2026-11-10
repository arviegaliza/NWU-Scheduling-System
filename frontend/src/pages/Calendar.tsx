
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type { EventInput, EventClickArg } from "@fullcalendar/core";

import Schedule, {
  type ScheduleData,
} from "../components/schedules/ScheduleForm";

import { socket } from "../socket";

import "../styles/calendar.css";

const SERVER_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${SERVER_URL}/api/schedules`;

// FORMAT DATABASE TIME INTO 12-HOUR AM/PM
const formatTime = (time: string) => {
  if (!time) return "";

  const match = time.trim().match(
    /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
  );

  if (!match) return time;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || hours < 0 || minutes > 59 || minutes < 0) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

export default function Calendar() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleData | null>(null);

  // FETCH SCHEDULES FROM DATABASE
  const fetchSchedules = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load schedules.");
      }

      const data: ScheduleData[] = await response.json();

      setSchedules(data);

      // Update the selected schedule if its details changed.
      setSelectedSchedule((previous) => {
        if (!previous) return null;

        const updatedSchedule = data.find(
          (schedule) =>
            String(schedule.id) === String(previous.id)
        );

        return updatedSchedule ?? null;
      });

    } catch (err) {
      console.error("Fetch schedules error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // INITIAL FETCH AND SOCKET.IO REAL-TIME UPDATES
  useEffect(() => {
    fetchSchedules();

    const handleScheduleUpdate = () => {
      console.log("Schedule update received from backend.");
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

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedule),
      });

      const result = await response.json();

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

  // AUTOMATICALLY DISPLAY ONLY ACTIVE SCHEDULES
  // COMPLETED SCHEDULES REMAIN IN THE DATABASE
  // BUT ARE HIDDEN FROM THE CALENDAR.
  const visibleSchedules = useMemo(() => {
    return schedules.filter(
      (schedule) => schedule.status !== "Completed"
    );
  }, [schedules]);

  // CONVERT DATABASE RECORDS INTO FULLCALENDAR EVENTS
  const events: EventInput[] = useMemo(() => {
    const colors: Record<string, string> = {
      Pending: "#f59e0b",
      Approved: "#2563eb",
      Ongoing: "#8b5cf6",
      Completed: "#16a34a",
      Cancelled: "#dc2626",
    };

    return visibleSchedules.map((schedule) => {
      const color = colors[schedule.status] ?? "#64748b";

      return {
        id: String(schedule.id),
        title: `${schedule.activity} - ${schedule.researcher}`,
        start: `${schedule.date}T${schedule.startTime}`,
        end: `${schedule.date}T${schedule.endTime}`,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          schedule,
        },
      };
    });
  }, [visibleSchedules]);

  // OPEN SCHEDULE DETAILS
  const handleEventClick = (info: EventClickArg) => {
    const schedule = info.event.extendedProps.schedule as ScheduleData;

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
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="calendar-add-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Schedule
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="calendar-summary">

        <div className="calendar-stat">
          <span>Total Schedules</span>
          <strong>{schedules.length}</strong>
        </div>

        <div className="calendar-stat">
          <span>Approved</span>
          <strong>
            {schedules.filter((s) => s.status === "Approved").length}
          </strong>
        </div>

        <div className="calendar-stat">
          <span>Pending</span>
          <strong>
            {schedules.filter((s) => s.status === "Pending").length}
          </strong>
        </div>

        <div className="calendar-stat">
          <span>Ongoing</span>
          <strong>
            {schedules.filter((s) => s.status === "Ongoing").length}
          </strong>
        </div>

        <div className="calendar-stat">
          <span>Completed</span>
          <strong>
            {schedules.filter((s) => s.status === "Completed").length}
          </strong>
        </div>

      </div>

      {/* STATUS LEGEND */}
      <div className="calendar-legend">
        <span>
          <i className="legend-approved" /> Approved
        </span>

        <span>
          <i className="legend-pending" /> Pending
        </span>

        <span>
          <i className="legend-ongoing" /> Ongoing
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
            {error}

            <button onClick={() => fetchSchedules()}>
              Try Again
            </button>
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
                <span>Researcher / Proponent</span>
                <strong>{selectedSchedule.researcher}</strong>
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

              <div>
                <span>Panel Chair</span>
                <strong>
                  {selectedSchedule.panelChair || "Not assigned"}
                </strong>
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
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

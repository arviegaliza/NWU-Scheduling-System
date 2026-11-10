
import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import type { EventInput, EventClickArg } from "@fullcalendar/core";

import Schedule, {
  type ScheduleData,
} from "../components/schedules/ScheduleForm";

import "../styles/calendar.css";

const API_URL = "http://localhost:5000/api/schedules";

export default function Calendar() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleData | null>(null);

  // FETCH SCHEDULES
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load schedules.");
      }

      const data: ScheduleData[] = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

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
        throw new Error(result.message || "Failed to save schedule.");
      }

      await fetchSchedules();

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

  // CONVERT DATABASE RECORDS INTO CALENDAR EVENTS
  const events: EventInput[] = schedules.map((schedule) => {
    const colors: Record<string, string> = {
      Pending: "#f59e0b",
      Approved: "#2563eb",
      Completed: "#16a34a",
      Cancelled: "#dc2626",
    };

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

  // VIEW SCHEDULE DETAILS
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
            onClick={fetchSchedules}
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
          <span>Completed</span>
          <strong>
            {schedules.filter((s) => s.status === "Completed").length}
          </strong>
        </div>

      </div>

      {/* STATUS LEGEND */}
      <div className="calendar-legend">
        <span><i className="legend-approved" /> Approved</span>
        <span><i className="legend-pending" /> Pending</span>
        <span><i className="legend-completed" /> Completed</span>
        <span><i className="legend-cancelled" /> Cancelled</span>
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
            <button onClick={fetchSchedules}>
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
                  {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </strong>
              </div>

              <div>
                <span>Venue</span>
                <strong>{selectedSchedule.venue}</strong>
              </div>

              <div>
                <span>Panel Chair</span>
                <strong>{selectedSchedule.panelChair}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className={`status-${selectedSchedule.status.toLowerCase()}`}>
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

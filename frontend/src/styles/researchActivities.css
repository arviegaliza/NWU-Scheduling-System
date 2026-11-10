
import { useEffect, useState } from "react";
import { Search, Trash2, RefreshCw, Pencil } from "lucide-react";
import Schedule, {
  type ScheduleData,
} from "../components/schedules/ScheduleForm";
import "../styles/manageSchedules.css";

interface ScheduleRecord extends ScheduleData {
  id: number;
}

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/schedules`;

// Strict 12-hour time format: 10:00 AM, 1:30 PM, etc.
const createDateTime = (
  dateValue: string,
  timeValue: string
): Date | null => {
  const dateParts = dateValue.split("-").map(Number);

  if (
    dateParts.length !== 3 ||
    dateParts.some(Number.isNaN)
  ) {
    return null;
  }

  const timeMatch = timeValue.trim().match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const [year, month, day] = dateParts;

  const result = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  );

  // Reject invalid calendar dates.
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
};

// Automatically determine the schedule status.
const getEffectiveStatus = (
  schedule: ScheduleRecord,
  now: Date
): string => {
  const savedStatus = String(schedule.status);

  // Preserve manually cancelled or completed schedules.
  if (
    savedStatus.toLowerCase() === "cancelled" ||
    savedStatus.toLowerCase() === "completed"
  ) {
    return savedStatus;
  }

  const start = createDateTime(
    schedule.date,
    schedule.startTime
  );

  const end = createDateTime(
    schedule.date,
    schedule.endTime
  );

  // Keep saved status if date/time is invalid.
  if (!start || !end || end <= start) {
    return savedStatus;
  }

  if (now >= end) {
    return "Completed";
  }

  if (now >= start && now < end) {
    return "Ongoing";
  }

  return savedStatus;
};

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleRecord | null>(null);

  const [saving, setSaving] = useState(false);

  // Current local time.
  const [now, setNow] = useState(() => new Date());

  // Update displayed statuses every 15 seconds.
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  // Fetch schedules from backend.
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to retrieve schedules.");
      }

      const data = await response.json();

      setSchedules(data);
    } catch (err) {
      console.error("Fetch schedules error:", err);

      setError(
        "Unable to load schedules. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Update schedule.
  const handleUpdateSchedule = async (
    updatedSchedule: ScheduleData
  ) => {
    if (!editingSchedule) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/${editingSchedule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSchedule),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update schedule."
        );
      }

      await fetchSchedules();

      setEditingSchedule(null);

      alert("Schedule updated successfully!");
    } catch (err) {
      console.error("Update schedule error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update schedule. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete schedule.
  const deleteSchedule = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this schedule?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule.");
      }

      setSchedules((previous) =>
        previous.filter((schedule) => schedule.id !== id)
      );
    } catch (err) {
      console.error("Delete schedule error:", err);

      alert("Unable to delete schedule. Please try again.");
    }
  };

  // Search and filter using automatically calculated status.
  const filteredSchedules = schedules.filter((schedule) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      schedule.researchTitle.toLowerCase().includes(searchValue) ||
      schedule.researcher.toLowerCase().includes(searchValue);

    const effectiveStatus = getEffectiveStatus(schedule, now);

    const matchesFilter =
      filter === "All" || effectiveStatus === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container manage-schedules-page">
      <div className="page-heading">
        <div>
          <h1>Manage Schedules</h1>
          <p>
            View, search, edit, and manage existing research schedules.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={fetchSchedules}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search research title or researcher..."
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Research Title</th>
                <th>Researcher</th>
                <th>Activity</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>Loading schedules...</td>
                </tr>
              ) : filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => {
                  const effectiveStatus = getEffectiveStatus(
                    schedule,
                    now
                  );

                  return (
                    <tr key={schedule.id}>
                      <td>{schedule.researchTitle}</td>

                      <td>{schedule.researcher}</td>

                      <td>{schedule.activity}</td>

                      <td>{schedule.date}</td>

                      <td>
                        {schedule.startTime} - {schedule.endTime}
                      </td>

                      <td>{schedule.venue}</td>

                      <td>
                        <span
                          className={`status ${effectiveStatus.toLowerCase()}`}
                        >
                          {effectiveStatus === "Ongoing" && (
                            <span className="ongoing-indicator" />
                          )}

                          {effectiveStatus}
                        </span>
                      </td>

                      <td>
                        <div className="schedule-actions">
                          <button
                            type="button"
                            className="edit-icon"
                            onClick={() =>
                              setEditingSchedule(schedule)
                            }
                            title="Edit schedule"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="danger-icon"
                            onClick={() =>
                              deleteSchedule(schedule.id)
                            }
                            title="Delete schedule"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>
                    No schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SCHEDULE MODAL */}
      {editingSchedule && (
        <div
          className="schedule-edit-overlay"
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              setEditingSchedule(null);
            }
          }}
        >
          <div className="schedule-edit-modal">
            <div className="schedule-edit-header">
              <div>
                <h2>Edit Schedule</h2>
                <p>
                  Update the details of this research schedule.
                </p>
              </div>

              <button
                type="button"
                className="schedule-edit-close"
                onClick={() => setEditingSchedule(null)}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <Schedule
              key={editingSchedule.id}
              initialData={editingSchedule}
              onSubmit={handleUpdateSchedule}
              onCancel={() => setEditingSchedule(null)}
            />

            {saving && (
              <div className="schedule-saving-overlay">
                Saving changes...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

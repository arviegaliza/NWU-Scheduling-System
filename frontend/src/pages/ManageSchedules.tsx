
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

// Convert a date and time into a local JavaScript Date.
const createDateTime = (dateValue: string, timeValue: string): Date | null => {
  const dateParts = dateValue.split("-").map(Number);

  if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) {
    return null;
  }

  const timeMatch = timeValue.trim().match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  );

  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const period = timeMatch[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  if (hours > 23 || minutes > 59) return null;

  const [year, month, day] = dateParts;

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

// Determine the status using the actual current date and time.
const getEffectiveStatus = (
  schedule: ScheduleRecord,
  now: Date
): string => {
  const savedStatus = String(schedule.status);

  if (savedStatus === "Cancelled" || savedStatus === "Completed") {
    return savedStatus;
  }

  const start = createDateTime(schedule.date, schedule.startTime);
  const end = createDateTime(schedule.date, schedule.endTime);

  // Keep the saved status if the date or time cannot be interpreted.
  if (!start || !end) return savedStatus;

  if (now >= end) return "Completed";

  if (now >= start && now < end) return "Ongoing";

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

  // Automatically refresh the displayed schedule status.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

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

  const handleUpdateSchedule = async (updatedSchedule: ScheduleData) => {
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
        throw new Error(data.message || "Failed to update schedule.");
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

  const deleteSchedule = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
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
          <p>View, search, edit, and manage existing research schedules.</p>
        </div>

        <button
          className="secondary-button"
          onClick={fetchSchedules}
          disabled={loading}
        >
          <RefreshCw size={17} />
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

        {error && <div className="error-message">{error}</div>}

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
                            onClick={() => setEditingSchedule(schedule)}
                            title="Edit schedule"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="danger-icon"
                            onClick={() => deleteSchedule(schedule.id)}
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
                  <td colSpan={8}>No schedules found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingSchedule && (
        <div className="schedule-edit-overlay">
          <div className="schedule-edit-modal">
            <div className="schedule-edit-header">
              <div>
                <h2>Edit Schedule</h2>
                <p>Update the details of this research schedule.</p>
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

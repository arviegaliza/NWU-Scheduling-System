
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

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleRecord | null>(null);
  const [saving, setSaving] = useState(false);

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

    const matchesFilter =
      filter === "All" || schedule.status === filter;

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
                filteredSchedules.map((schedule) => (
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
                        className={`status ${schedule.status.toLowerCase()}`}
                      >
                        {schedule.status}
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
                ))
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

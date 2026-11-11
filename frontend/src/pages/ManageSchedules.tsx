
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Trash2,
  RefreshCw,
  Pencil,
  Ban,
} from "lucide-react";

import Schedule, {
  type ScheduleData,
} from "../components/schedules/ScheduleForm";

import { socket } from "../socket";
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
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // FETCH SCHEDULES
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
      console.error("Fetch schedules error:", err);
      setError(
        "Unable to load schedules. Please check your backend connection."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // INITIAL LOAD AND REAL-TIME UPDATES
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

  // CHECK IF SCHEDULE CAN STILL BE EDITED OR CANCELLED
  const canManageSchedule = (status: string) => {
    return status === "Pending" || status === "Approved";
  };

  // UPDATE SCHEDULE
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
          body: JSON.stringify({
            ...updatedSchedule,
            status: editingSchedule.status,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update schedule."
        );
      }

      await fetchSchedules(false);
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

  // CANCEL SCHEDULE
  const handleCancelSchedule = async (
    schedule: ScheduleRecord
  ) => {
    if (!canManageSchedule(schedule.status)) {
      alert("This schedule can no longer be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel this schedule?\n\n${schedule.researchTitle}`
    );

    if (!confirmed) return;

    try {
      setCancellingId(schedule.id);
      setError("");

      const response = await fetch(
        `${API_URL}/${schedule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...schedule,
            status: "Cancelled",
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to cancel schedule."
        );
      }

      await fetchSchedules(false);

      alert("Schedule cancelled successfully!");
    } catch (err) {
      console.error("Cancel schedule error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to cancel schedule. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // DELETE SCHEDULE
  const deleteSchedule = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this schedule?"
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

      await fetchSchedules(false);
    } catch (err) {
      console.error("Delete schedule error:", err);
      alert("Unable to delete schedule. Please try again.");
    }
  };

  // SEARCH AND FILTER
  const filteredSchedules = schedules.filter((schedule) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      String(schedule.researchTitle || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(schedule.researcher || "")
        .toLowerCase()
        .includes(searchValue);

    const matchesFilter =
      filter === "All" || schedule.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container manage-schedules-page">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <h1>Manage Schedules</h1>
          <p>
            View, search, edit, cancel, and manage existing research schedules.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => fetchSchedules()}
          disabled={loading}
          type="button"
        >
          <RefreshCw
            size={17}
            className={loading ? "refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="content-card">

        {/* TOOLBAR */}
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
          <div className="error-message">{error}</div>
        )}

        {/* SCHEDULE TABLE */}
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
                  const status = String(
                    schedule.status || "Pending"
                  );

                  const canManage = canManageSchedule(status);

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
                          className={`status ${status.toLowerCase()}`}
                        >
                          {status === "Ongoing" && (
                            <span className="ongoing-indicator" />
                          )}
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="schedule-actions">

                          {canManage && (
                            <>
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
                                className="cancel-icon"
                                onClick={() =>
                                  handleCancelSchedule(schedule)
                                }
                                disabled={
                                  cancellingId === schedule.id
                                }
                                title="Cancel schedule"
                              >
                                <Ban size={17} />
                              </button>
                            </>
                          )}

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
                  <td colSpan={8}>No schedules found.</td>
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

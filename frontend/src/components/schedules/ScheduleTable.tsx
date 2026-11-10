
import { useMemo, useState } from "react";
import type { ScheduleData } from "./ScheduleForm";

interface ScheduleTableProps {
  schedules: ScheduleData[];
  onView: (schedule: ScheduleData) => void;
  onEdit: (schedule: ScheduleData) => void;
  onDelete: (schedule: ScheduleData) => void;
}

export default function ScheduleTable({
  schedules,
  onView,
  onEdit,
  onDelete,
}: ScheduleTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        schedule.researchTitle.toLowerCase().includes(keyword) ||
        schedule.researcher.toLowerCase().includes(keyword) ||
        schedule.activity.toLowerCase().includes(keyword) ||
        schedule.venue.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || schedule.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [schedules, search, statusFilter]);

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="content-card schedule-table-card">
      <div className="schedule-table-toolbar">
        <input
          type="search"
          placeholder="Search title, researcher, activity, venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Research Title</th>
              <th>Researcher</th>
              <th>Activity</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="research-title-cell">
                    {schedule.researchTitle}
                  </td>
                  <td>{schedule.researcher}</td>
                  <td>{schedule.activity}</td>
                  <td>{formatDate(schedule.date)}</td>
                  <td>
                    {formatTime(schedule.startTime)} –{" "}
                    {formatTime(schedule.endTime)}
                  </td>
                  <td>{schedule.venue}</td>
                  <td>
                    <span
                      className={`schedule-status ${schedule.status.toLowerCase()}`}
                    >
                      {schedule.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => onView(schedule)}
                        title="View schedule"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(schedule)}
                        title="Edit schedule"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-action"
                        onClick={() => onDelete(schedule)}
                        title="Delete schedule"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="empty-table">
                  No research schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="schedule-table-footer">
        Showing {filteredSchedules.length} of {schedules.length} schedules
      </div>
    </div>
  );
}

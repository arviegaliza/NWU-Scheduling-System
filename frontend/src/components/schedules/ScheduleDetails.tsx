
import type { ScheduleData } from "./ScheduleForm";

interface ScheduleDetailsProps {
  schedule: ScheduleData;
  onClose: () => void;
  onEdit: (schedule: ScheduleData) => void;
}

export default function ScheduleDetails({
  schedule,
  onClose,
  onEdit,
}: ScheduleDetailsProps) {

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "Not specified";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="schedule-details-card">

      <div className="details-header">
        <div>
          <span className="details-label">RESEARCH SCHEDULE</span>
          <h2>Schedule Details</h2>
          <p>Complete information about this research activity.</p>
        </div>

        <span className={`schedule-status ${schedule.status.toLowerCase()}`}>
          {schedule.status}
        </span>
      </div>

      <div className="details-section">
        <h3>Research Information</h3>

        <div className="details-grid">
          <div className="details-item full-width">
            <span>Research Title</span>
            <strong>{schedule.researchTitle}</strong>
          </div>

          <div className="details-item">
            <span>Researcher / Proponent</span>
            <strong>{schedule.researcher}</strong>
          </div>

          <div className="details-item">
            <span>Research Activity</span>
            <strong>{schedule.activity}</strong>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h3>Schedule Information</h3>

        <div className="details-grid">
          <div className="details-item full-width">
            <span>Schedule Date</span>
            <strong>{formatDate(schedule.date)}</strong>
          </div>

          <div className="details-item">
            <span>Start Time</span>
            <strong>{formatTime(schedule.startTime)}</strong>
          </div>

          <div className="details-item">
            <span>End Time</span>
            <strong>{formatTime(schedule.endTime)}</strong>
          </div>

          <div className="details-item">
            <span>Venue</span>
            <strong>{schedule.venue}</strong>
          </div>

          <div className="details-item">
            <span>Panel Chair</span>
            <strong>{schedule.panelChair}</strong>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h3>Schedule Status</h3>

        <div className="details-item">
          <span>Current Status</span>
          <strong>{schedule.status}</strong>
        </div>
      </div>

      <div className="details-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
        >
          Close
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={() => onEdit(schedule)}
        >
          Edit Schedule
        </button>
      </div>

    </div>
  );
}

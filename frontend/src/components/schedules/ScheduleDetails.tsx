
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

  // FORMAT DATE
  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // FORMAT TIME
  const formatTime = (time: string) => {
    if (!time) return "Not specified";

    const normalized = time.trim();

    // Handle 12-hour format, such as 9:00 AM.
    const twelveHourMatch = normalized.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (twelveHourMatch) {
      let hours = Number(twelveHourMatch[1]);
      const minutes = Number(twelveHourMatch[2]);
      const period = twelveHourMatch[3].toUpperCase();

      if (hours < 1 || hours > 12 || minutes > 59) {
        return "Not specified";
      }

      if (period === "AM" && hours === 12) hours = 0;
      if (period === "PM" && hours !== 12) hours += 12;

      return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
        "en-PH",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }

    // Handle 24-hour format, such as 09:00 or 09:00:00.
    const twentyFourHourMatch = normalized.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?$/
    );

    if (!twentyFourHourMatch) return "Not specified";

    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (hours > 23 || minutes > 59) {
      return "Not specified";
    }

    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
      "en-PH",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // GET PANELISTS
  const getPanelists = (): string[] => {
    if (!Array.isArray(schedule.panelists)) {
      return [];
    }

    return schedule.panelists
      .map((name) => name.trim())
      .filter(Boolean);
  };

  const panelistNames = getPanelists();

  return (
    <div className="schedule-details-card">

      {/* HEADER */}
      <div className="details-header">
        <div>
          <span className="details-label">
            RESEARCH SCHEDULE
          </span>

          <h2>Schedule Details</h2>

          <p>
            Complete information about this research activity.
          </p>
        </div>

        <span
          className={`schedule-status ${schedule.status.toLowerCase()}`}
        >
          {schedule.status}
        </span>
      </div>

      {/* RESEARCH INFORMATION */}
      <div className="details-section">
        <h3>Research Information</h3>

        <div className="details-grid">

          <div className="details-item full-width">
            <span>Research Title</span>
            <strong>
              {schedule.researchTitle || "Not specified"}
            </strong>
          </div>

          <div className="details-item">
            <span>Proponents</span>
            <strong>
              {schedule.researcher || "Not specified"}
            </strong>
          </div>

          <div className="details-item">
            <span>Research Activity</span>
            <strong>
              {schedule.activity || "Not specified"}
            </strong>
          </div>

        </div>
      </div>

      {/* SCHEDULE INFORMATION */}
      <div className="details-section">
        <h3>Schedule Information</h3>

        <div className="details-grid">

          <div className="details-item full-width">
            <span>Schedule Date</span>
            <strong>
              {formatDate(schedule.date)}
            </strong>
          </div>

          <div className="details-item">
            <span>Start Time</span>
            <strong>
              {formatTime(schedule.startTime)}
            </strong>
          </div>

          <div className="details-item">
            <span>End Time</span>
            <strong>
              {formatTime(schedule.endTime)}
            </strong>
          </div>

          <div className="details-item full-width">
            <span>Venue</span>
            <strong>
              {schedule.venue || "Not specified"}
            </strong>
          </div>

        </div>
      </div>

      {/* PANELISTS */}
      <div className="details-section">
        <h3>Panelists</h3>

        {panelistNames.length > 0 ? (
          <div className="details-panelists">
            {panelistNames.map((name, index) => (
              <div
                className="details-panelist-item"
                key={`${schedule.id ?? "schedule"}-${index}`}
              >
                <span className="panelist-number">
                  {index + 1}
                </span>

                <strong>{name}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="details-item">
            <strong className="details-empty">
              No panelists assigned yet.
            </strong>
          </div>
        )}
      </div>

      {/* SCHEDULE STATUS */}
      <div className="details-section">
        <h3>Schedule Status</h3>

        <div className="details-item">
          <span>Current Status</span>

          <strong>
            {schedule.status}
          </strong>
        </div>
      </div>

      {/* ACTION BUTTONS */}
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

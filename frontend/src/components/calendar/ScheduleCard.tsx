
interface ScheduleCardProps {
  title: string;
  researcher: string;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ScheduleCard({
  title,
  researcher,
  activity,
  date,
  startTime,
  endTime,
  venue,
  status,
  onView,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  return (
    <div className="schedule-card">
      <div className="schedule-card-header">
        <div>
          <span className="schedule-activity">{activity}</span>
          <h3>{title}</h3>
        </div>

        <span className={`schedule-status ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="schedule-card-details">
        <p><strong>Researcher:</strong> {researcher}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {startTime} – {endTime}</p>
        <p><strong>Venue:</strong> {venue}</p>
      </div>

      <div className="schedule-card-actions">
        {onView && <button onClick={onView}>View</button>}
        {onEdit && <button onClick={onEdit}>Edit</button>}
        {onDelete && <button onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}

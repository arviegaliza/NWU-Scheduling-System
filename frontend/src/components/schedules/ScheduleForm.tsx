
import { useEffect, useState } from "react";

export type ScheduleStatus =
  | "Pending"
  | "Approved"
  | "Completed"
  | "Cancelled";

export interface ScheduleData {
  id?: number | string;
  researchTitle: string;
  researcher: string;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  panelChair: string;
  status: ScheduleStatus;
}

interface ScheduleFormProps {
  initialData?: ScheduleData | null;
  onSubmit: (data: ScheduleData) => void;
  onCancel: () => void;
}

const emptyForm: ScheduleData = {
  researchTitle: "",
  researcher: "",
  activity: "Title Defense",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  panelChair: "",
  status: "Pending",
};

export default function ScheduleForm({
  initialData,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [form, setForm] = useState<ScheduleData>(
    initialData ?? emptyForm
  );

  useEffect(() => {
    setForm(initialData ?? emptyForm);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.endTime <= form.startTime) {
      alert("End time must be later than start time.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="schedule-form-card">
      <div className="form-heading">
        <h2>
          {initialData ? "Edit Research Schedule" : "Create Research Schedule"}
        </h2>
        <p>Provide the complete details of the research activity.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Research Title</label>
            <input
              name="researchTitle"
              value={form.researchTitle}
              onChange={handleChange}
              placeholder="Enter research title"
              required
            />
          </div>

          <div className="form-group">
            <label>Researcher / Proponent</label>
            <input
              name="researcher"
              value={form.researcher}
              onChange={handleChange}
              placeholder="Enter researcher name"
              required
            />
          </div>

          <div className="form-group">
            <label>Research Activity</label>
            <select
              name="activity"
              value={form.activity}
              onChange={handleChange}
            >
              <option>Title Defense</option>
              <option>Proposal Defense</option>
              <option>Final Defense</option>
              <option>Research Consultation</option>
              <option>Research Presentation</option>
            </select>
          </div>

          <div className="form-group">
            <label>Schedule Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Enter venue"
              required
            />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Panel Chair</label>
            <input
              name="panelChair"
              value={form.panelChair}
              onChange={handleChange}
              placeholder="Enter panel chair"
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit" className="primary-button">
            {initialData ? "Update Schedule" : "Save Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}

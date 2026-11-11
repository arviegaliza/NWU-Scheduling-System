
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export type ScheduleStatus =
  | "Pending"
  | "Approved"
  | "Ongoing"
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

// FORMAT TIME FOR DISPLAY
function formatTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour24 = Number(hours);

  if (
    !Number.isInteger(hour24) ||
    hour24 < 0 ||
    hour24 > 23 ||
    !minutes
  ) {
    return "";
  }

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minutes.slice(0, 2)} ${period}`;
}

// TIME INPUT COMPONENT
interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TimeInput({ label, value, onChange }: TimeInputProps) {
  return (
    <div className="form-group">
      <label>{label}</label>

      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />

      {value && (
        <small className="time-preview">
          Selected time: {formatTime(value)}
        </small>
      )}
    </div>
  );
}

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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.startTime || !form.endTime) {
      alert("Please select both start time and end time.");
      return;
    }

    if (form.endTime <= form.startTime) {
      alert("End time must be later than start time.");
      return;
    }

    const submittedForm: ScheduleData = {
      ...form,
      status: initialData?.status ?? "Pending",
    };

    onSubmit(submittedForm);
  };

  return (
    <div className="schedule-form-card">

      <div className="form-heading">
        <h2>
          {initialData
            ? "Edit Research Schedule"
            : "Create Research Schedule"}
        </h2>

        <p>
          Provide the complete details of the research activity.
        </p>
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

          <TimeInput
            label="Start Time"
            value={form.startTime}
            onChange={(value) =>
              setForm((previous) => ({
                ...previous,
                startTime: value,
              }))
            }
          />

          <TimeInput
            label="End Time"
            value={form.endTime}
            onChange={(value) =>
              setForm((previous) => ({
                ...previous,
                endTime: value,
              }))
            }
          />

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

        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            {initialData
              ? "Update Schedule"
              : "Save Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}

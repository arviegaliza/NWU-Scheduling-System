
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

// Converts 24-hour HH:mm to a display-friendly 12-hour time.
function to12Hour(value: string) {
  if (!value) {
    return { hour: "", minute: "", period: "AM" };
  }

  const [hourText, minute] = value.split(":");
  const hour24 = Number(hourText);

  if (
    !Number.isInteger(hour24) ||
    hour24 < 0 ||
    hour24 > 23 ||
    !minute
  ) {
    return { hour: "", minute: "", period: "AM" };
  }

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return {
    hour: String(hour12),
    minute,
    period,
  };
}

// Converts 12-hour selections to backend-compatible HH:mm.
function to24Hour(hour: string, minute: string, period: string) {
  if (!hour || !minute) return "";

  let hour24 = Number(hour);

  if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  } else if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  }

  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TimeInput({ label, value, onChange }: TimeInputProps) {
  const parsed = to12Hour(value);

  const handleTimeChange = (
    hour: string,
    minute: string,
    period: string
  ) => {
    onChange(to24Hour(hour, minute, period));
  };

  return (
    <div className="form-group">
      <label>{label}</label>

      <div className="time-select-group">
        <select
          aria-label={`${label} hour`}
          value={parsed.hour}
          onChange={(e) =>
            handleTimeChange(e.target.value, parsed.minute, parsed.period)
          }
          required
        >
          <option value="">Hour</option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map(
            (hour) => (
              <option key={hour} value={String(hour)}>
                {hour}
              </option>
            )
          )}
        </select>

        <select
          aria-label={`${label} minute`}
          value={parsed.minute}
          onChange={(e) =>
            handleTimeChange(parsed.hour, e.target.value, parsed.period)
          }
          required
        >
          <option value="">Min</option>
          {Array.from({ length: 60 }, (_, index) =>
            String(index).padStart(2, "0")
          ).map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>

        <select
          aria-label={`${label} AM or PM`}
          value={parsed.period}
          onChange={(e) =>
            handleTimeChange(parsed.hour, parsed.minute, e.target.value)
          }
          required
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
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

    onSubmit(form);
  };

  return (
    <div className="schedule-form-card">
      <div className="form-heading">
        <h2>
          {initialData
            ? "Edit Research Schedule"
            : "Create Research Schedule"}
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

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>

              {form.status === "Ongoing" && (
                <option value="Ongoing" disabled>
                  Ongoing (Automatic)
                </option>
              )}

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

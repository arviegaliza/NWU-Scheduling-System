
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
  panelists: string[];
  status: ScheduleStatus;
}

interface ScheduleFormProps {
  initialData?: ScheduleData | null;
  onSubmit: (data: ScheduleData) => void;
  onCancel: () => void;
}

type FormValues = Omit<ScheduleData, "panelists"> & {
  panelists: string;
};

const emptyForm: FormValues = {
  researchTitle: "",
  researcher: "",
  activity: "Title Defense",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  panelists: "",
  status: "Pending",
};

// Convert panelist data into a textarea-friendly string.
function normalizePanelists(
  panelists?: string[] | string | null
): string {
  if (!panelists) return "";

  if (Array.isArray(panelists)) {
    return panelists.join("\n");
  }

  const trimmed = panelists.trim();

  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed.join("\n");
    }
  } catch {
    // Existing comma-separated data is supported.
  }

  return trimmed;
}

// Convert textarea input into an array of names.
function parsePanelists(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[,\n;]/)
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ];
}

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

function TimeInput({
  label,
  value,
  onChange,
}: TimeInputProps) {
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
  const [form, setForm] = useState<FormValues>({
    ...emptyForm,
    ...initialData,
    panelists: normalizePanelists(initialData?.panelists),
  });

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...initialData,
      panelists: normalizePanelists(initialData?.panelists),
    });
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      panelists: parsePanelists(form.panelists),
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

          {/* RESEARCH TITLE */}
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

          {/* PROPONENTS */}
          <div className="form-group">
            <label>Proponents</label>

            <input
              name="researcher"
              value={form.researcher}
              onChange={handleChange}
              placeholder="Enter proponents' names"
              required
            />
          </div>

          {/* RESEARCH ACTIVITY */}
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

          {/* SCHEDULE DATE */}
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

          {/* VENUE */}
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

          {/* START TIME */}
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

          {/* END TIME */}
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

          {/* PANELISTS */}
          <div className="form-group full-width">
            <label>Panelists</label>

            <textarea
              name="panelists"
              value={form.panelists}
              onChange={handleChange}
              placeholder={
                "Enter panelist names, one per line.\nExample:\nProf. Juan Dela Cruz\nProf. Maria Santos"
              }
              rows={4}
            />

            <small className="time-preview">
              Enter multiple panelist names separated by commas
              or by placing each name on a new line.
            </small>
          </div>

        </div>

        {/* FORM ACTIONS */}
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

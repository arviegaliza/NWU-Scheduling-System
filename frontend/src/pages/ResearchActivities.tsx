
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";

import "../styles/researchActivities.css";

interface ResearchActivity {
  id: number;
  researchTitle: string;
  researcher: string;
  department: string;
  category: string;
  status: "Ongoing" | "Completed" | "For Scheduling";
}

type ResearchFormData = Omit<ResearchActivity, "id">;

const API_URL = "http://localhost:5000/api/research-activities";

const emptyForm: ResearchFormData = {
  researchTitle: "",
  researcher: "",
  department: "",
  category: "Faculty Research",
  status: "For Scheduling",
};

export default function ResearchActivities() {
  const [activities, setActivities] = useState<ResearchActivity[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ResearchFormData>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // FETCH RESEARCH ACTIVITIES
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to retrieve research activities.");
      }

      const data: ResearchActivity[] = await response.json();
      setActivities(data);
    } catch (err) {
      console.error("Fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // UPDATE FORM FIELDS
  const updateField = (
    field: keyof ResearchFormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  };

  // ADD OR UPDATE RESEARCH
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save research activity."
        );
      }

      await fetchActivities();
      resetForm();

      alert(
        isEditing
          ? "Research activity updated successfully!"
          : "Research activity added successfully!"
      );
    } catch (err) {
      console.error("Save error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to save research activity."
      );
    } finally {
      setSaving(false);
    }
  };

  // EDIT RESEARCH
  const handleEdit = (activity: ResearchActivity) => {
    setForm({
      researchTitle: activity.researchTitle,
      researcher: activity.researcher,
      department: activity.department,
      category: activity.category,
      status: activity.status,
    });

    setEditingId(activity.id);
    setShowForm(true);
  };

  // DELETE RESEARCH
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this research activity?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete research."
        );
      }

      setActivities((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Delete error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete research."
      );
    }
  };

  // SEARCH AND FILTER
  const filteredActivities = activities.filter((item) => {
    const searchValue = search.toLowerCase();

    const matchesSearch = [
      item.researchTitle,
      item.researcher,
      item.department,
      item.category,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue);

    const matchesFilter =
      filter === "All" || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <h1>Research Activities</h1>
          <p>
            Manage research titles, researchers, and research activities.
          </p>
        </div>

        <div className="research-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={fetchActivities}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Research
          </button>
        </div>
      </div>

      {/* RESEARCH RECORDS */}
      <div className="content-card">

        <div className="research-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search research title, researcher, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="For Scheduling">For Scheduling</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>

          <span className="research-record-count">
            {filteredActivities.length} research records
          </span>
        </div>

        {error && (
          <div className="research-error">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Research Title</th>
                <th>Researcher</th>
                <th>Department</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-table">
                    Loading research activities...
                  </td>
                </tr>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((item) => (
                  <tr key={item.id}>
                    <td className="research-title-cell">
                      {item.researchTitle}
                    </td>

                    <td>{item.researcher}</td>
                    <td>{item.department}</td>
                    <td>{item.category}</td>

                    <td>
                      <span
                        className={`schedule-status ${
                          item.status === "For Scheduling"
                            ? "pending"
                            : item.status.toLowerCase()
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="research-table-actions">
                        <button
                          type="button"
                          className="edit-action"
                          onClick={() => handleEdit(item)}
                          title="Edit research"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-action"
                          onClick={() => handleDelete(item.id)}
                          title="Delete research"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table">
                    No research activities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CENTERED ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="research-modal-overlay"
          onClick={() => {
            if (!saving) resetForm();
          }}
        >
          <div
            className="research-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="research-modal-header">
              <div>
                <span className="research-modal-label">
                  RESEARCH MANAGEMENT
                </span>

                <h2>
                  {editingId !== null
                    ? "Edit Research"
                    : "Add New Research"}
                </h2>

                <p>
                  Enter the research information below.
                </p>
              </div>

              <button
                type="button"
                className="research-modal-close"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSubmit}>
              <div className="research-modal-body">

                <div className="research-form-group full-width">
                  <label>Research Title</label>

                  <input
                    value={form.researchTitle}
                    onChange={(e) =>
                      updateField("researchTitle", e.target.value)
                    }
                    placeholder="Enter complete research title"
                    required
                  />
                </div>

                <div className="research-form-grid">

                  <div className="research-form-group">
                    <label>Researcher / Proponent</label>

                    <input
                      value={form.researcher}
                      onChange={(e) =>
                        updateField("researcher", e.target.value)
                      }
                      placeholder="Enter researcher name"
                      required
                    />
                  </div>

                  <div className="research-form-group">
                    <label>Department</label>

                    <input
                      value={form.department}
                      onChange={(e) =>
                        updateField("department", e.target.value)
                      }
                      placeholder="Enter department"
                      required
                    />
                  </div>

                  <div className="research-form-group">
                    <label>Research Category</label>

                    <select
                      value={form.category}
                      onChange={(e) =>
                        updateField("category", e.target.value)
                      }
                    >
                      <option>Faculty Research</option>
                      <option>Student Research</option>
                      <option>Institutional Research</option>
                      <option>Collaborative Research</option>
                    </select>
                  </div>

                  <div className="research-form-group">
                    <label>Research Status</label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value as ResearchActivity["status"]
                        )
                      }
                    >
                      <option value="For Scheduling">
                        For Scheduling
                      </option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="research-modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Research"
                      : "Save Research"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

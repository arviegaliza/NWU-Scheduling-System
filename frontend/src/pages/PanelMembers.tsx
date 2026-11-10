
import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";

interface PanelMember {
  id: number;
  name: string;
  department: string;
  specialization: string;
  role: string;
  email: string;
}

export default function PanelMembers() {
  const [members, setMembers] = useState<PanelMember[]>([
    {
      id: 1,
      name: "Dr. Juan Reyes",
      department: "Business Education",
      specialization: "Financial Management",
      role: "Chairperson",
      email: "juan@example.com",
    },
    {
      id: 2,
      name: "Prof. Maria Cruz",
      department: "Information Technology",
      specialization: "Information Systems",
      role: "Panel Member",
      email: "maria@example.com",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    department: "",
    specialization: "",
    role: "Panel Member",
    email: "",
  });

  const addMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMembers((previous) => [
      ...previous,
      { id: Date.now(), ...form },
    ]);

    setForm({
      name: "",
      department: "",
      specialization: "",
      role: "Panel Member",
      email: "",
    });

    setShowForm(false);
  };

  const filtered = members.filter((member) =>
    `${member.name} ${member.department} ${member.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Panel Members</h1>
          <p>Manage research panelists and their specializations.</p>
        </div>

        <button className="primary-button" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Panel Member
        </button>
      </div>

      {showForm && (
        <div className="content-card form-card">
          <h2>New Panel Member</h2>

          <form onSubmit={addMember}>
            <div className="form-grid">
              <label>
                Full Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Department
                <input
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </label>

              <label>
                Specialization
                <input
                  required
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                />
              </label>

              <label>
                Academic Role
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option>Chairperson</option>
                  <option>Panel Member</option>
                  <option>Research Adviser</option>
                  <option>External Evaluator</option>
                </select>
              </label>

              <label className="full-width">
                Email Address
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="content-card">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search panel members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Role</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td><strong>{member.name}</strong></td>
                  <td>{member.department}</td>
                  <td>{member.specialization}</td>
                  <td>{member.role}</td>
                  <td>{member.email}</td>
                  <td>
                    <button
                      className="danger-icon"
                      onClick={() => setMembers((previous) =>
                        previous.filter((m) => m.id !== member.id)
                      )}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr><td colSpan={6}>No panel members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

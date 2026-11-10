
import { useMemo, useState } from "react";
import { Download, FileBarChart, CalendarDays } from "lucide-react";

const reportData = [
  {
    id: 1,
    title: "Research Proposal Defense",
    researcher: "Juan Dela Cruz",
    date: "November 12, 2026",
    status: "Confirmed",
  },
  {
    id: 2,
    title: "Research Title Defense",
    researcher: "Maria Santos",
    date: "November 13, 2026",
    status: "Pending",
  },
  {
    id: 3,
    title: "Final Research Defense",
    researcher: "Pedro Garcia",
    date: "November 16, 2026",
    status: "Confirmed",
  },
  {
    id: 4,
    title: "Research Presentation",
    researcher: "Ana Reyes",
    date: "November 18, 2026",
    status: "Completed",
  },
];

export default function Reports() {
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(
    () =>
      reportData.filter((item) =>
        filter === "All" || item.status === filter
      ),
    [filter]
  );

  const confirmed = reportData.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pending = reportData.filter(
    (item) => item.status === "Pending"
  ).length;

  const completed = reportData.filter(
    (item) => item.status === "Completed"
  ).length;

  const exportCSV = () => {
    const headers = [
      "Research Activity",
      "Researcher",
      "Date",
      "Status",
    ];

    const rows = filtered.map((item) => [
      item.title,
      item.researcher,
      item.date,
      item.status,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [
      headers,
      ...rows,
    ].map((row) => row.map(escapeCSV).join(",")).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "research-scheduling-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Scheduling Reports</h1>
          <p>Monitor and evaluate research scheduling activities.</p>
        </div>

        <button className="primary-button" onClick={exportCSV}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <FileBarChart size={25} />
          <h2>{reportData.length}</h2>
          <p>Total Activities</p>
        </div>

        <div className="stat-card">
          <CalendarDays size={25} />
          <h2>{confirmed}</h2>
          <p>Confirmed</p>
        </div>

        <div className="stat-card">
          <CalendarDays size={25} />
          <h2>{pending}</h2>
          <p>Pending</p>
        </div>

        <div className="stat-card">
          <CalendarDays size={25} />
          <h2>{completed}</h2>
          <p>Completed</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-heading">
          <div>
            <h2>Research Scheduling Summary</h2>
            <p>Filter and export scheduling records.</p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Research Activity</th>
                <th>Researcher</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.researcher}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr><td colSpan={4}>No report records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

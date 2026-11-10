
import { useEffect, useState } from "react";
import { RefreshCw, CalendarDays, Clock, MapPin } from "lucide-react";

interface ScheduleRecord {
  id: number;
  researchTitle: string;
  researcher: string;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: string;
}

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/schedules`;

export default function StaffCalendar() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to retrieve schedules.");
      }

      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      console.error("Staff calendar error:", err);
      setError("Unable to load schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Research Schedule Calendar
          </h2>
          <p className="text-gray-500 mt-1">
            View the university's shared research activities and schedules.
          </p>
        </div>

        <button
          onClick={fetchSchedules}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#102746] px-4 py-2 text-white hover:bg-[#193b64] disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border p-5">
          <p className="text-sm text-gray-500">Total Schedules</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">
            {schedules.length}
          </h3>
        </div>

        <div className="rounded-xl bg-white border p-5">
          <p className="text-sm text-gray-500">Upcoming Schedules</p>
          <h3 className="text-3xl font-bold text-blue-700 mt-2">
            {schedules.filter(
              (schedule) =>
                new Date(schedule.date).getTime() >=
                new Date().setHours(0, 0, 0, 0)
            ).length}
          </h3>
        </div>

        <div className="rounded-xl bg-white border p-5">
          <p className="text-sm text-gray-500">Completed Schedules</p>
          <h3 className="text-3xl font-bold text-green-700 mt-2">
            {schedules.filter(
              (schedule) => schedule.status === "Completed"
            ).length}
          </h3>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold text-gray-800">
            University Research Schedules
          </h3>
          <p className="text-sm text-gray-500">
            Read-only schedule information for staff.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading schedules...
          </div>
        ) : sortedSchedules.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <CalendarDays size={36} className="mx-auto mb-3" />
            No schedules available.
          </div>
        ) : (
          <div className="divide-y">
            {sortedSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-5 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {schedule.researchTitle}
                    </h4>

                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.researcher}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      {schedule.activity}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                      schedule.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : schedule.status === "Approved"
                        ? "bg-blue-100 text-blue-700"
                        : schedule.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {schedule.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {schedule.date}
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {schedule.startTime} - {schedule.endTime}
                  </span>

                  <span className="flex items-center gap-2">
                    <MapPin size={16} />
                    {schedule.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

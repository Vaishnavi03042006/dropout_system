import { useState } from "react";

export default function CounsellorStudentTable({ students, onSelectStudent }) {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk ? s.risk?.risk_level === filterRisk : true;
    return matchSearch && matchRisk;
  });

  const riskBadge = (risk) => {
    if (!risk) return <span className="text-gray-400 text-xs">Not assessed</span>;
    const colors = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-green-100 text-green-700" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[risk.risk_level] || "bg-gray-100"}`}>{risk.risk_level}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by name or reg. no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Risk Levels</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-left">
              <th className="p-3 rounded-tl-lg">Student</th>
              <th className="p-3">Dept / Year</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">Arrears</th>
              <th className="p-3">Feedback</th>
              <th className="p-3">Risk</th>
              <th className="p-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No students found</td></tr>
            ) : (
              filtered.map((s) => {
                const att = s.attendance?.length ? s.attendance[s.attendance.length - 1]?.attendance_percentage : null;
                const arrears = (s.results || []).filter((r) => r.result_status !== "PASS").length;
                const feedbackCount = (s.feedbacks || []).length;
                return (
                  <tr key={s.student_id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">{s.student_name}</p>
                      <p className="text-xs text-gray-400">{s.register_number}</p>
                    </td>
                    <td className="p-3">
                      <p>{s.department}</p>
                      <p className="text-xs text-gray-400">Year {s.year} · Sem {s.semester}</p>
                    </td>
                    <td className="p-3">
                      {s._loading ? <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" /> :
                        att !== null ? (
                          <span className={att < 75 ? "text-red-600 font-semibold" : "text-green-600"}>{att.toFixed(1)}%</span>
                        ) : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="p-3">
                      {s._loading ? <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" /> :
                        <span className={arrears > 0 ? "text-red-600 font-semibold" : "text-green-600"}>{arrears}</span>}
                    </td>
                    <td className="p-3">
                      {s._loading ? <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" /> :
                        <span className="text-indigo-600 font-medium">{feedbackCount}</span>}
                    </td>
                    <td className="p-3">
                      {s._loading ? <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" /> : riskBadge(s.risk)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onSelectStudent(s)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-indigo-700 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

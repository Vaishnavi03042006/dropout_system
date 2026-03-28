import { useState } from "react";

export default function StudentTable({ students, onSelectStudent }) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const departments = [...new Set(students.map((s) => s.department))];
  const years = [...new Set(students.map((s) => s.year))];

  const filtered = students.filter((s) => {
    const matchSearch =
      s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? s.department === filterDept : true;
    const matchYear = filterYear ? String(s.year) === filterYear : true;
    return matchSearch && matchDept && matchYear;
  });

  const getRiskBadge = (risk) => {
    if (!risk) return <span className="text-gray-400 text-xs">N/A</span>;
    const colors = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-green-100 text-green-700" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[risk.risk_level] || "bg-gray-100"}`}>
        {risk.risk_level}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by name or reg. no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="">All Years</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left">
              <th className="p-3 rounded-tl-lg">Name</th>
              <th className="p-3">Reg. No</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Year</th>
              <th className="p-3">Sem</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">Risk</th>
              <th className="p-3 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No students found</td></tr>
            ) : (
              filtered.map((s) => {
                const att = s.attendance?.length
                  ? s.attendance[s.attendance.length - 1]?.attendance_percentage
                  : null;
                return (
                  <tr key={s.student_id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{s.student_name}</td>
                    <td className="p-3 text-gray-500">{s.register_number}</td>
                    <td className="p-3">{s.department}</td>
                    <td className="p-3">{s.year}</td>
                    <td className="p-3">{s.semester}</td>
                    <td className="p-3">
                      {s._loading ? (
                        <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
                      ) : att !== null ? (
                        <span className={att < 75 ? "text-red-600 font-semibold" : "text-green-600"}>
                          {att.toFixed(1)}%
                        </span>
                      ) : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="p-3">
                      {s._loading
                        ? <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                        : getRiskBadge(s.risk)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onSelectStudent(s)}
                        className="bg-secondary text-white px-3 py-1 rounded-lg text-xs hover:bg-primary transition"
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

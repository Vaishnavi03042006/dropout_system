export default function RiskTable({ students }) {
  const riskStudents = students
    .filter((s) => s.risk)
    .sort((a, b) => {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (order[b.risk?.risk_level] || 0) - (order[a.risk?.risk_level] || 0);
    });

  const noRisk = students.filter((s) => !s.risk);

  const badge = (level) => {
    const styles = {
      HIGH: "bg-red-100 text-red-700 border border-red-200",
      MEDIUM: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      LOW: "bg-green-100 text-green-700 border border-green-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[level] || "bg-gray-100"}`}>
        {level}
      </span>
    );
  };

  const riskBar = (level) => {
    const config = {
      HIGH: { width: "w-full", color: "bg-red-500", label: "High Risk" },
      MEDIUM: { width: "w-2/3", color: "bg-yellow-400", label: "Medium Risk" },
      LOW: { width: "w-1/3", color: "bg-green-500", label: "Low Risk" },
    };
    const c = config[level] || { width: "w-0", color: "bg-gray-300", label: "Unknown" };
    return (
      <div className="w-24 bg-gray-100 rounded-full h-2">
        <div className={`${c.width} ${c.color} h-2 rounded-full transition-all`} />
      </div>
    );
  };

  const interventionBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      in_progress: "bg-blue-100 text-blue-700",
      pending: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] || styles.pending}`}>
        {status || "pending"}
      </span>
    );
  };

  const counts = {
    HIGH: students.filter((s) => s.risk?.risk_level === "HIGH").length,
    MEDIUM: students.filter((s) => s.risk?.risk_level === "MEDIUM").length,
    LOW: students.filter((s) => s.risk?.risk_level === "LOW").length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{counts.HIGH}</p>
          <p className="text-sm text-red-500 mt-1">High Risk Students</p>
          <p className="text-xs text-gray-400 mt-1">Immediate attention needed</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{counts.MEDIUM}</p>
          <p className="text-sm text-yellow-500 mt-1">Medium Risk Students</p>
          <p className="text-xs text-gray-400 mt-1">Monitor closely</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{counts.LOW}</p>
          <p className="text-sm text-green-500 mt-1">Low Risk Students</p>
          <p className="text-xs text-gray-400 mt-1">Performing well</p>
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">Student Dropout Risk Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">Student</th>
                <th className="p-3">Department</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Risk Indicator</th>
                <th className="p-3">Key Concerns</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Intervention</th>
              </tr>
            </thead>
            <tbody>
              {riskStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No risk data available. Run risk analysis from admin panel.
                  </td>
                </tr>
              ) : (
                riskStudents.map((s) => {
                  const att = s.attendance?.length
                    ? s.attendance[s.attendance.length - 1]?.attendance_percentage
                    : null;
                  return (
                    <tr key={s.student_id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3">
                        <p className="font-medium">{s.student_name}</p>
                        <p className="text-xs text-gray-400">{s.register_number}</p>
                      </td>
                      <td className="p-3">
                        <p>{s.department}</p>
                        <p className="text-xs text-gray-400">Year {s.year} · Sem {s.semester}</p>
                      </td>
                      <td className="p-3">{badge(s.risk.risk_level)}</td>
                      <td className="p-3">{riskBar(s.risk.risk_level)}</td>
                      <td className="p-3 max-w-[200px]">
                        {Array.isArray(s.risk.top_factors) && s.risk.top_factors.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.risk.top_factors.slice(0, 3).map((f, i) => (
                              <span key={i} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-0.5 rounded-full">
                                {f}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No factors recorded</span>
                        )}
                      </td>
                      <td className="p-3">
                        {att !== null ? (
                          <span className={`font-semibold ${att < 75 ? "text-red-600" : "text-green-600"}`}>
                            {att.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="p-3">{interventionBadge(s.risk.intervention_status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students with no risk analysis yet */}
      {noRisk.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            ⚠️ {noRisk.length} student(s) have no risk analysis yet
          </h3>
          <div className="flex flex-wrap gap-2">
            {noRisk.map((s) => (
              <span key={s.student_id} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {s.student_name} ({s.register_number})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

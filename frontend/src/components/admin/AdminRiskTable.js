export default function AdminRiskTable({ risks, students }) {
  const enriched = risks.map((r) => {
    const s = students.find((st) => st.student_id === r.student_id);
    return { ...r, student_name: s?.student_name || `Student #${r.student_id}`, department: s?.department || "—", register_number: r.register_number };
  }).sort((a, b) => {
    const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (order[b.risk_level] || 0) - (order[a.risk_level] || 0);
  });

  const badge = (level) => {
    const c = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-green-100 text-green-700" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c[level] || "bg-gray-100"}`}>{level}</span>;
  };

  const bar = (level) => {
    const c = { HIGH: "w-full bg-red-500", MEDIUM: "w-2/3 bg-yellow-400", LOW: "w-1/3 bg-green-500" };
    return <div className="w-20 bg-gray-100 rounded-full h-2"><div className={`${c[level]} h-2 rounded-full`} /></div>;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-4 text-gray-800">All Student Risk Records</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-left">
              <th className="p-3">Student</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Risk Level</th>
              <th className="p-3">Indicator</th>
              <th className="p-3">Key Factors</th>
              <th className="p-3">Intervention</th>
              <th className="p-3">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {enriched.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No risk records. Run risk analysis first.</td></tr>
            ) : enriched.map((r) => (
              <tr key={r.risk_id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">
                  <p className="font-medium text-gray-800">{r.student_name}</p>
                  <p className="text-xs text-gray-400">{r.register_number}</p>
                </td>
                <td className="p-3">{r.department}</td>
                <td className="p-3">{badge(r.risk_level)}</td>
                <td className="p-3">{bar(r.risk_level)}</td>
                <td className="p-3 max-w-[180px]">
                  {Array.isArray(r.top_factors) && r.top_factors.length > 0
                    ? <div className="flex flex-wrap gap-1">{r.top_factors.slice(0, 3).map((f, i) => <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-200">{f}</span>)}</div>
                    : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${r.intervention_status === "completed" ? "bg-green-100 text-green-700" : r.intervention_status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {r.intervention_status || "pending"}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-400">
                  {r.updated_at ? new Date(r.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

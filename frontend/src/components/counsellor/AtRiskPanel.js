export default function AtRiskPanel({ students }) {
  const riskStudents = students
    .filter((s) => s.risk?.risk_level === "HIGH" || s.risk?.risk_level === "MEDIUM")
    .sort((a, b) => {
      const order = { HIGH: 2, MEDIUM: 1 };
      return (order[b.risk?.risk_level] || 0) - (order[a.risk?.risk_level] || 0);
    });

  const high = riskStudents.filter((s) => s.risk?.risk_level === "HIGH");
  const medium = riskStudents.filter((s) => s.risk?.risk_level === "MEDIUM");

  const Card = ({ s }) => {
    const att = s.attendance?.length ? s.attendance[s.attendance.length - 1]?.attendance_percentage : null;
    const arrears = (s.results || []).filter((r) => r.result_status !== "PASS").length;
    const latestFeedback = s.feedbacks?.length ? s.feedbacks[0] : null;
    const isHigh = s.risk?.risk_level === "HIGH";

    return (
      <div className={`rounded-xl border p-4 ${isHigh ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-gray-800">{s.student_name}</p>
            <p className="text-xs text-gray-500">{s.register_number} · {s.department}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${isHigh ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
            {s.risk.risk_level}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-400">Attendance</p>
            <p className={`text-sm font-bold ${att !== null && att < 75 ? "text-red-600" : "text-green-600"}`}>
              {att !== null ? `${att.toFixed(1)}%` : "N/A"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-400">Arrears</p>
            <p className={`text-sm font-bold ${arrears > 0 ? "text-red-600" : "text-green-600"}`}>{arrears}</p>
          </div>
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-400">Feedback</p>
            <p className="text-sm font-bold text-indigo-600">{s.feedbacks?.length || 0}</p>
          </div>
        </div>

        {Array.isArray(s.risk.top_factors) && s.risk.top_factors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {s.risk.top_factors.slice(0, 3).map((f, i) => (
              <span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
        )}

        {latestFeedback && (
          <div className="bg-white rounded-lg p-2 mt-2">
            <p className="text-xs text-gray-400 mb-1">Latest Feedback</p>
            <div className="flex gap-3 text-xs">
              <span>Stress: <b>{latestFeedback.stress_level}/10</b></span>
              <span>Academic: <b>{latestFeedback.academic_difficulty}/10</b></span>
              <span>Financial: <b>{latestFeedback.financial_stress}/10</b></span>
            </div>
            {latestFeedback.notes && <p className="text-xs text-gray-500 mt-1 italic">"{latestFeedback.notes}"</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {high.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2">
            🚨 High Risk Students ({high.length})
          </h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {high.map((s) => <Card key={s.student_id} s={s} />)}
          </div>
        </div>
      )}

      {medium.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-yellow-700 mb-3 flex items-center gap-2">
            ⚠️ Medium Risk Students ({medium.length})
          </h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {medium.map((s) => <Card key={s.student_id} s={s} />)}
          </div>
        </div>
      )}

      {riskStudents.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-green-600 font-semibold text-lg">🎉 No high or medium risk students</p>
          <p className="text-green-500 text-sm mt-1">All students are in good standing</p>
        </div>
      )}
    </div>
  );
}

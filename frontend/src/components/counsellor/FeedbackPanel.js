export default function FeedbackPanel({ feedbacks }) {
  const riskBadge = (level) => {
    const colors = { High: "bg-red-100 text-red-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[level] || "bg-gray-100 text-gray-600"}`}>{level || "N/A"}</span>;
  };

  const ScoreBar = ({ label, value }) => (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span><span>{value}/10</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${value >= 7 ? "bg-red-500" : value >= 4 ? "bg-yellow-400" : "bg-green-500"}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-4 text-gray-800">All Student Feedback</h2>
      {feedbacks.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No feedback submitted yet</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div key={f.feedback_id} className="border rounded-xl p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {f.student_name || `Student #${f.student_id}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {f.register_number} · {new Date(f.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {riskBadge(f.risk_level)}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <ScoreBar label="Stress Level" value={f.stress_level} />
                <ScoreBar label="Academic Difficulty" value={f.academic_difficulty} />
                <ScoreBar label="Financial Stress" value={f.financial_stress} />
              </div>

              {f.notes && (
                <div className="bg-indigo-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-indigo-500 font-medium mb-1">Student Notes</p>
                  <p className="text-sm text-gray-700 italic">"{f.notes}"</p>
                </div>
              )}

              {f.action_taken && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">✅ Counsellor Action</p>
                  <p className="text-sm text-gray-700">{f.action_taken}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { addCounsellorNotes } from "../../services/api";

export default function CounsellorStudentDrawer({ student, onClose, onRefresh }) {
  const [notesFeedbackId, setNotesFeedbackId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const risk = student.risk;
  const att = student.attendance?.length ? student.attendance[student.attendance.length - 1] : null;
  const feedbacks = student.feedbacks || [];
  const results = student.results || [];

  const handleSaveNotes = async () => {
    if (!notesFeedbackId || !notes.trim()) return;
    setMsg(null);
    try {
      setSaving(true);
      await addCounsellorNotes(notesFeedbackId, notes);
      setMsg({ type: "success", text: "Notes saved!" });
      setNotes("");
      onRefresh();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const riskConfig = {
    HIGH:   { bg: "bg-red-50 border-red-200",    text: "text-red-600",    badge: "bg-red-100 text-red-700" },
    MEDIUM: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700" },
    LOW:    { bg: "bg-green-50 border-green-200",  text: "text-green-600",  badge: "bg-green-100 text-green-700" },
  };
  const rc = riskConfig[risk?.risk_level] || riskConfig.LOW;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{student.student_name}</h2>
            <p className="text-indigo-200 text-sm mt-1">{student.register_number} · {student.department} · Year {student.year}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Risk Summary */}
          {risk && (
            <div className={`rounded-xl border p-4 ${rc.bg}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Dropout Risk</h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${rc.badge}`}>{risk.risk_level}</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 mb-3">
                <div className={`h-3 rounded-full ${risk.risk_level === "HIGH" ? "w-full bg-red-500" : risk.risk_level === "MEDIUM" ? "w-2/3 bg-yellow-400" : "w-1/3 bg-green-500"}`} />
              </div>
              {Array.isArray(risk.top_factors) && risk.top_factors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {risk.top_factors.map((f, i) => (
                    <span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Attendance</p>
              <p className={`text-xl font-bold ${att && att.attendance_percentage < 75 ? "text-red-600" : "text-indigo-600"}`}>
                {att ? `${att.attendance_percentage.toFixed(1)}%` : "N/A"}
              </p>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Arrears</p>
              <p className={`text-xl font-bold ${results.filter(r => r.result_status !== "PASS").length > 0 ? "text-red-600" : "text-green-600"}`}>
                {results.filter(r => r.result_status !== "PASS").length}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Feedbacks</p>
              <p className="text-xl font-bold text-orange-600">{feedbacks.length}</p>
            </div>
          </div>

          {/* Feedback History */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Feedback History</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-400 text-sm">No feedback submitted yet</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((f) => (
                  <div key={f.feedback_id} className="border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-400">{new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.risk_level === "High" ? "bg-red-100 text-red-700" : f.risk_level === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {f.risk_level}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center mb-2">
                      <div className="bg-gray-50 rounded p-1"><p className="text-gray-400">Stress</p><p className="font-bold">{f.stress_level}/10</p></div>
                      <div className="bg-gray-50 rounded p-1"><p className="text-gray-400">Academic</p><p className="font-bold">{f.academic_difficulty}/10</p></div>
                      <div className="bg-gray-50 rounded p-1"><p className="text-gray-400">Financial</p><p className="font-bold">{f.financial_stress}/10</p></div>
                    </div>
                    {f.notes && <p className="text-xs text-gray-600 italic mb-2">"{f.notes}"</p>}
                    {f.action_taken && (
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-green-600 font-medium">Action Taken</p>
                        <p className="text-xs text-gray-700">{f.action_taken}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Notes */}
          {feedbacks.length > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Add Counsellor Notes</h3>
              <select
                value={notesFeedbackId}
                onChange={(e) => setNotesFeedbackId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select feedback session</option>
                {feedbacks.map((f) => (
                  <option key={f.feedback_id} value={f.feedback_id}>
                    {new Date(f.created_at).toLocaleDateString("en-IN")} — {f.risk_level}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter counselling notes / action taken..."
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              {msg && <p className={`text-xs mb-2 font-medium ${msg.type === "success" ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>}
              <button
                onClick={handleSaveNotes}
                disabled={!notesFeedbackId || !notes.trim() || saving}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

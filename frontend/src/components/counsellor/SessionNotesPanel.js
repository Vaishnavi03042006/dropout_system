import { useState } from "react";
import { addCounsellorNotes } from "../../services/api";

export default function SessionNotesPanel({ students, feedbacks, onRefresh }) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const studentFeedbacks = feedbacks.filter(
    (f) => String(f.student_id) === String(selectedStudentId)
  );

  const selectedFeedback = feedbacks.find(
    (f) => String(f.feedback_id) === String(selectedFeedbackId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedbackId || !notes.trim()) return;
    setMessage(null);
    try {
      setLoading(true);
      await addCounsellorNotes(selectedFeedbackId, notes);
      setMessage({ type: "success", text: "Session notes saved successfully!" });
      setNotes("");
      onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const riskBadge = (level) => {
    const colors = { High: "bg-red-100 text-red-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[level] || "bg-gray-100"}`}>{level}</span>;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left — Add Notes Form */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Add Session Notes</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedFeedbackId(""); }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">-- Choose a student --</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_name} ({s.register_number})
                </option>
              ))}
            </select>
          </div>

          {selectedStudentId && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">Select Feedback Session</label>
              {studentFeedbacks.length === 0 ? (
                <p className="text-sm text-gray-400">No feedback found for this student</p>
              ) : (
                <select
                  value={selectedFeedbackId}
                  onChange={(e) => setSelectedFeedbackId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">-- Choose a session --</option>
                  {studentFeedbacks.map((f) => (
                    <option key={f.feedback_id} value={f.feedback_id}>
                      {new Date(f.created_at).toLocaleDateString("en-IN")} — Risk: {f.risk_level}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedFeedback && (
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-indigo-700">Feedback Summary</p>
                {riskBadge(selectedFeedback.risk_level)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-400">Stress</p>
                  <p className="font-bold text-gray-700">{selectedFeedback.stress_level}/10</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-400">Academic</p>
                  <p className="font-bold text-gray-700">{selectedFeedback.academic_difficulty}/10</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-gray-400">Financial</p>
                  <p className="font-bold text-gray-700">{selectedFeedback.financial_stress}/10</p>
                </div>
              </div>
              {selectedFeedback.notes && (
                <p className="text-xs text-gray-600 italic">"{selectedFeedback.notes}"</p>
              )}
              {selectedFeedback.action_taken && (
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-green-600 font-medium">Existing notes:</p>
                  <p className="text-xs text-gray-600">{selectedFeedback.action_taken}</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600 block mb-1">Counsellor Notes / Action Taken</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the counselling session, action taken, follow-up plan..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {message && (
            <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedFeedbackId || !notes.trim() || loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Session Notes"}
          </button>
        </form>
      </div>

      {/* Right — Recent Notes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Recent Counsellor Actions</h2>
        {feedbacks.filter((f) => f.action_taken).length === 0 ? (
          <p className="text-gray-400 text-center py-8">No session notes recorded yet</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {feedbacks
              .filter((f) => f.action_taken)
              .map((f) => (
                <div key={f.feedback_id} className="border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {f.student_name || `Student #${f.student_id}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {riskBadge(f.risk_level)}
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">Action Taken</p>
                    <p className="text-sm text-gray-700">{f.action_taken}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

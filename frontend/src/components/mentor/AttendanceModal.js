import { useState } from "react";
import { addAttendance } from "../../services/api";

export default function AttendanceModal({ student, onClose, onSuccess }) {
  const [form, setForm] = useState({ total_classes: "", attended_classes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await addAttendance({
        student_id: student.student_id,
        total_classes: parseInt(form.total_classes),
        attended_classes: parseInt(form.attended_classes),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-1">Add Attendance</h2>
        <p className="text-sm text-gray-500 mb-5">{student.student_name} — {student.register_number}</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Total Classes</label>
            <input
              type="number" min="1" required
              value={form.total_classes}
              onChange={(e) => setForm({ ...form, total_classes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Attended Classes</label>
            <input
              type="number" min="0" required
              value={form.attended_classes}
              onChange={(e) => setForm({ ...form, attended_classes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-secondary text-white rounded-lg py-2 hover:bg-primary transition">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

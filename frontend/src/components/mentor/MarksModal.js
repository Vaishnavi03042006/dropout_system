import { useState } from "react";
import { addResult } from "../../services/api";

export default function MarksModal({ student, onClose, onSuccess }) {
  const [form, setForm] = useState({
    subject_code: "", subject_name: "", semester: "",
    internal1: "", internal2: "", internal3: "",
    attempts: "1", result_status: "PASS", sem_mark: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await addResult({
        student_id: student.student_id,
        subject_code: form.subject_code,
        subject_name: form.subject_name,
        semester: parseInt(form.semester),
        internal1: parseFloat(form.internal1),
        internal2: parseFloat(form.internal2),
        internal3: parseFloat(form.internal3),
        attempts: parseInt(form.attempts),
        result_status: form.result_status,
        sem_mark: form.sem_mark ? parseFloat(form.sem_mark) : null,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "subject_code", label: "Subject Code", type: "text" },
    { key: "subject_name", label: "Subject Name", type: "text" },
    { key: "semester", label: "Semester", type: "number" },
    { key: "internal1", label: "Internal 1", type: "number" },
    { key: "internal2", label: "Internal 2", type: "number" },
    { key: "internal3", label: "Internal 3", type: "number" },
    { key: "attempts", label: "Attempts", type: "number" },
    { key: "sem_mark", label: "Semester Mark (optional)", type: "number" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">Add Marks</h2>
        <p className="text-sm text-gray-500 mb-5">{student.student_name} — {student.register_number}</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-600 block mb-1">{f.label}</label>
                <input
                  type={f.type}
                  required={f.key !== "sem_mark"}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Result Status</label>
            <select
              value={form.result_status}
              onChange={(e) => setForm({ ...form, result_status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="ARREAR">ARREAR</option>
            </select>
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

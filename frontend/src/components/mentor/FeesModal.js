import { useState } from "react";
import { addFee } from "../../services/api";

export default function FeesModal({ student, onClose, onSuccess }) {
  const [form, setForm] = useState({
    semester: "", tuition_fee: "", hostel_fee: "",
    payment_status: "UNPAID", deadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await addFee({
        student_id: student.student_id,
        semester: parseInt(form.semester),
        tuition_fee: parseFloat(form.tuition_fee),
        hostel_fee: form.hostel_fee ? parseFloat(form.hostel_fee) : null,
        payment_status: form.payment_status,
        deadline: form.deadline || null,
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
        <h2 className="text-xl font-bold mb-1">Add Fee Record</h2>
        <p className="text-sm text-gray-500 mb-5">{student.student_name} — {student.register_number}</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "semester", label: "Semester", type: "number" },
            { key: "tuition_fee", label: "Tuition Fee (₹)", type: "number" },
            { key: "hostel_fee", label: "Hostel Fee (₹, optional)", type: "number" },
            { key: "deadline", label: "Deadline", type: "date" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
              <input
                type={f.type}
                required={f.key !== "hostel_fee" && f.key !== "deadline"}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          ))}

          <div>
            <label className="text-sm text-gray-600 block mb-1">Payment Status</label>
            <select
              value={form.payment_status}
              onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
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

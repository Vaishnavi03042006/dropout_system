import { useState } from "react";
import { createStudent } from "../../services/api";

const INIT = {
  name: "", email: "", password: "",
  student_name: "", department: "CSE",
  year: "1", semester: "1", admission_date: ""
};

export default function CreateStudentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await createStudent(form);
      setCreated(res);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">

        {created ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">🎉</p>
            <h3 className="text-xl font-bold text-green-700 mb-2">Student Created!</h3>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-gray-600 mb-1">Register Number (auto-generated):</p>
              <p className="text-2xl font-bold text-indigo-700">{created.register_number}</p>
              <p className="text-xs text-gray-400 mt-2">Share this with the student for login reference.</p>
            </div>
            <button onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create New Student</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login credentials */}
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Login Credentials</p>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Full Name (for login)</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Ravi Kumar"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Password</label>
                  <input required type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                    placeholder="Set initial password"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              {/* Student profile */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Profile</p>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Student Name (as in records)</label>
                  <input required value={form.student_name} onChange={(e) => set("student_name", e.target.value)}
                    placeholder="e.g. Ravi Kumar"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Department</label>
                    <select value={form.department} onChange={(e) => set("department", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Year</label>
                    <select value={form.year} onChange={(e) => set("year", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {[1,2,3,4].map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Semester</label>
                    <select value={form.semester} onChange={(e) => set("semester", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {[1,2,3,4,5,6,7,8].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Admission Date</label>
                    <input required type="date" value={form.admission_date} onChange={(e) => set("admission_date", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700">
                  📌 Register number will be <strong>auto-generated</strong> based on department (e.g. 727723eucs001)
                </p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? "Creating..." : "Create Student"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

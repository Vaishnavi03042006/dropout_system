import { useState } from "react";
import { uploadExcel } from "../../services/api";

const UPLOAD_TYPES = [
  { key: "students", label: "Students", columns: "student_id, student_name, register_number, department, year, semester, admission_date" },
  { key: "attendance", label: "Attendance", columns: "register_number, total_classes, attended_classes" },
  { key: "results", label: "Results / Marks", columns: "register_number, subject_code, subject_name, semester, internal1, internal2, internal3, attempts, result_status, sem_mark" },
  { key: "fees", label: "Fees", columns: "register_number, semester, tuition_fee, hostel_fee, payment_status, deadline" },
];

export default function UploadExcel() {
  const [type, setType] = useState("students");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const selected = UPLOAD_TYPES.find((t) => t.key === type);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setMessage(null);
    try {
      setLoading(true);
      const res = await uploadExcel(type, file);
      setMessage({ type: "success", text: res.message || "Uploaded successfully!" });
      setFile(null);
      document.getElementById("file-upload").value = "";
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Upload Excel Data</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {UPLOAD_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => { setType(t.key); setMessage(null); setFile(null); }}
            className={`p-4 rounded-xl border-2 text-left transition ${
              type === t.key ? "border-secondary bg-accent/30 font-semibold" : "border-gray-200 hover:border-secondary"
            }`}
          >
            <p className="font-medium">{t.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-500 font-semibold mb-1">Required columns:</p>
        <p className="text-xs text-gray-600 font-mono">{selected.columns}</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-secondary transition">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <p className="text-gray-500 text-sm">
              {file ? (
                <span className="text-secondary font-semibold">{file.name}</span>
              ) : (
                <>Click to select <span className="text-secondary font-semibold">.xlsx / .xls</span> file</>
              )}
            </p>
          </label>
        </div>

        {message && (
          <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-primary transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : `Upload ${selected.label}`}
        </button>
      </form>
    </div>
  );
}

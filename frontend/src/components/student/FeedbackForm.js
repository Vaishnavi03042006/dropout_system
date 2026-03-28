import { useState } from "react";
import { submitFeedback } from "../../services/api";

const SLIDERS = [
  {
    key: "stress_level",
    label: "Stress Level",
    desc: "How stressed are you feeling overall?",
    low: "Very Calm",
    high: "Extremely Stressed",
    color: "accent-violet-600",
  },
  {
    key: "academic_difficulty",
    label: "Academic Difficulty",
    desc: "How difficult are you finding your studies?",
    low: "Very Easy",
    high: "Very Difficult",
    color: "accent-indigo-600",
  },
  {
    key: "financial_stress",
    label: "Financial Stress",
    desc: "Are you facing any financial pressure?",
    low: "No Pressure",
    high: "Severe Pressure",
    color: "accent-orange-500",
  },
];

const levelColor = (v) =>
  v >= 7 ? "text-red-600" : v >= 4 ? "text-yellow-600" : "text-green-600";

const levelLabel = (v) =>
  v >= 7 ? "High" : v >= 4 ? "Moderate" : "Low";

export default function FeedbackForm({ onSubmitted }) {
  const [form, setForm] = useState({
    stress_level: 0,
    academic_difficulty: 0,
    financial_stress: 0,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const avg = Math.round(
    (form.stress_level + form.academic_difficulty + form.financial_stress) / 3
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await submitFeedback(form);
      setSuccess(true);
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h3 className="text-xl font-bold text-green-700 mb-2">Feedback Submitted!</h3>
        <p className="text-green-600 text-sm mb-4">
          Your counsellor has been notified and will reach out if needed.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800">How are you feeling?</h2>
        <p className="text-sm text-gray-500 mt-1">
          This is confidential. Your counsellor uses this to support you better.
        </p>
      </div>

      {/* Sliders */}
      {SLIDERS.map((s) => (
        <div key={s.key}>
          <div className="flex justify-between items-center mb-1">
            <div>
              <p className="font-semibold text-gray-800">{s.label}</p>
              <p className="text-xs text-gray-400">{s.desc}</p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${levelColor(form[s.key])}`}>
                {form[s.key]}
              </span>
              <span className="text-xs text-gray-400">/10</span>
              <p className={`text-xs font-medium ${levelColor(form[s.key])}`}>
                {levelLabel(form[s.key])}
              </p>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={10}
            value={form[s.key]}
            onChange={(e) => setForm({ ...form, [s.key]: parseInt(e.target.value) })}
            className={`w-full h-2 rounded-full ${s.color} cursor-pointer`}
          />

          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{s.low}</span>
            <span>{s.high}</span>
          </div>

          {/* Visual bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                form[s.key] >= 7 ? "bg-red-500" : form[s.key] >= 4 ? "bg-yellow-400" : "bg-green-500"
              }`}
              style={{ width: `${form[s.key] * 10}%` }}
            />
          </div>
        </div>
      ))}

      {/* Overall preview */}
      <div className={`rounded-xl border p-4 ${avg >= 7 ? "bg-red-50 border-red-200" : avg >= 4 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-gray-700">Overall Wellbeing Score</p>
            <p className="text-xs text-gray-400">Average of all three indicators</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${levelColor(avg)}`}>{avg}<span className="text-sm font-normal text-gray-400">/10</span></p>
            <p className={`text-xs font-semibold ${levelColor(avg)}`}>{levelLabel(avg)} Risk</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Anything specific you'd like your counsellor to know..."
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}

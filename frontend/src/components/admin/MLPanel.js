import { useState } from "react";
import { runRiskAll, trainModel } from "../../services/api";

export default function MLPanel() {
  const [riskStatus, setRiskStatus]   = useState(null);
  const [trainStatus, setTrainStatus] = useState(null);
  const [riskLoading, setRiskLoading]   = useState(false);
  const [trainLoading, setTrainLoading] = useState(false);

  const handleRunRisk = async () => {
    setRiskStatus(null);
    setRiskLoading(true);
    try {
      const res = await runRiskAll();
      setRiskStatus({ type: "success", text: res.message || "Done" });
    } catch (e) {
      setRiskStatus({ type: "error", text: e.message });
    } finally {
      setRiskLoading(false);
    }
  };

  const handleTrain = async () => {
    setTrainStatus(null);
    setTrainLoading(true);
    try {
      const res = await trainModel();
      setTrainStatus({ type: "success", text: res.message || "Done" });
    } catch (e) {
      setTrainStatus({ type: "error", text: e.message });
    } finally {
      setTrainLoading(false);
    }
  };

  const Card = ({ title, desc, buttonLabel, onClick, loading, status, color }) => (
    <div className={`rounded-xl border p-6 ${color}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">{desc}</p>
      {status && (
        <p className={`text-sm font-medium mb-3 ${status.type === "success" ? "text-green-600" : "text-red-500"}`}>
          {status.type === "success" ? "✅" : "❌"} {status.text}
        </p>
      )}
      <button onClick={onClick} disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : buttonLabel}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card
          title="🧠 Run Risk Analysis"
          desc="Runs the hybrid ML + rule-based dropout risk analysis for ALL students in the system. Updates risk levels, scores, and top contributing factors."
          buttonLabel="Run Risk for All Students"
          onClick={handleRunRisk}
          loading={riskLoading}
          status={riskStatus}
          color="bg-red-50 border-red-200"
        />
        <Card
          title="🤖 Train ML Model"
          desc="Retrains the machine learning model using the latest student data from the CSV dataset. Run this when new training data is available."
          buttonLabel="Train ML Model"
          onClick={handleTrain}
          loading={trainLoading}
          status={trainStatus}
          color="bg-indigo-50 border-indigo-200"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">How the Risk Engine Works</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { step: "1", title: "Feature Building", desc: "Collects attendance %, internal marks, fee status, and feedback scores for each student." },
            { step: "2", title: "Hybrid Scoring", desc: "Rule-based score (60%) + ML model prediction (40%) are combined into a final risk score." },
            { step: "3", title: "Risk Classification", desc: "Final score maps to LOW / MEDIUM / HIGH with top contributing factors for explainability." },
          ].map((s) => (
            <div key={s.step} className="bg-indigo-50 rounded-xl p-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-2">{s.step}</div>
              <p className="font-semibold text-gray-800 mb-1">{s.title}</p>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

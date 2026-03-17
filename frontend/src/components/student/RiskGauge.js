export default function RiskGauge({ risk }) {

  const score = risk?.final_score || 0;
  const level = risk?.risk_level || "N/A";

  const color =
    level === "HIGH"
      ? "bg-red-500"
      : level === "MEDIUM"
      ? "bg-yellow-500"
      : "bg-green-500";

  const textColor =
    level === "HIGH"
      ? "text-red-600"
      : level === "MEDIUM"
      ? "text-yellow-600"
      : "text-green-600";

  return (

    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-lg font-semibold mb-4">
        Dropout Risk Analysis
      </h2>

      <div className="flex items-center gap-6">

        <div className="w-full bg-gray-200 rounded-full h-6">

          <div
            className={`${color} h-6 rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />

        </div>

        <p className={`text-xl font-bold ${textColor}`}>
          {level}
        </p>

      </div>

    </div>

  );
}
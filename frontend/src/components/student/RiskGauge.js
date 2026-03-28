export default function RiskGauge({ risk }) {
  if (!risk) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Dropout Risk Status</h2>
        <p className="text-gray-400 text-sm">Risk analysis not available yet. Contact your mentor.</p>
      </div>
    );
  }

  const level = risk.risk_level;
  const config = {
    HIGH:   { width: "100%", bar: "bg-red-500",    text: "text-red-600",    bg: "bg-red-50 border-red-200",    msg: "Your dropout risk is high. Please meet your mentor immediately." },
    MEDIUM: { width: "66%",  bar: "bg-yellow-400", text: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", msg: "Moderate risk detected. Focus on attendance and pending subjects." },
    LOW:    { width: "33%",  bar: "bg-green-500",  text: "text-green-600",  bg: "bg-green-50 border-green-200",  msg: "You're on track! Keep maintaining your performance." },
  };
  const c = config[level] || config.LOW;

  return (
    <div className={`rounded-xl border p-6 ${c.bg}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Dropout Risk Status</h2>
        <span className={`text-xl font-bold ${c.text}`}>{level}</span>
      </div>

      <div className="w-full bg-white rounded-full h-4 mb-3 overflow-hidden">
        <div className={`${c.bar} h-4 rounded-full transition-all duration-700`} style={{ width: c.width }} />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>Low</span><span>Medium</span><span>High</span>
      </div>

      <p className={`text-sm font-medium ${c.text}`}>{c.msg}</p>

      {Array.isArray(risk.top_factors) && risk.top_factors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2 font-semibold">Contributing factors:</p>
          <div className="flex flex-wrap gap-2">
            {risk.top_factors.map((f, i) => (
              <span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Academic Risk", value: risk.academic_risk },
          { label: "Attendance Risk", value: risk.attendance_risk },
          { label: "Financial Risk", value: risk.financial_risk },
        ].map((item) => item.value && (
          <div key={item.label} className="bg-white rounded-lg p-2 border border-gray-100">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className={`text-sm font-bold ${item.value === "HIGH" ? "text-red-600" : item.value === "MEDIUM" ? "text-yellow-600" : "text-green-600"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

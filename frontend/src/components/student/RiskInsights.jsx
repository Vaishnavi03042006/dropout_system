export default function RiskInsights({ attendance, results, fees, risk }) {
  const insights = [];
  const positives = [];

  const riskLevel = risk?.risk_level?.toUpperCase();
  const latestAtt = attendance?.length ? attendance[attendance.length - 1]?.attendance_percentage : null;
  const arrears = results.filter((r) => r.result_status !== "PASS").length;
  const unpaid = fees.filter((f) => f.payment_status !== "PAID").length;

  if (riskLevel === "HIGH") insights.push({ icon: "🚨", text: "High dropout risk — meet your mentor urgently" });
  else if (riskLevel === "MEDIUM") insights.push({ icon: "⚠️", text: "Moderate risk — improvement needed in key areas" });

  if (latestAtt !== null && latestAtt < 75) insights.push({ icon: "📅", text: `Attendance at ${latestAtt.toFixed(1)}% — below the 75% requirement` });
  else if (latestAtt !== null) positives.push(`Attendance is good at ${latestAtt.toFixed(1)}%`);

  if (arrears > 0) insights.push({ icon: "📝", text: `${arrears} subject(s) with arrears — needs immediate focus` });
  else if (results.length > 0) positives.push("No arrears — all subjects cleared");

  if (unpaid > 0) insights.push({ icon: "💸", text: `${unpaid} fee payment(s) pending` });
  else if (fees.length > 0) positives.push("All fees paid — no dues");

  if (riskLevel === "LOW") positives.push("Overall risk is low — keep it up!");

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full" /> Areas Needing Attention
        </h3>
        {insights.length === 0 ? (
          <p className="text-gray-400 text-sm">No issues detected 🎉</p>
        ) : (
          <ul className="space-y-2">
            {insights.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-red-50 rounded-lg p-2">
                <span>{item.icon}</span> {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" /> What's Going Well
        </h3>
        {positives.length === 0 ? (
          <p className="text-gray-400 text-sm">Complete your profile data to see insights</p>
        ) : (
          <ul className="space-y-2">
            {positives.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 rounded-lg p-2">
                <span>✅</span> {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

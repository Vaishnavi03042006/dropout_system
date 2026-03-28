export default function StatsCards({ attendance, results, fees, risk }) {
  const latestAtt = attendance?.length
    ? attendance[attendance.length - 1]?.attendance_percentage
    : null;

  const avgMarks = results.length
    ? (results.reduce((a, b) => a + (b.sem_mark || 0), 0) / results.length).toFixed(1)
    : null;

  const arrears = results.filter((r) => r.result_status !== "PASS").length;

  const unpaidFees = fees.filter((f) => f.payment_status !== "PAID").length;

  const riskLevel = risk?.risk_level || null;

  const cards = [
    {
      label: "Attendance",
      value: latestAtt !== null ? `${latestAtt.toFixed(1)}%` : "N/A",
      sub: latestAtt !== null ? (latestAtt < 75 ? "⚠ Below 75% threshold" : "✓ Good standing") : "No data yet",
      color: latestAtt !== null && latestAtt < 75 ? "text-red-600" : "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
      icon: "📋",
    },
    {
      label: "Avg Sem Mark",
      value: avgMarks !== null ? `${avgMarks}` : "N/A",
      sub: results.length ? `Across ${results.length} subject(s)` : "No results yet",
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-100",
      icon: "📊",
    },
    {
      label: "Arrears",
      value: arrears,
      sub: arrears > 0 ? `${arrears} subject(s) need attention` : "No arrears 🎉",
      color: arrears > 0 ? "text-red-600" : "text-green-600",
      bg: "bg-rose-50 border-rose-100",
      icon: "📝",
    },
    {
      label: "Fee Status",
      value: unpaidFees > 0 ? `${unpaidFees} Pending` : "All Paid",
      sub: fees.length ? `${fees.length} semester(s) on record` : "No fee records",
      color: unpaidFees > 0 ? "text-orange-600" : "text-green-600",
      bg: "bg-orange-50 border-orange-100",
      icon: "💰",
    },
    {
      label: "Dropout Risk",
      value: riskLevel || "N/A",
      sub: riskLevel === "HIGH" ? "Immediate action needed" : riskLevel === "MEDIUM" ? "Monitor your progress" : riskLevel === "LOW" ? "Keep it up!" : "Not assessed yet",
      color: riskLevel === "HIGH" ? "text-red-600" : riskLevel === "MEDIUM" ? "text-yellow-600" : "text-green-600",
      bg: "bg-yellow-50 border-yellow-100",
      icon: "🎯",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.bg}`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <span className="text-lg">{c.icon}</span>
          </div>
          <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

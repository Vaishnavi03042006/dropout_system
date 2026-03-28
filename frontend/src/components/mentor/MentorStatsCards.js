export default function MentorStatsCards({ students, alerts }) {
  const highRisk = students.filter((s) => s.risk?.risk_level === "HIGH").length;
  const mediumRisk = students.filter((s) => s.risk?.risk_level === "MEDIUM").length;
  const lowAttendance = students.filter(
    (s) => s.attendance?.length && s.attendance[s.attendance.length - 1]?.attendance_percentage < 75
  ).length;

  const cards = [
    { label: "Total Students", value: students.length, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100", icon: "🎓" },
    { label: "High Risk", value: highRisk, color: "text-red-600", bg: "bg-red-50 border-red-100", icon: "🚨" },
    { label: "Medium Risk", value: mediumRisk, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100", icon: "⚠️" },
    { label: "Low Attendance (<75%)", value: lowAttendance, color: "text-orange-600", bg: "bg-orange-50 border-orange-100", icon: "📅" },
    { label: "Unread Alerts", value: alerts.length, color: "text-violet-600", bg: "bg-violet-50 border-violet-100", icon: "🔔" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.bg}`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <span className="text-lg">{c.icon}</span>
          </div>
          <h2 className={`text-3xl font-bold ${c.color}`}>{c.value}</h2>
        </div>
      ))}
    </div>
  );
}

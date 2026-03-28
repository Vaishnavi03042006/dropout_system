export default function AdminStatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Students",    value: stats.total_students,  color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100",  icon: "🎓" },
    { label: "Total Users",       value: stats.total_users,     color: "text-violet-600", bg: "bg-violet-50 border-violet-100",  icon: "👥" },
    { label: "High Risk",         value: stats.high_risk,       color: "text-red-600",    bg: "bg-red-50 border-red-100",        icon: "🚨" },
    { label: "Medium Risk",       value: stats.medium_risk,     color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100",  icon: "⚠️" },
    { label: "Low Risk",          value: stats.low_risk,        color: "text-green-600",  bg: "bg-green-50 border-green-100",    icon: "✅" },
    { label: "Low Attendance",    value: stats.low_attendance,  color: "text-orange-600", bg: "bg-orange-50 border-orange-100",  icon: "📅" },
    { label: "Total Feedback",    value: stats.total_feedback,  color: "text-blue-600",   bg: "bg-blue-50 border-blue-100",      icon: "💬" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.bg}`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 font-medium leading-tight">{c.label}</p>
            <span className="text-base">{c.icon}</span>
          </div>
          <p className={`text-3xl font-bold ${c.color}`}>{c.value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}

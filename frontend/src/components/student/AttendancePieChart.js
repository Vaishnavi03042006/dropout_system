import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function AttendancePieChart({ attendance }) {
  const latest = attendance?.[attendance.length - 1];
  const attended = latest?.attendance_percentage || 0;
  const missed = 100 - attended;

  if (!latest) {
    return (
      <div className="bg-white p-6 rounded-xl shadow flex items-center justify-center h-64">
        <p className="text-gray-400">No attendance data yet</p>
      </div>
    );
  }

  const data = [
    { name: "Attended", value: parseFloat(attended.toFixed(1)) },
    { name: "Missed", value: parseFloat(missed.toFixed(1)) },
  ];

  const COLORS = ["#6366f1", "#e0e7ff"];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-1 text-gray-800">Attendance</h2>
      <p className="text-xs text-gray-400 mb-2">Current semester breakdown</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <p className={`text-2xl font-bold ${attended < 75 ? "text-red-600" : "text-indigo-600"}`}>
          {attended.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-400">
          {latest.attended_classes} / {latest.total_classes} classes attended
        </p>
        {attended < 75 && (
          <p className="text-xs text-red-500 mt-1 font-medium">⚠ Below 75% — at risk</p>
        )}
      </div>
    </div>
  );
}

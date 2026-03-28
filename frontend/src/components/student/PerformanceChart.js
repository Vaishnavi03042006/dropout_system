import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PerformanceChart({ results }) {
  if (!results.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow flex items-center justify-center h-64">
        <p className="text-gray-400">No results data available yet</p>
      </div>
    );
  }

  const data = results.map((r) => ({
    subject: r.subject_code,
    Internal1: r.internal1,
    Internal2: r.internal2,
    Internal3: r.internal3,
    ...(r.sem_mark != null ? { "Sem Mark": r.sem_mark } : {}),
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-1 text-gray-800">Academic Performance</h2>
      <p className="text-xs text-gray-400 mb-4">Internal marks across all subjects</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Internal1" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Internal2" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Internal3" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          {results.some((r) => r.sem_mark != null) && (
            <Bar dataKey="Sem Mark" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

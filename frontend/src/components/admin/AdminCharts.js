import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function AdminCharts({ stats, deptStats }) {
  const roleData = stats?.users_by_role
    ? Object.entries(stats.users_by_role).map(([role, count]) => ({ role, count }))
    : [];

  const riskData = [
    { name: "High",   value: stats?.high_risk   || 0, color: "#ef4444" },
    { name: "Medium", value: stats?.medium_risk  || 0, color: "#eab308" },
    { name: "Low",    value: stats?.low_risk     || 0, color: "#22c55e" },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Risk Distribution Pie */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Risk Distribution</h3>
        {(stats?.high_risk === 0 && stats?.medium_risk === 0 && stats?.low_risk === 0) ? (
          <p className="text-gray-400 text-sm text-center pt-12">No risk data yet. Run risk analysis.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskData.filter((d) => d.value > 0)} dataKey="value" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {riskData.filter((d) => d.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-2">
              {riskData.map((d) => (
                <div key={d.name} className="text-center">
                  <p className="text-lg font-bold" style={{ color: d.color }}>{d.value}</p>
                  <p className="text-xs text-gray-400">{d.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Users by Role Bar */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Users by Role</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={roleData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="role" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dept Risk Bar */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Risk by Department</h3>
        {deptStats.length === 0 ? (
          <p className="text-gray-400 text-sm text-center pt-8">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptStats} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="high"   fill="#ef4444" radius={[4,4,0,0]} name="High" />
              <Bar dataKey="medium" fill="#eab308" radius={[4,4,0,0]} name="Medium" />
              <Bar dataKey="low"    fill="#22c55e" radius={[4,4,0,0]} name="Low" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

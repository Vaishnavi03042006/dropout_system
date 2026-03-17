export default function StatsCards({ attendance, results, risk }) {

  const latestAttendance =
    attendance?.[attendance.length - 1]?.attendance_percentage || 0;

  const avgMarks = results.length
    ? Math.round(
        results.reduce((a, b) => a + (b.sem_mark || 0), 0) / results.length
      )
    : 0;

  const riskLevel = risk?.risk_level || "N/A";

  return (

    <div className="grid md:grid-cols-3 gap-6">

      <div className="bg-white p-6 rounded-xl shadow">

        <p className="text-gray-500">Attendance</p>

        <h2 className="text-3xl font-bold text-green-600">
          {latestAttendance.toFixed(1)}%
        </h2>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">

        <p className="text-gray-500">Average Marks</p>

        <h2 className="text-3xl font-bold text-blue-600">
          {avgMarks}%
        </h2>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">

        <p className="text-gray-500">Dropout Risk</p>

        <h2 className={`text-3xl font-bold ${
          riskLevel === "HIGH"
            ? "text-red-600"
            : riskLevel === "MEDIUM"
            ? "text-yellow-500"
            : "text-green-600"
        }`}>
          {riskLevel}
        </h2>

      </div>

    </div>

  );
}
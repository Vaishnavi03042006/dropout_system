import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function AttendancePieChart({ attendance }) {

  const latest = attendance?.[attendance.length - 1];

  const attended = latest?.attendance_percentage || 0;
  const missed = 100 - attended;

  const data = [
    { name: "Attended", value: attended },
    { name: "Missed", value: missed }
  ];

  const COLORS = ["#408A71", "#B0E4CC"];

  return (

    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-lg font-semibold mb-4">
        Attendance Breakdown
      </h2>

      <PieChart width={300} height={300}>

        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >

          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}

        </Pie>

        <Tooltip />

      </PieChart>

    </div>

  );
}
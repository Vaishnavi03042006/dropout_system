export default function Topbar({ student }) {
  return (
    <div className="bg-white shadow flex justify-between items-center px-8 py-4">
      <h1 className="text-2xl font-semibold text-gray-700">My Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {student?.student_name?.[0] || "S"}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{student?.student_name || "Student"}</p>
          <p className="text-sm text-gray-500">BE — {student?.department}</p>
        </div>
      </div>
    </div>
  );
}

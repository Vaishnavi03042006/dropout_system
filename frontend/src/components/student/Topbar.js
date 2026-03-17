export default function Topbar({ student }) {

  if (!student) {
    return (
      <div className="bg-white shadow px-8 py-4 text-center">
        Loading...
      </div>
    );
  }

  return (

    <div className="bg-white shadow flex justify-between items-center px-8 py-4">

      <h1 className="text-2xl font-semibold text-gray-700">
        Student Dashboard
      </h1>

      <div className="flex items-center gap-4">

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          className="w-10 h-10 rounded-full"
        />

        <div>

          <p className="font-semibold">
            {student.student_name}
          </p>

          <p className="text-sm text-gray-500">
            BE - {student.department}
          </p>

        </div>

      </div>

    </div>

  );
}
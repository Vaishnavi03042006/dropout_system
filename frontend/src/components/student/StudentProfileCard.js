export default function StudentProfileCard({ student }) {

  if (!student) {
    return <p className="text-center">Loading...</p>;
  }

  return (

    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-6">

      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
        className="w-24"
      />

      <div>

        <h2 className="text-2xl font-bold">
          {student.student_name}
        </h2>

        <p className="text-gray-500">
          {student.register_number}
        </p>

        <div className="flex gap-4 mt-2 text-sm">

          <p>
            <b>Register No:</b> {student.register_number}
          </p>

          <p>
            <b>Degree:</b> BE-{student.department}
          </p>

          <p>
            <b>Batch:</b> Year {student.year}
          </p>

        </div>

      </div>

    </div>

  );
}
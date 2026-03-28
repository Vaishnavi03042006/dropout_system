export default function StudentProfileCard({ student }) {
  if (!student) return null;

  const fields = [
    { label: "Register No", value: student.register_number },
    { label: "Department", value: `BE — ${student.department}` },
    { label: "Year", value: `Year ${student.year}` },
    { label: "Semester", value: `Semester ${student.semester}` },
    { label: "Admitted", value: student.admission_date ? new Date(student.admission_date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—" },
  ];

  return (
    <div className="bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] rounded-2xl p-6 text-white flex items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold shrink-0">
        {student.student_name?.[0]}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{student.student_name}</h2>
        <p className="text-indigo-200 text-sm mb-3">{student.register_number}</p>
        <div className="flex flex-wrap gap-3">
          {fields.slice(1).map((f) => (
            <span key={f.label} className="bg-white/15 rounded-lg px-3 py-1 text-xs">
              <span className="text-indigo-200">{f.label}: </span>
              <span className="font-semibold">{f.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

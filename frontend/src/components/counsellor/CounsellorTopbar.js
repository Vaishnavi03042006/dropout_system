export default function CounsellorTopbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <div className="bg-white shadow flex justify-between items-center px-8 py-4">
      <h1 className="text-2xl font-semibold text-gray-700">Counsellor Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {user.name?.[0] || "C"}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user.name || "Counsellor"}</p>
          <p className="text-sm text-gray-500">{user.department || "Counselling Dept"}</p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function MentorTopbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white shadow flex justify-between items-center px-8 py-4">
      <h1 className="text-2xl font-semibold text-gray-700">Mentor Dashboard</h1>

      <div className="flex items-center gap-4">
        <p className="text-xs text-gray-400">{now.toLocaleTimeString()}</p>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {user.name?.[0] || "M"}
        </div>
        <div>
          <p className="font-semibold">{user.name || "Mentor"}</p>
          <p className="text-sm text-gray-500">{user.department || "Faculty"}</p>
        </div>
      </div>
    </div>
  );
}

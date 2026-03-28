import { FaHome, FaUsers, FaCommentDots, FaExclamationTriangle, FaClipboardCheck, FaSignOutAlt } from "react-icons/fa";

const navItems = [
  { icon: <FaHome />, label: "Overview", tab: "overview" },
  { icon: <FaUsers />, label: "Students", tab: "students" },
  { icon: <FaExclamationTriangle />, label: "At-Risk Students", tab: "risk" },
  { icon: <FaCommentDots />, label: "Feedback", tab: "feedback" },
  { icon: <FaClipboardCheck />, label: "Session Notes", tab: "notes" },
];

export default function CounsellorSidebar({ activeTab, setActiveTab, highRiskCount }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location = "/login";
  };

  return (
    <div className="w-64 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/20">
        <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Counsellor Portal</p>
        <p className="text-xl font-bold">EduTrack</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
              activeTab === item.tab ? "bg-white/20 font-semibold" : "hover:bg-white/10"
            }`}
          >
            <span className="text-indigo-200">{item.icon}</span>
            <span>{item.label}</span>
            {item.tab === "risk" && highRiskCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {highRiskCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-indigo-200"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

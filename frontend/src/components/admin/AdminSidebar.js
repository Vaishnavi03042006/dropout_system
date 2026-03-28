import { FaHome, FaUsers, FaUserGraduate, FaChartBar, FaBrain, FaFileUpload, FaCommentDots, FaSignOutAlt } from "react-icons/fa";

const navItems = [
  { icon: <FaHome />,         label: "Overview",      tab: "overview" },
  { icon: <FaUsers />,        label: "User Management", tab: "users" },
  { icon: <FaUserGraduate />, label: "Students",      tab: "students" },
  { icon: <FaChartBar />,     label: "Risk Analysis", tab: "risk" },
  { icon: <FaBrain />,        label: "ML Model",      tab: "ml" },
  { icon: <FaFileUpload />,   label: "Upload Data",   tab: "upload" },
  { icon: <FaCommentDots />,  label: "Feedback",      tab: "feedback" },
];

export default function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 bg-gradient-to-b from-[#1e1b4b] to-[#4338ca] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/20">
        <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Admin Portal</p>
        <p className="text-xl font-bold">EduTrack</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button key={item.tab} onClick={() => setActiveTab(item.tab)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === item.tab ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}>
            <span className="text-indigo-200">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/20">
        <button onClick={() => { localStorage.clear(); window.location = "/login"; }}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-indigo-200">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

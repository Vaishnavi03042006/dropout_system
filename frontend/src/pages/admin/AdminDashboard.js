import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminStatsCards from "../../components/admin/AdminStatsCards";
import AdminCharts from "../../components/admin/AdminCharts";
import UserManagement from "../../components/admin/UserManagement";
import AdminRiskTable from "../../components/admin/AdminRiskTable";
import MLPanel from "../../components/admin/MLPanel";
import UploadExcel from "../../components/mentor/UploadExcel";
import CreateStudentModal from "../../components/admin/CreateStudentModal";

import {
  getAdminStats, getAdminUsers, getAdminStudents,
  getAdminRiskAll, getAdminFeedback, getAdminDeptStats,
} from "../../services/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab]               = useState("overview");
  const [stats, setStats]                       = useState(null);
  const [users, setUsers]                       = useState([]);
  const [students, setStudents]                 = useState([]);
  const [risks, setRisks]                       = useState([]);
  const [feedbacks, setFeedbacks]               = useState([]);
  const [deptStats, setDeptStats]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showCreateStudent, setShowCreateStudent] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, u, st, r, f, d] = await Promise.all([
        getAdminStats(), getAdminUsers(), getAdminStudents(),
        getAdminRiskAll(), getAdminFeedback(), getAdminDeptStats(),
      ]);
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setStudents(Array.isArray(st) ? st : []);
      setRisks(Array.isArray(r) ? r : []);
      setFeedbacks(Array.isArray(f) ? f : []);
      setDeptStats(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {

      case "overview":
        return (
          <div className="space-y-6">
            <AdminStatsCards stats={stats} />
            <AdminCharts stats={stats} deptStats={deptStats} />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-semibold text-gray-800 mb-3">🚨 High Risk Students</h3>
                {risks.filter((r) => r.risk_level === "HIGH").length === 0 ? (
                  <p className="text-gray-400 text-sm">No high risk students</p>
                ) : (
                  <div className="space-y-2">
                    {risks.filter((r) => r.risk_level === "HIGH").slice(0, 6).map((r) => {
                      const s = students.find((st) => st.student_id === r.student_id);
                      return (
                        <div key={r.risk_id} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s?.student_name || r.register_number}</p>
                            <p className="text-xs text-gray-400">{s?.department} · {r.register_number}</p>
                          </div>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">HIGH</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-semibold text-gray-800 mb-3">💬 Recent Feedback</h3>
                {feedbacks.length === 0 ? (
                  <p className="text-gray-400 text-sm">No feedback yet</p>
                ) : (
                  <div className="space-y-2">
                    {feedbacks.slice(0, 6).map((f) => (
                      <div key={f.feedback_id} className="flex justify-between items-center border rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{f.student_name || `Student #${f.student_id}`}</p>
                          <p className="text-xs text-gray-400">{new Date(f.created_at).toLocaleDateString("en-IN")}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.risk_level === "High" ? "bg-red-100 text-red-700" : f.risk_level === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {f.risk_level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "users":
        return <UserManagement users={users} onRefresh={loadData} />;

      case "students":
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateStudent(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                + Create Student
              </button>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">All Students ({students.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-700 text-left">
                      <th className="p-3">Name</th>
                      <th className="p-3">Register No</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3">Admitted</th>
                      <th className="p-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const risk = risks.find((r) => r.student_id === s.student_id);
                      return (
                        <tr key={s.student_id} className="border-t hover:bg-gray-50 transition">
                          <td className="p-3 font-medium text-gray-800">{s.student_name}</td>
                          <td className="p-3 text-gray-500">{s.register_number}</td>
                          <td className="p-3">{s.department}</td>
                          <td className="p-3">{s.year}</td>
                          <td className="p-3">{s.semester}</td>
                          <td className="p-3 text-gray-400 text-xs">
                            {s.admission_date ? new Date(s.admission_date).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td className="p-3">
                            {risk ? (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${risk.risk_level === "HIGH" ? "bg-red-100 text-red-700" : risk.risk_level === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                                {risk.risk_level}
                              </span>
                            ) : <span className="text-gray-400 text-xs">Not assessed</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "risk":
        return <AdminRiskTable risks={risks} students={students} />;

      case "ml":
        return <MLPanel />;

      case "upload":
        return <UploadExcel />;

      case "feedback":
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">All Feedback ({feedbacks.length})</h2>
            {feedbacks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No feedback submitted yet</p>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div key={f.feedback_id} className="border rounded-xl p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{f.student_name || `Student #${f.student_id}`}</p>
                        <p className="text-xs text-gray-400">{f.register_number} · {new Date(f.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.risk_level === "High" ? "bg-red-100 text-red-700" : f.risk_level === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {f.risk_level}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[["Stress", f.stress_level], ["Academic", f.academic_difficulty], ["Financial", f.financial_stress]].map(([label, val]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span>{val}/10</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${val >= 7 ? "bg-red-500" : val >= 4 ? "bg-yellow-400" : "bg-green-500"}`} style={{ width: `${val * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {f.notes && <p className="text-xs text-gray-500 italic mt-2">"{f.notes}"</p>}
                    {f.action_taken && (
                      <div className="bg-green-50 rounded-lg p-2 mt-2">
                        <p className="text-xs text-green-600 font-medium">✅ Counsellor Action: {f.action_taken}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700 capitalize">{activeTab.replace("-", " ")}</h2>
            <button onClick={loadData}
              className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition shadow-sm">
              <span className="text-indigo-600">↻</span> Refresh
            </button>
          </div>
          {renderContent()}
        </div>
      </div>

      {showCreateStudent && (
        <CreateStudentModal
          onClose={() => setShowCreateStudent(false)}
          onSuccess={() => { setShowCreateStudent(false); loadData(); }}
        />
      )}
    </div>
  );
}

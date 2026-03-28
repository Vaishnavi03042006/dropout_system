import { useEffect, useState, useCallback } from "react";
import MentorSidebar from "../../components/mentor/MentorSidebar";
import MentorTopbar from "../../components/mentor/MentorTopbar";
import MentorStatsCards from "../../components/mentor/MentorStatsCards";
import StudentTable from "../../components/mentor/StudentTable";
import RiskTable from "../../components/mentor/RiskTable";
import UploadExcel from "../../components/mentor/UploadExcel";
import AlertsPanel from "../../components/mentor/AlertsPanel";
import StudentDetailDrawer from "../../components/mentor/StudentDetailDrawer";

import {
  getAllStudents,
  getMentorAttendance,
  getMentorResults,
  getMentorFees,
  getMentorRisk,
  getMentorAlerts,
} from "../../services/api";

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Step 1: Load students list immediately — fast
  // Step 2: Enrich each student progressively in background
  const loadData = useCallback(async () => {
    try {
      // Fetch students + alerts together (2 calls only)
      const [studentList, alertList] = await Promise.all([
        getAllStudents(),
        getMentorAlerts(user.user_id),
      ]);

      // Show students immediately with no enriched data
      setStudents(studentList.map((s) => ({ ...s, attendance: [], results: [], fees: [], risk: null, _loading: true })));
      setAlerts(Array.isArray(alertList) ? alertList : []);
      setLoading(false);
      setEnriching(true);

      // Enrich each student one by one, updating state as each completes
      await Promise.all(
        studentList.map(async (s) => {
          const [attendance, results, fees, risk] = await Promise.all([
            getMentorAttendance(s.student_id),
            getMentorResults(s.student_id),
            getMentorFees(s.student_id),
            getMentorRisk(s.student_id),
          ]);
          setStudents((prev) =>
            prev.map((p) =>
              p.student_id === s.student_id
                ? { ...p, attendance, results, fees, risk, _loading: false }
                : p
            )
          );
        })
      );

      setEnriching(false);
    } catch (err) {
      console.error("Dashboard load error:", err.message);
      setLoading(false);
      setEnriching(false);
    }
  }, [user.user_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When drawer is open, keep it in sync with latest student state
  useEffect(() => {
    if (selectedStudent) {
      const updated = students.find((s) => s.student_id === selectedStudent.student_id);
      if (updated) setSelectedStudent(updated);
    }
  }, [students]); // eslint-disable-line

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <MentorStatsCards students={students} alerts={alerts} />
            <StudentTable students={students} onSelectStudent={setSelectedStudent} />
          </div>
        );
      case "students":
        return <StudentTable students={students} onSelectStudent={setSelectedStudent} />;
      case "attendance":
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Attendance Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Reg. No</th>
                    <th className="p-3">Total Classes</th>
                    <th className="p-3">Attended</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const att = s.attendance?.length ? s.attendance[s.attendance.length - 1] : null;
                    return (
                      <tr key={s.student_id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{s.student_name}</td>
                        <td className="p-3 text-gray-500">{s.register_number}</td>
                        {s._loading ? (
                          <td colSpan={4} className="p-3">
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-48" />
                          </td>
                        ) : (
                          <>
                            <td className="p-3">{att?.total_classes ?? "—"}</td>
                            <td className="p-3">{att?.attended_classes ?? "—"}</td>
                            <td className="p-3">
                              {att ? (
                                <span className={att.attendance_percentage < 75 ? "text-red-600 font-semibold" : "text-green-600"}>
                                  {att.attendance_percentage.toFixed(1)}%
                                </span>
                              ) : "—"}
                            </td>
                            <td className="p-3">
                              {att ? (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${att.attendance_percentage < 75 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                  {att.attendance_percentage < 75 ? "Low" : "Good"}
                                </span>
                              ) : <span className="text-gray-400 text-xs">N/A</span>}
                            </td>
                          </>
                        )}
                        <td className="p-3">
                          <button onClick={() => setSelectedStudent(s)}
                            className="text-xs bg-secondary text-white px-3 py-1 rounded-lg hover:bg-primary transition">
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "marks":
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Marks Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Reg. No</th>
                    <th className="p-3">Subjects</th>
                    <th className="p-3">Avg Sem Mark</th>
                    <th className="p-3">Arrears</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const results = s.results || [];
                    const avgMark = results.length
                      ? (results.reduce((a, r) => a + (r.sem_mark || 0), 0) / results.length).toFixed(1)
                      : "—";
                    const arrears = results.filter((r) => r.result_status !== "PASS").length;
                    return (
                      <tr key={s.student_id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{s.student_name}</td>
                        <td className="p-3 text-gray-500">{s.register_number}</td>
                        {s._loading ? (
                          <td colSpan={3} className="p-3">
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
                          </td>
                        ) : (
                          <>
                            <td className="p-3">{results.length}</td>
                            <td className="p-3">{avgMark}</td>
                            <td className="p-3">
                              {arrears > 0
                                ? <span className="text-red-600 font-semibold">{arrears}</span>
                                : <span className="text-green-600">0</span>}
                            </td>
                          </>
                        )}
                        <td className="p-3">
                          <button onClick={() => setSelectedStudent(s)}
                            className="text-xs bg-secondary text-white px-3 py-1 rounded-lg hover:bg-primary transition">
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "fees":
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Fees Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Reg. No</th>
                    <th className="p-3">Semesters</th>
                    <th className="p-3">Unpaid</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const fees = s.fees || [];
                    const unpaid = fees.filter((f) => f.payment_status !== "PAID").length;
                    return (
                      <tr key={s.student_id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{s.student_name}</td>
                        <td className="p-3 text-gray-500">{s.register_number}</td>
                        {s._loading ? (
                          <td colSpan={2} className="p-3">
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
                          </td>
                        ) : (
                          <>
                            <td className="p-3">{fees.length}</td>
                            <td className="p-3">
                              {unpaid > 0
                                ? <span className="text-red-600 font-semibold">{unpaid}</span>
                                : <span className="text-green-600">All Paid</span>}
                            </td>
                          </>
                        )}
                        <td className="p-3">
                          <button onClick={() => setSelectedStudent(s)}
                            className="text-xs bg-secondary text-white px-3 py-1 rounded-lg hover:bg-primary transition">
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "risk":
        return <RiskTable students={students} enriching={enriching} />;
      case "upload":
        return <UploadExcel />;
      case "alerts":
        return <AlertsPanel alerts={alerts} onRefresh={loadData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <MentorSidebar activeTab={activeTab} setActiveTab={setActiveTab} alertCount={alerts.length} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MentorTopbar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-700 capitalize">{activeTab}</h2>
              {enriching && (
                <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Loading student details...
                </span>
              )}
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition shadow-sm"
            >
              <span className="text-secondary">↻</span> Refresh
            </button>
          </div>
          {renderContent()}
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onRefresh={() => {
            setSelectedStudent(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

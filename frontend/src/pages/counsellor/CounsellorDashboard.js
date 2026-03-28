import { useEffect, useState, useCallback } from "react";
import CounsellorSidebar from "../../components/counsellor/CounsellorSidebar";
import CounsellorTopbar from "../../components/counsellor/CounsellorTopbar";
import CounsellorStatsCards from "../../components/counsellor/CounsellorStatsCards";
import CounsellorStudentTable from "../../components/counsellor/CounsellorStudentTable";
import AtRiskPanel from "../../components/counsellor/AtRiskPanel";
import FeedbackPanel from "../../components/counsellor/FeedbackPanel";
import SessionNotesPanel from "../../components/counsellor/SessionNotesPanel";
import CounsellorStudentDrawer from "../../components/counsellor/CounsellorStudentDrawer";

import {
  getCounsellorStudents,
  getAllFeedbacks,
  getCounsellorAttendance,
  getCounsellorResults,
  getCounsellorFees,
  getCounsellorRisk,
  getCounsellorFeedback,
} from "../../services/api";

export default function CounsellorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [studentList, feedbackList] = await Promise.all([
        getCounsellorStudents(),
        getAllFeedbacks(),
      ]);

      // Show students immediately
      setStudents(studentList.map((s) => ({ ...s, attendance: [], results: [], fees: [], risk: null, feedbacks: [], _loading: true })));
      setFeedbacks(Array.isArray(feedbackList) ? feedbackList : []);
      setLoading(false);
      setEnriching(true);

      // Enrich progressively
      await Promise.all(
        studentList.map(async (s) => {
          const [attendance, results, fees, risk, studentFeedbacks] = await Promise.all([
            getCounsellorAttendance(s.student_id),
            getCounsellorResults(s.student_id),
            getCounsellorFees(s.student_id),
            getCounsellorRisk(s.student_id),
            getCounsellorFeedback(s.student_id),
          ]);
          setStudents((prev) =>
            prev.map((p) =>
              p.student_id === s.student_id
                ? { ...p, attendance, results, fees, risk, feedbacks: studentFeedbacks, _loading: false }
                : p
            )
          );
        })
      );

      setEnriching(false);
    } catch (err) {
      console.error("Counsellor dashboard error:", err.message);
      setLoading(false);
      setEnriching(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep drawer in sync with enriched data
  useEffect(() => {
    if (selectedStudent) {
      const updated = students.find((s) => s.student_id === selectedStudent.student_id);
      if (updated) setSelectedStudent(updated);
    }
  }, [students]); // eslint-disable-line

  const highRiskCount = students.filter((s) => s.risk?.risk_level === "HIGH").length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading counsellor dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <CounsellorStatsCards students={students} feedbacks={feedbacks} />
            <div className="grid md:grid-cols-2 gap-6">
              {/* High risk summary */}
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">🚨 Needs Immediate Attention</h3>
                {students.filter((s) => s.risk?.risk_level === "HIGH").length === 0 ? (
                  <p className="text-gray-400 text-sm">No high risk students</p>
                ) : (
                  <div className="space-y-2">
                    {students.filter((s) => s.risk?.risk_level === "HIGH").slice(0, 5).map((s) => (
                      <div key={s.student_id} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.student_name}</p>
                          <p className="text-xs text-gray-400">{s.register_number} · {s.department}</p>
                        </div>
                        <button onClick={() => setSelectedStudent(s)} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent feedback */}
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">📋 Recent Feedback</h3>
                {feedbacks.length === 0 ? (
                  <p className="text-gray-400 text-sm">No feedback yet</p>
                ) : (
                  <div className="space-y-2">
                    {feedbacks.slice(0, 5).map((f) => (
                      <div key={f.feedback_id} className="flex justify-between items-center border rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {f.student_name || `Student #${f.student_id}`}
                          </p>
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
      case "students":
        return <CounsellorStudentTable students={students} onSelectStudent={setSelectedStudent} />;
      case "risk":
        return <AtRiskPanel students={students} />;
      case "feedback":
        return <FeedbackPanel feedbacks={feedbacks} />;
      case "notes":
        return <SessionNotesPanel students={students} feedbacks={feedbacks} onRefresh={loadData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <CounsellorSidebar activeTab={activeTab} setActiveTab={setActiveTab} highRiskCount={highRiskCount} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CounsellorTopbar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-700 capitalize">{activeTab.replace("-", " ")}</h2>
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
              <span className="text-indigo-600">↻</span> Refresh
            </button>
          </div>
          {renderContent()}
        </div>
      </div>

      {selectedStudent && (
        <CounsellorStudentDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onRefresh={() => { setSelectedStudent(null); loadData(); }}
        />
      )}
    </div>
  );
}

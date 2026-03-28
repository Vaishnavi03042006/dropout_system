import { useEffect, useState } from "react";
import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";
import StudentProfileCard from "../../components/student/StudentProfileCard";
import StatsCards from "../../components/student/StatsCards";
import PerformanceChart from "../../components/student/PerformanceChart";
import AttendancePieChart from "../../components/student/AttendancePieChart";
import RiskGauge from "../../components/student/RiskGauge";
import RiskInsights from "../../components/student/RiskInsights";
import FeedbackForm from "../../components/student/FeedbackForm";
import { getMyProfile, getAttendance, getResults, getFees, getRisk, getMyFeedbacks } from "../../services/api";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [risk, setRisk] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeedbacks = async () => {
    const data = await getMyFeedbacks().catch(() => []);
    setFeedbacks(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        const studentData = await getMyProfile();
        if (!studentData?.student_id) return;
        const id = studentData.student_id;
        const [att, res, fee, rsk, fb] = await Promise.all([
          getAttendance(id).catch(() => []),
          getResults(id).catch(() => []),
          getFees(id).catch(() => []),
          getRisk(id).catch(() => null),
          getMyFeedbacks().catch(() => []),
        ]);
        setStudent(studentData);
        setAttendance(Array.isArray(att) ? att : []);
        setResults(Array.isArray(res) ? res : []);
        setFees(Array.isArray(fee) ? fee : []);
        setRisk(rsk || null);
        setFeedbacks(Array.isArray(fb) ? fb : []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <StudentProfileCard student={student} />
            <StatsCards attendance={attendance} results={results} fees={fees} risk={risk} />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceChart results={results} />
              </div>
              <AttendancePieChart attendance={attendance} />
            </div>
            <RiskInsights attendance={attendance} results={results} fees={fees} risk={risk} />
          </div>
        );

      case "results":
        return (
          <div className="space-y-6">
            <PerformanceChart results={results} />
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Subject-wise Results</h2>
              {results.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No results available yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-indigo-50 text-indigo-700 text-left">
                        <th className="p-3 rounded-tl-lg">Subject</th>
                        <th className="p-3">Code</th>
                        <th className="p-3">Sem</th>
                        <th className="p-3 text-center">Internal 1</th>
                        <th className="p-3 text-center">Internal 2</th>
                        <th className="p-3 text-center">Internal 3</th>
                        <th className="p-3 text-center">Sem Mark</th>
                        <th className="p-3 text-center">Attempts</th>
                        <th className="p-3 rounded-tr-lg text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.result_id} className="border-t hover:bg-gray-50 transition">
                          <td className="p-3 font-medium text-gray-800">{r.subject_name}</td>
                          <td className="p-3 text-gray-500">{r.subject_code}</td>
                          <td className="p-3">{r.semester}</td>
                          <td className="p-3 text-center">{r.internal1}</td>
                          <td className="p-3 text-center">{r.internal2}</td>
                          <td className="p-3 text-center">{r.internal3}</td>
                          <td className="p-3 text-center font-semibold">{r.sem_mark ?? "—"}</td>
                          <td className="p-3 text-center">{r.attempts}</td>
                          <td className="p-3 text-center">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              r.result_status === "PASS"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {r.result_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case "attendance":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <AttendancePieChart attendance={attendance} />
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Attendance History</h2>
                {attendance.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No attendance records yet</p>
                ) : (
                  <div className="space-y-3">
                    {[...attendance].reverse().map((a) => (
                      <div key={a.attendance_id} className="flex justify-between items-center border rounded-xl p-4 hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-800">
                            {a.attended_classes} / {a.total_classes} classes
                          </p>
                          <p className="text-xs text-gray-400">
                            {a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${a.attendance_percentage < 75 ? "text-red-600" : "text-indigo-600"}`}>
                            {a.attendance_percentage.toFixed(1)}%
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${a.attendance_percentage < 75 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {a.attendance_percentage < 75 ? "Low" : "Good"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {attendance.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-indigo-700 font-medium">
                  📌 Minimum required attendance is <strong>75%</strong>.
                  {attendance[attendance.length - 1]?.attendance_percentage < 75
                    ? " You are currently below the required threshold. Please attend more classes."
                    : " You are meeting the attendance requirement. Keep it up!"}
                </p>
              </div>
            )}
          </div>
        );

      case "fees":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Total Semesters", value: fees.length, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                { label: "Paid", value: fees.filter((f) => f.payment_status === "PAID").length, color: "text-green-600", bg: "bg-green-50 border-green-100" },
                { label: "Pending / Partial", value: fees.filter((f) => f.payment_status !== "PAID").length, color: "text-red-600", bg: "bg-red-50 border-red-100" },
              ].map((c) => (
                <div key={c.label} className={`rounded-xl border p-5 ${c.bg}`}>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Fee Records</h2>
              {fees.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No fee records available</p>
              ) : (
                <div className="space-y-3">
                  {fees.map((f) => (
                    <div key={f.fee_id} className="flex justify-between items-center border rounded-xl p-4 hover:bg-gray-50 transition">
                      <div>
                        <p className="font-semibold text-gray-800">Semester {f.semester}</p>
                        <p className="text-sm text-gray-500">
                          Tuition: <span className="font-medium">₹{f.tuition_fee?.toLocaleString("en-IN")}</span>
                          {f.hostel_fee ? ` · Hostel: ₹${f.hostel_fee?.toLocaleString("en-IN")}` : ""}
                        </p>
                        {f.deadline && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Due: {new Date(f.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          ₹{((f.tuition_fee || 0) + (f.hostel_fee || 0)).toLocaleString("en-IN")}
                        </p>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          f.payment_status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : f.payment_status === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {f.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "risk":
        return (
          <div className="space-y-6">
            <RiskGauge risk={risk} />
            <RiskInsights attendance={attendance} results={results} fees={fees} risk={risk} />
          </div>
        );

      case "feedback":
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Submit form */}
            <FeedbackForm onSubmitted={loadFeedbacks} />

            {/* History */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">My Feedback History</h2>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-400 text-sm">No feedback submitted yet</p>
                  <p className="text-gray-400 text-xs mt-1">Use the form to share how you're feeling</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {feedbacks.map((f) => {
                    const riskColor = f.risk_level === "High" ? "bg-red-100 text-red-700 border-red-200" : f.risk_level === "Medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 border-green-200";
                    return (
                      <div key={f.feedback_id} className="border rounded-xl p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs text-gray-400">
                            {new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${riskColor}`}>
                            {f.risk_level} Risk
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {[
                            { label: "Stress", value: f.stress_level },
                            { label: "Academic", value: f.academic_difficulty },
                            { label: "Financial", value: f.financial_stress },
                          ].map((item) => (
                            <div key={item.label} className="text-center bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-400">{item.label}</p>
                              <p className={`text-lg font-bold ${
                                item.value >= 7 ? "text-red-600" : item.value >= 4 ? "text-yellow-600" : "text-green-600"
                              }`}>{item.value}<span className="text-xs font-normal text-gray-400">/10</span></p>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    item.value >= 7 ? "bg-red-500" : item.value >= 4 ? "bg-yellow-400" : "bg-green-500"
                                  }`}
                                  style={{ width: `${item.value * 10}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {f.notes && (
                          <div className="bg-indigo-50 rounded-lg p-3 mb-2">
                            <p className="text-xs text-indigo-500 font-medium mb-1">Your Notes</p>
                            <p className="text-sm text-gray-700 italic">"{f.notes}"</p>
                          </div>
                        )}

                        {f.action_taken && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-600 font-semibold mb-1">✅ Counsellor Response</p>
                            <p className="text-sm text-gray-700">{f.action_taken}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar student={student} />
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

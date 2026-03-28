import { useState } from "react";
import AttendanceModal from "./AttendanceModal";
import MarksModal from "./MarksModal";
import FeesModal from "./FeesModal";

export default function StudentDetailDrawer({ student, onClose, onRefresh }) {
  const [modal, setModal] = useState(null); // "attendance" | "marks" | "fees"

  const att = student.attendance || [];
  const results = student.results || [];
  const fees = student.fees || [];
  const risk = student.risk;

  const latestAtt = att.length ? att[att.length - 1] : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="bg-gradient-to-r from-[#091413] to-[#285A48] text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{student.student_name}</h2>
            <p className="text-white/70 text-sm mt-1">{student.register_number} · {student.department} · Year {student.year} Sem {student.semester}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-3">
            <button onClick={() => setModal("attendance")}
              className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl py-3 text-sm font-semibold hover:bg-blue-100 transition">
              + Attendance
            </button>
            <button onClick={() => setModal("marks")}
              className="flex-1 bg-green-50 border border-green-200 text-green-700 rounded-xl py-3 text-sm font-semibold hover:bg-green-100 transition">
              + Marks
            </button>
            <button onClick={() => setModal("fees")}
              className="flex-1 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl py-3 text-sm font-semibold hover:bg-yellow-100 transition">
              + Fees
            </button>
          </div>

          {/* Risk Summary */}
          {risk && (
            <div className={`rounded-xl p-4 border-2 ${
              risk.risk_level === "HIGH" ? "bg-red-50 border-red-200"
              : risk.risk_level === "MEDIUM" ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Dropout Risk</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  risk.risk_level === "HIGH" ? "bg-red-100 text-red-700"
                  : risk.risk_level === "MEDIUM" ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
                }`}>{risk.risk_level}</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 mb-3">
                <div className={`h-3 rounded-full transition-all ${
                  risk.risk_level === "HIGH" ? "w-full bg-red-500"
                  : risk.risk_level === "MEDIUM" ? "w-2/3 bg-yellow-400"
                  : "w-1/3 bg-green-500"
                }`} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>Intervention: <span className="font-medium capitalize">{risk.intervention_status || "pending"}</span></span>
                <span>Stage: <span className="font-medium capitalize">{risk.stage || "early"}</span></span>
              </div>
              {Array.isArray(risk.top_factors) && risk.top_factors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Key Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {risk.top_factors.map((f, i) => (
                      <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-200">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attendance */}
          <div>
            <h3 className="font-semibold mb-3">Attendance</h3>
            {latestAtt ? (
              <div className="bg-white border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Attended / Total</p>
                  <p className="font-semibold">{latestAtt.attended_classes} / {latestAtt.total_classes}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className={`text-2xl font-bold ${latestAtt.attendance_percentage < 75 ? "text-red-600" : "text-green-600"}`}>
                    {latestAtt.attendance_percentage?.toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : <p className="text-gray-400 text-sm">No attendance records</p>}
          </div>

          {/* Results */}
          <div>
            <h3 className="font-semibold mb-3">Results</h3>
            {results.length === 0 ? (
              <p className="text-gray-400 text-sm">No results found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Subject</th>
                      <th className="p-2">Sem</th>
                      <th className="p-2">I1</th>
                      <th className="p-2">I2</th>
                      <th className="p-2">I3</th>
                      <th className="p-2">Sem Mark</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.result_id} className="border-t">
                        <td className="p-2">{r.subject_name}<br/><span className="text-xs text-gray-400">{r.subject_code}</span></td>
                        <td className="p-2 text-center">{r.semester}</td>
                        <td className="p-2 text-center">{r.internal1}</td>
                        <td className="p-2 text-center">{r.internal2}</td>
                        <td className="p-2 text-center">{r.internal3}</td>
                        <td className="p-2 text-center">{r.sem_mark ?? "—"}</td>
                        <td className="p-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.result_status === "PASS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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

          {/* Fees */}
          <div>
            <h3 className="font-semibold mb-3">Fees</h3>
            {fees.length === 0 ? (
              <p className="text-gray-400 text-sm">No fee records</p>
            ) : (
              <div className="space-y-2">
                {fees.map((f) => (
                  <div key={f.fee_id} className="flex justify-between items-center border rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium">Semester {f.semester}</p>
                      <p className="text-xs text-gray-500">Tuition: ₹{f.tuition_fee}{f.hostel_fee ? ` · Hostel: ₹${f.hostel_fee}` : ""}</p>
                      {f.deadline && <p className="text-xs text-gray-400">Due: {f.deadline}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      f.payment_status === "PAID" ? "bg-green-100 text-green-700"
                      : f.payment_status === "PARTIAL" ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {f.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === "attendance" && (
        <AttendanceModal student={student} onClose={() => setModal(null)} onSuccess={onRefresh} />
      )}
      {modal === "marks" && (
        <MarksModal student={student} onClose={() => setModal(null)} onSuccess={onRefresh} />
      )}
      {modal === "fees" && (
        <FeesModal student={student} onClose={() => setModal(null)} onSuccess={onRefresh} />
      )}
    </>
  );
}

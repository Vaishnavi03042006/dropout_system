import { useEffect, useState } from "react";

import Sidebar from "../../components/student/Sidebar";
import Topbar from "../../components/student/Topbar";
import StudentProfileCard from "../../components/student/StudentProfileCard";
import StatsCards from "../../components/student/StatsCards";
import PerformanceChart from "../../components/student/PerformanceChart";
import AttendancePieChart from "../../components/student/AttendancePieChart";
import RiskGauge from "../../components/student/RiskGauge";

import {
  getStudentByUser,
  getAttendance,
  getResults,
  getFees,
  getRisk
} from "../../services/api";

export default function StudentDashboard() {

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================
  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      console.log("❌ No user found in localStorage");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);

    if (!user?.user_id) {
      console.log("❌ Invalid user object");
      setLoading(false);
      return;
    }

    loadDashboard(user.user_id);

  }, []);

  // ================= FETCH FUNCTION =================
  const loadDashboard = async (userId) => {

    try {

      setLoading(true);

      // 🔥 STEP 1: GET STUDENT
      const studentData = await getStudentByUser(userId);

      if (!studentData?.student_id) {
        console.log("❌ Student not found");
        setLoading(false);
        return;
      }

      const studentId = studentData.student_id;

      // 🔥 STEP 2: FETCH ALL DATA
      const [attRes, resultRes, feeRes, riskRes] = await Promise.all([
        getAttendance(studentId),
        getResults(studentId),
        getFees(studentId),
        getRisk(studentId)
      ]);

      // 🔥 SET STATE
      setStudent(studentData);
      setAttendance(Array.isArray(attRes) ? attRes : []);
      setResults(Array.isArray(resultRes) ? resultRes : []);
      setFees(Array.isArray(feeRes) ? feeRes : []);
      setRisk(riskRes || null);

    } catch (err) {

      console.log("❌ Dashboard Error:", err.message);

    } finally {

      setLoading(false);

    }
  };

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-600">
          Loading dashboard...
        </h2>
      </div>
    );
  }

  // ================= MAIN UI =================
  return (

    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* TOPBAR (PASS STUDENT DATA) */}
        <Topbar student={student} />

        <div className="p-8 space-y-8">

          {/* 👤 PROFILE */}
          <StudentProfileCard student={student} />

          {/* 📊 STATS */}
          <StatsCards
            attendance={attendance}
            results={results}
            risk={risk}
          />

          {/* 📈 CHARTS */}
          <div className="grid lg:grid-cols-3 gap-6">

            <div className="col-span-2">
              <PerformanceChart results={results} />
            </div>

            <div>
              <AttendancePieChart attendance={attendance} />
            </div>

          </div>

          {/* 🤖 RISK */}
          <RiskGauge risk={risk} />

        </div>

      </div>

    </div>

  );
}
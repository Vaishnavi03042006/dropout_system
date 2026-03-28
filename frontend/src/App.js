import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import StudentDashboard from "./pages/student/StudentDashboard"
import MentorDashboard from "./pages/mentor/MentorDashboard"
import CounsellorDashboard from "./pages/counsellor/CounsellorDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App
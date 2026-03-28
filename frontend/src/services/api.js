const API_BASE = "http://localhost:5000/api";

// ---------------- AUTH ----------------

export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Registration failed");
  }

  return result;
};

export const loginUser = async (data) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Login failed");
  }

  return result;
};

// ---------------- COMMON HEADER ----------------

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. Please login again.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

// ---------------- STUDENT ----------------

// 🔥 BEST API (use this instead of userId/studentId confusion)
export const getMyProfile = async () => {
  const response = await fetch(`${API_BASE}/students/me`, {
    method: "GET",
    headers: getAuthHeader()
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch profile");
  }

  return result;
};

// (Optional fallback)
export const getStudentByUser = async (userId) => {
  const response = await fetch(`${API_BASE}/students/user/${userId}`, {
    method: "GET",
    headers: getAuthHeader()
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch student");
  }

  return result;
};

// ---------------- ATTENDANCE ----------------

export const getAttendance = async (studentId) => {
  const response = await fetch(`${API_BASE}/attendance/student/${studentId}`, {
    method: "GET",
    headers: getAuthHeader()
  });

  const result = await response.json();

  // ⚠️ backend returns "msg" sometimes
  if (!response.ok) {
    throw new Error(result.msg || result.error || "Failed to fetch attendance");
  }

  return result;
};

// ---------------- RESULTS ----------------

export const getResults = async (studentId) => {
  const response = await fetch(`${API_BASE}/results/student/${studentId}`, {
    method: "GET",
    headers: getAuthHeader()
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch results");
  }

  return result;
};

// ---------------- FEES ----------------

export const getFees = async (studentId) => {
  const response = await fetch(`${API_BASE}/fees/student/${studentId}`, {
    method: "GET",
    headers: getAuthHeader()
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch fees");
  }

  return result;
};

// ---------------- RISK ----------------

export const getRisk = async (studentId) => {
  const response = await fetch(`${API_BASE}/risk/student/${studentId}`, {
    method: "GET",
    headers: getAuthHeader()
  });

  const result = await response.json();

  if (!response.ok) {
    console.warn("Risk not found:", result);
    return null;
  }

  return result;
};

// ============================================================
// MENTOR APIs
// ============================================================

export const getAllStudents = async () => {
  const res = await fetch(`${API_BASE}/students/all`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch students");
  return data;
};

export const getMentorAttendance = async (studentId) => {
  const res = await fetch(`${API_BASE}/attendance/student/${studentId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};

export const addAttendance = async (payload) => {
  const res = await fetch(`${API_BASE}/attendance/mentor/create`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error || "Failed");
  return data;
};

export const addResult = async (payload) => {
  const res = await fetch(`${API_BASE}/results/create`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data;
};

export const addFee = async (payload) => {
  const res = await fetch(`${API_BASE}/fees/create`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data;
};

export const getMentorResults = async (studentId) => {
  const res = await fetch(`${API_BASE}/results/student/${studentId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};

export const getMentorFees = async (studentId) => {
  const res = await fetch(`${API_BASE}/fees/student/${studentId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};

export const getMentorRisk = async (studentId) => {
  const res = await fetch(`${API_BASE}/risk/student/${studentId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return null;
  return data;
};

export const uploadExcel = async (type, file) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload/${type}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
};

export const getMentorAlerts = async (mentorId) => {
  const res = await fetch(`${API_BASE}/feedback/alerts/${mentorId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};

export const markAlertRead = async (alertId) => {
  const res = await fetch(`${API_BASE}/feedback/alerts/${alertId}/read`, {
    method: "PUT",
    headers: getAuthHeader()
  });
  return res.json();
};

// ============================================================
// COUNSELLOR APIs
// ============================================================

export const getCounsellorStudents = getAllStudents;

export const getCounsellorFeedback = async (studentId) => {
  const res = await fetch(`${API_BASE}/feedback/counsellor/student/${studentId}`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};

export const getAllFeedbacks = async () => {
  const res = await fetch(`${API_BASE}/feedback/all`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};

export const addCounsellorNotes = async (feedbackId, action_taken) => {
  const res = await fetch(`${API_BASE}/feedback/${feedbackId}/notes`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({ action_taken })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save notes");
  return data;
};

export const getCounsellorRisk = getMentorRisk;
export const getCounsellorAttendance = getMentorAttendance;
export const getCounsellorResults = getMentorResults;
export const getCounsellorFees = getMentorFees;

// ============================================================
// ADMIN APIs
// ============================================================
const adminGet = (path) =>
  fetch(`${API_BASE}/admin/${path}`, { headers: getAuthHeader() }).then((r) => r.json());

const adminPost = (path, body) =>
  fetch(`${API_BASE}/admin/${path}`, {
    method: "POST", headers: getAuthHeader(),
    body: body ? JSON.stringify(body) : undefined
  }).then((r) => r.json());

export const getAdminStats    = () => adminGet("stats");
export const getAdminUsers    = () => adminGet("users");
export const getAdminStudents = () => adminGet("students");
export const getAdminRiskAll  = () => adminGet("risk/all");
export const getAdminFeedback = () => adminGet("feedback");
export const getAdminDeptStats= () => adminGet("dept-stats");

export const runRiskAll = () => adminPost("risk/run-all");
export const trainModel = () => adminPost("train-model");

export const deleteUser = async (userId) => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE", headers: getAuthHeader()
  });
  return res.json();
};

export const updateUserRole = async (userId, role) => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: "PUT", headers: getAuthHeader(),
    body: JSON.stringify({ role })
  });
  return res.json();
};

export const createStudent = async (payload) => {
  const res = await fetch(`${API_BASE}/admin/students`, {
    method: "POST", headers: getAuthHeader(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create student");
  return data;
};

export const submitFeedback = async (payload) => {
  const res = await fetch(`${API_BASE}/feedback/`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
  return data;
};

export const getMyFeedbacks = async () => {
  const res = await fetch(`${API_BASE}/feedback/mine`, { headers: getAuthHeader() });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
};
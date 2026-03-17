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

  // ⚠️ sometimes backend returns 404 with message
  if (!response.ok) {
    console.warn("Risk not found:", result);
    return null; // 🔥 prevent crash
  }

  return result;
};
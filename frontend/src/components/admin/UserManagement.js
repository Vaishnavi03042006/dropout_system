import { useState } from "react";
import { deleteUser, updateUserRole } from "../../services/api";

const ROLES = ["admin", "mentor", "counsellor", "student", "parent"];
const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  mentor: "bg-indigo-100 text-indigo-700",
  counsellor: "bg-violet-100 text-violet-700",
  student: "bg-green-100 text-green-700",
  parent: "bg-orange-100 text-orange-700",
};

export default function UserManagement({ users, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const handleRoleUpdate = async (userId) => {
    if (!newRole) return;
    setLoading(true);
    await updateUserRole(userId, newRole);
    setEditingId(null);
    setNewRole("");
    setLoading(false);
    onRefresh();
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await deleteUser(userId);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <input placeholder="Search by name or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Department</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.user_id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 font-medium text-gray-800">{u.name}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3">
                  {editingId === u.user_id ? (
                    <div className="flex gap-2 items-center">
                      <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400">
                        <option value="">Select</option>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                      <button onClick={() => handleRoleUpdate(u.user_id)} disabled={loading}
                        className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    </div>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="p-3 text-gray-500">{u.department || "—"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(u.user_id); setNewRole(u.role); }}
                      className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100 transition">
                      Edit Role
                    </button>
                    <button onClick={() => handleDelete(u.user_id, u.name)}
                      className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { markAlertRead } from "../../services/api";

export default function AlertsPanel({ alerts, onRefresh }) {
  const handleRead = async (alertId) => {
    await markAlertRead(alertId);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-4">Student Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No unread alerts 🎉</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.alert_id} className="flex items-start justify-between bg-red-50 border border-red-200 rounded-xl p-4">
              <div>
                <p className="text-sm font-semibold text-red-700">{a.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleRead(a.alert_id)}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition ml-4 shrink-0"
              >
                Mark Read
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

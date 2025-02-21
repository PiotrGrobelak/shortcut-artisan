"use client";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Metrics Cards */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Shortcuts</h3>
            <p className="text-2xl font-semibold">24</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Active Today</h3>
            <p className="text-2xl font-semibold">12</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Most Used</h3>
            <p className="text-2xl font-semibold">CTRL+D</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Success Rate</h3>
            <p className="text-2xl font-semibold">98%</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              {
                time: "2 min ago",
                action: "Open Documents",
                status: "success",
              },
              {
                time: "5 min ago",
                action: "Launch Terminal",
                status: "success",
              },
              {
                time: "15 min ago",
                action: "Open Downloads",
                status: "failed",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{activity.time}</span>
                  <span>{activity.action}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    activity.status === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersKeys } from "../api/users.keys";
import { getUsers } from "../api/users.api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, UserCheck, UserX, TrendingUp } from "lucide-react";

export default function UsersAnalyticsPage() {
  // Fetch users data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => getUsers(),
  });

  // Calculate analytics from user data
  const analytics = useMemo(() => {
    if (!data) return null;

    // 1. Users by Role
    const roleDistribution = data.reduce((acc, user) => {
      const role = user.role || "Unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const roleData = Object.entries(roleDistribution).map(([role, count]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      count,
    }));

    // 2. Active vs Inactive Users
    const activeCount = data.filter((u) => u.active).length;
    const inactiveCount = data.length - activeCount;

    const statusData = [
      { name: "Active", value: activeCount },
      { name: "Inactive", value: inactiveCount },
    ];

    // 3. User Registrations Over Time
    const registrationsByDate = data.reduce((acc, user) => {
      const date = new Date(user.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by date and create cumulative data
    const sortedDates = Object.keys(registrationsByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    let cumulative = 0;
    const registrationData = sortedDates.map((date) => {
      cumulative += registrationsByDate[date];
      return {
        date,
        registrations: registrationsByDate[date],
        cumulative,
      };
    });

    // Summary stats
    const totalUsers = data.length;
    const activePercentage = ((activeCount / totalUsers) * 100).toFixed(1);

    return {
      roleData,
      statusData,
      registrationData,
      totalUsers,
      activeCount,
      inactiveCount,
      activePercentage,
    };
  }, [data]);

  // Color palettes
  const ROLE_COLORS: Record<string, string> = {
    Admin: "#3b82f6",
    User: "#10b981",
    Guest: "#f59e0b",
  };

  const STATUS_COLORS = ["#10b981", "#ef4444"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
        Error: {(error as Error).message}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-gray-600 p-4 border border-gray-200 rounded-lg bg-gray-50">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Insights and statistics about your user base
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">{analytics.activeCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive Users
                </p>
                <p className="text-2xl font-bold">{analytics.inactiveCount}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Rate
                </p>
                <p className="text-2xl font-bold">
                  {analytics.activePercentage}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Role Distribution and Active Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Users" radius={[8, 8, 0, 0]}>
                  {analytics.roleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ROLE_COLORS[entry.role] || "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Active vs Inactive */}
        <Card>
          <CardHeader>
            <CardTitle>Active vs Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Registration Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>User Registrations Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics.registrationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Daily Registrations"
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={2}
                name="Cumulative Total"
                dot={{ fill: "#10b981", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></div>
              <p>
                <span className="font-semibold">Role Distribution:</span> The
                most common role is{" "}
                {analytics.roleData.sort((a, b) => b.count - a.count)[0]?.role}{" "}
                with {analytics.roleData.sort((a, b) => b.count - a.count)[0]?.count}{" "}
                users
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5"></div>
              <p>
                <span className="font-semibold">Activity Rate:</span>{" "}
                {analytics.activePercentage}% of users are currently active
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5"></div>
              <p>
                <span className="font-semibold">Growth:</span> Total of{" "}
                {analytics.registrationData.length} unique registration dates
                tracked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  ShoppingCart,
  Crown,
  Zap,
  Target,
  RefreshCw,
  Sparkles,
  Eye,
  ArrowRight,
  Star,
  Shield,
  Clock,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useNavigate } from "react-router";

// Enhanced stat card with glass morphism effect
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  bgClass,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  bgClass: string;
  description?: string;
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case "neutral":
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTrendBg = () => {
    switch (trend) {
      case "up":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
      case "down":
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "neutral":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      default:
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
      {/* Gradient border effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${bgClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
      ></div>
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${bgClass}`}
      ></div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-2xl bg-gradient-to-br ${bgClass} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trendValue && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getTrendBg()}`}
            >
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced metric card with better visuals
const MetricCard = ({
  title,
  items,
  bgClass,
  icon: Icon,
}: {
  title: string;
  items: {
    label: string;
    value: string;
    subtext?: string;
    icon?: React.ElementType;
  }[];
  bgClass: string;
  icon: React.ElementType;
}) => (
  <Card
    className={`relative overflow-hidden border-0 ${bgClass} text-white shadow-xl hover:shadow-2xl transition-all duration-500 group`}
  >
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 transform translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 transform -translate-x-12 translate-y-12"></div>
    </div>

    <CardContent className="p-6 relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-center mb-2 gap-2">
              {item.icon && <item.icon className="h-5 w-5" />}
              <p className="text-xl font-bold">{item.value}</p>
            </div>
            <p className="text-sm opacity-90 font-medium">{item.label}</p>
            {item.subtext && (
              <p className="text-xs opacity-75 mt-1">{item.subtext}</p>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Enhanced detail card with better layout
// Enhanced detail card with better layout
const DetailCard = ({
  title,
  icon: Icon,
  children,
  accentColor = "blue",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accentColor?: string;
}) => {
  const colorClasses: { [key: string]: string } = {
    blue: "text-blue-500 bg-blue-500",
    purple: "text-purple-500 bg-purple-500",
    emerald: "text-emerald-500 bg-emerald-500",
    orange: "text-orange-500 bg-orange-500",
  };

  // Fallback to blue if color doesn't exist
  const colorClass = colorClasses[accentColor] || colorClasses.blue;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
          <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${colorClass.split(" ")[0]}`} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Quick action card with enhanced design
const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
  count,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  count?: number;
}) => (
  <Card className="group relative overflow-hidden cursor-pointer border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
    ></div>

    <CardContent className="p-6 relative z-10" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}
          >
            <Icon
              className={`h-6 w-6 ${color
                .replace("bg-", "text-")
                .replace("from-", "")
                .replace(" to-blue-600", "")}`}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
            {count !== undefined && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {count} items
              </Badge>
            )}
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const {
    productStats,
    userStats,
    loading,
    error,
    fetchProductStats,
    fetchUserStats,
    clearError,
  } = useDashboardStore();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductStats();
    fetchUserStats();
    setLastUpdated(new Date());
  }, [fetchProductStats, fetchUserStats]);

  const handleRefreshAll = () => {
    fetchProductStats();
    fetchUserStats();
    setLastUpdated(new Date());
  };

  if (loading && !productStats && !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin mb-4">
              <BarChart3 className="h-16 w-16 text-blue-500 mx-auto" />
            </div>
            <div className="absolute inset-0 animate-ping">
              <BarChart3 className="h-16 w-16 text-blue-300 mx-auto opacity-20" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your business insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Enhanced Header */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

          <CardContent className="p-5 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                    <p className="text-white/90 text-lg">
                      Real-time insights into your business performance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Activity className="h-4 w-4" />
                    <span>Live Data</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleRefreshAll}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <RefreshCw
                  className={`h-5 w-5 mr-3 ${loading ? "animate-spin" : ""}`}
                />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Card className="border-0 bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      Error Loading Data
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productStats && (
            <>
              <StatCard
                title="Total Products"
                value={productStats.totalProducts}
                icon={Package}
                color="text-blue-600"
                bgClass="from-blue-500 to-blue-600"
                trend="neutral"
                trendValue="All time"
                description="Complete product catalog"
              />
              <StatCard
                title="Active Products"
                value={productStats.activeProducts}
                icon={CheckCircle}
                color="text-emerald-600"
                bgClass="from-emerald-500 to-emerald-600"
                trend="up"
                trendValue={`${(
                  (productStats.activeProducts / productStats.totalProducts) *
                  100
                ).toFixed(0)}%`}
                description="Currently available for sale"
              />
            </>
          )}
          {userStats && (
            <>
              <StatCard
                title="Total Users"
                value={userStats.totalUsers}
                icon={Users}
                color="text-purple-600"
                bgClass="from-purple-500 to-purple-600"
                trendValue="All time"
                description="Registered user accounts"
              />
              <StatCard
                title="Active Users"
                value={userStats.activeUsers}
                icon={UserCheck}
                color="text-orange-600"
                bgClass="from-orange-500 to-orange-600"
                trend="down"
                trendValue={`${(
                  (userStats.activeUsers / userStats.totalUsers) *
                  100
                ).toFixed(0)}%`}
                description="Currently engaged users"
              />
            </>
          )}
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Overview */}
          {productStats && (
            <MetricCard
              title="Product Analytics"
              bgClass="bg-gradient-to-br from-blue-600 to-blue-700"
              icon={Package}
              items={[
                {
                  label: "In Stock",
                  value: `${(
                    (productStats.inStockProducts /
                      productStats.totalProducts) *
                    100
                  ).toFixed(0)}%`,
                  subtext: `${productStats.inStockProducts} products`,
                  icon: ShoppingCart,
                },
                {
                  label: "Low Stock",
                  value: productStats.lowStockProducts.toString(),
                  subtext: "Need attention",
                  icon: AlertTriangle,
                },
                {
                  label: "New Products",
                  value: productStats.newProducts.toString(),
                  subtext: "Last 30 days",
                  icon: Zap,
                },
                {
                  label: "Out of Stock",
                  value: productStats.outOfStockProducts.toString(),
                  subtext: "Need restock",
                  icon: XCircle,
                },
              ]}
            />
          )}

          {/* User Overview */}
          {userStats && (
            <MetricCard
              title="User Analytics"
              bgClass="bg-gradient-to-br from-purple-600 to-purple-700"
              icon={Users}
              items={[
                {
                  label: "Verified",
                  value: `${(
                    (userStats.verifiedUsers / userStats.totalUsers) *
                    100
                  ).toFixed(0)}%`,
                  subtext: `${userStats.verifiedUsers} users`,
                  icon: Shield,
                },
                {
                  label: "Admin Users",
                  value: userStats.adminUsers.toString(),
                  subtext: "System access",
                  icon: Crown,
                },
                {
                  label: "New Users",
                  value: userStats.newUsers.toString(),
                  subtext: "Last 30 days",
                  icon: Star,
                },
                {
                  label: "Active This Week",
                  value: userStats.activeThisWeek.toString(),
                  subtext: "Recent activity",
                  icon: Activity,
                },
              ]}
            />
          )}
        </div>

        {/* Enhanced Detail Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Health */}
          {productStats && (
            <DetailCard
              title="Product Health"
              icon={PieChart}
              accentColor="blue"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {productStats.activeProducts}
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      Active
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {productStats.inStockProducts}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      In Stock
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {productStats.lowStockProducts}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                      Low Stock
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Stock Health Score
                    </span>
                    <Badge
                      variant={
                        productStats.lowStockProducts > 5
                          ? "destructive"
                          : productStats.lowStockProducts > 0
                          ? "secondary"
                          : "default"
                      }
                      className="font-semibold"
                    >
                      {productStats.lowStockProducts > 5
                        ? "Critical"
                        : productStats.lowStockProducts > 0
                        ? "Warning"
                        : "Excellent"}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      ((productStats.inStockProducts -
                        productStats.lowStockProducts) /
                        productStats.totalProducts) *
                      100
                    }
                    className="h-3"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(
                      ((productStats.inStockProducts -
                        productStats.lowStockProducts) /
                        productStats.totalProducts) *
                      100
                    ).toFixed(1)}
                    % of products are well-stocked
                  </p>
                </div>
              </div>
            </DetailCard>
          )}

          {/* User Engagement */}
          {userStats && (
            <DetailCard
              title="User Engagement"
              icon={Activity}
              accentColor="purple"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {userStats.activeUsers}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                      Active Users
                    </div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {userStats.verifiedUsers}
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      Verified
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Weekly Engagement
                    </span>
                    <Badge variant="secondary" className="font-semibold">
                      {(
                        (userStats.activeThisWeek / userStats.totalUsers) *
                        100
                      ).toFixed(0)}
                      % active
                    </Badge>
                  </div>
                  <Progress
                    value={
                      (userStats.activeThisWeek / userStats.totalUsers) * 100
                    }
                    className="h-3"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userStats.activeThisWeek} users were active this week
                  </p>
                </div>
              </div>
            </DetailCard>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        <DetailCard title="Quick Actions" icon={Zap} accentColor="emerald">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
              title="Manage Products"
              description="View and edit your product catalog"
              icon={Package}
              color="from-blue-500 to-blue-600"
              count={productStats?.totalProducts}
              onClick={() => navigate("/products")}
            />
            <QuickActionCard
              title="User Management"
              description="Manage user accounts and permissions"
              icon={Users}
              color="from-purple-500 to-purple-600"
              count={userStats?.totalUsers}
              onClick={() => navigate("/users")}
            />
          </div>
        </DetailCard>
      </div>
    </div>
  );
}

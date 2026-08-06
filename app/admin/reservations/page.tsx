"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Plus,
  Calendar,
  Car,
  DollarSign,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ReservationsTable } from "@/components/admin/reservations/reservation-table";
import { StatCard, formatGrowth } from "@/components/admin/shared/stat-card";
import { ChartCard } from "@/components/admin/shared/chart-card";
import { DashboardSkeleton } from "@/components/admin/shared/dashboard-skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
import { useBooleanQueryParam } from "@/hooks/use-query-param";

const CreateReservationDialog = dynamic(
  () =>
    import("@/components/admin/reservations/create-reservation-dialog").then(
      (m) => m.CreateReservationDialog,
    ),
  { ssr: false },
);

const chartConfig = {
  reservations: {
    label: "Reservations",
    color: "var(--primary)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--secondary)",
  },
};

export default function ReservationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showCharts, setShowCharts] = useBooleanQueryParam("analytics");
  const now = usePeriodicNow();
  const monthNow =
    now === null
      ? null
      : Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth());

  // Fetch real data from Convex
  const stats = useQuery(
    api.reservations.getReservationStats,
    now === null ? "skip" : { now },
  );
  const monthlyData = useQuery(
    api.reservations.getMonthlyChartData,
    monthNow === null ? "skip" : { now: monthNow },
  );
  const formattedMonthlyData = monthlyData?.map((item) => ({
    ...item,
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${item.month}-01T00:00:00Z`)),
  }));

  // Loading state
  if (stats === undefined || monthlyData === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations Management</h1>
            <p className="text-muted-foreground">
              Manage reservations and track performance metrics
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reservation
          </Button>
        </div>

        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations Management</h1>
          <p className="text-muted-foreground">
            Manage reservations and track performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCharts(!showCharts)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
            {showCharts ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reservation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid shrink-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reservations this month"
          icon={Calendar}
          value={stats.totalReservations}
          subtext={formatGrowth(stats.reservationGrowth)}
        />
        <StatCard
          title="Active Reservations this month"
          icon={Car}
          value={stats.activeReservations}
          subtext="Currently ongoing"
        />
        <StatCard
          title="Monthly Revenue"
          icon={DollarSign}
          value={`€${stats.currentMonthRevenue.toLocaleString()}`}
          subtext={formatGrowth(stats.revenueGrowth)}
        />
        <StatCard
          title="Pending Confirmations"
          icon={Clock}
          value={stats.pendingConfirmations}
          subtext="Awaiting approval"
        />
      </div>

      {/* Charts (collapsed by default so the table gets the vertical space) */}
      {showCharts && (
        <div className="grid shrink-0 gap-4 md:grid-cols-2">
          <ChartCard
            title="Monthly Reservations"
            icon={TrendingUp}
            config={chartConfig}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedMonthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="reservations"
                  fill="var(--color-reservations)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Revenue Trend"
            icon={DollarSign}
            config={chartConfig}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedMonthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-reservations)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-reservations)",
                    strokeWidth: 2,
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Reservations Table */}
      <Card className="min-h-[24rem] flex-1">
        <CardHeader className="shrink-0">
          <CardTitle>All Reservations</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <ReservationsTable
            fullHeight
            onCreate={() => setIsCreateDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <CreateReservationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Table will automatically refresh due to Convex reactivity
        }}
      />
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Car, Calendar, DollarSign, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePeriodicNow } from "@/hooks/use-periodic-now";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  reservations: {
    label: "Reservations",
    color: "var(--primary)",
  },
};

export default function AdminOverviewPage() {
  const now = usePeriodicNow();
  const fleetStats = useQuery(api.vehicles.getFleetStats);
  const reservationStats = useQuery(
    api.reservations.getReservationStats,
    now === null ? "skip" : { now },
  );
  const rangeNow = now ?? 0;
  const monthlyRanges = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(rangeNow);
    month.setHours(0, 0, 0, 0);
    month.setDate(1);
    month.setMonth(month.getMonth() - (5 - index));
    const nextMonth = new Date(month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      month: month.toLocaleDateString("en-US", { month: "short" }),
      start: month.getTime(),
      end: nextMonth.getTime(),
    };
  });
  const monthlyRevenueData = useQuery(
    api.reservations.getOverviewMonthlyRevenue,
    now === null ? "skip" : { months: monthlyRanges },
  );
  const weeklyRanges = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(rangeNow);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (6 - index));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
      day: start.toLocaleDateString("en-US", { weekday: "short" }),
      start: start.getTime(),
      end: end.getTime(),
    };
  });
  const weeklyReservationData = useQuery(
    api.reservations.getWeeklyReservationChartData,
    now === null ? "skip" : { days: weeklyRanges },
  );
  const currentMonthRevenue = monthlyRevenueData?.at(-1)?.revenue ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Rent&apos;n Go admin dashboard
        </p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fleetStats?.totalVehicles ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Fleet inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Reservations
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservationStats?.confirmedReservations ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {reservationStats?.pendingConfirmations ?? 0} pending
              confirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{currentMonthRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reservations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservationStats?.totalReservations ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyReservationData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="reservations"
                    fill="var(--color-reservations)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

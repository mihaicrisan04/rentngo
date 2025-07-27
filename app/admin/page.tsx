"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Car, 
  Calendar, 
  DollarSign, 
  TrendingUp 
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  // Fetch real data from Convex
  const vehicles = useQuery(api.vehicles.getAllVehicles);
  const reservations = useQuery(api.reservations.getAllReservations);

  // Calculate statistics from real data
  const totalVehicles = vehicles?.length || 0;
  const activeReservations = reservations?.filter(r => r.status === "confirmed").length || 0;
  const pendingReservations = reservations?.filter(r => r.status === "pending").length || 0;
  
  // Calculate monthly revenue from reservations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = reservations?.filter(r => {
    const reservationDate = new Date(r.startDate);
    return reservationDate.getMonth() === currentMonth && 
           reservationDate.getFullYear() === currentYear &&
           (r.status === "confirmed" || r.status === "completed");
  }).reduce((sum, r) => sum + r.totalPrice, 0) || 0;

  // Calculate last 7 days reservations for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const weeklyReservationData = last7Days.map(date => {
    const dayReservations = reservations?.filter(r => {
      const reservationDate = new Date(r.startDate);
      return reservationDate.toDateString() === date.toDateString();
    }).length || 0;

    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      reservations: dayReservations
    };
  });

  // Calculate last 6 months revenue for the trend chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date;
  });

  const monthlyRevenueData = last6Months.map(date => {
    const monthRevenue = reservations?.filter(r => {
      const reservationDate = new Date(r.startDate);
      return reservationDate.getMonth() === date.getMonth() && 
             reservationDate.getFullYear() === date.getFullYear() &&
             (r.status === "confirmed" || r.status === "completed");
    }).reduce((sum, r) => sum + r.totalPrice, 0) || 0;

    return {
      month: date.toLocaleDateString('en', { month: 'short' }),
      revenue: monthRevenue
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Rent'n Go admin dashboard
        </p>
      </div>
      
      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              Fleet inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations}</div>
            <p className="text-xs text-muted-foreground">
              {pendingReservations} pending confirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
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
  )
}

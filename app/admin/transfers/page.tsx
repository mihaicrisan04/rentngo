"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, formatGrowth } from "@/components/admin/shared/stat-card";
import { ChartCard } from "@/components/admin/shared/chart-card";
import { DashboardSkeleton } from "@/components/admin/shared/dashboard-skeleton";
import { TransfersTable } from "@/components/admin/transfers/transfer-table";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Car,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Settings,
} from "lucide-react";

const TransferPricingDialog = dynamic(
  () =>
    import("@/components/admin/transfers/transfer-pricing-dialog").then(
      (m) => m.TransferPricingDialog,
    ),
  { ssr: false },
);

const chartConfig = {
  transfers: {
    label: "Transfers",
    color: "var(--primary)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--secondary)",
  },
};

const ITEMS_PER_PAGE = 10;

export default function AdminTransfersPage() {
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const now = usePeriodicNow();
  const monthNow =
    now === null
      ? null
      : Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth());

  const stats = useQuery(
    api.transfers.getTransferStats,
    now === null ? "skip" : { now },
  );
  const monthlyData = useQuery(
    api.transfers.getMonthlyTransferChartData,
    monthNow === null ? "skip" : { now: monthNow },
  );
  const formattedMonthlyData = monthlyData?.map((item) => ({
    ...item,
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${item.month}-01T00:00:00Z`)),
  }));
  const {
    results: transfers,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.transfers.getAllTransfersPaginated,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  if (
    stats === undefined ||
    monthlyData === undefined ||
    paginationStatus === "LoadingFirstPage"
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transfers Management</h1>
            <p className="text-muted-foreground">
              Manage VIP transfers and track performance metrics
            </p>
          </div>
        </div>

        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfers Management</h1>
          <p className="text-muted-foreground">
            Manage VIP transfers and track performance metrics
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowPricingDialog(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Pricing Tiers
        </Button>
      </div>

      <TransferPricingDialog
        open={showPricingDialog}
        onOpenChange={setShowPricingDialog}
      />

      <div className="grid shrink-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transfers"
          icon={Calendar}
          value={stats.totalTransfers}
          subtext={formatGrowth(stats.transferGrowth)}
        />
        <StatCard
          title="Active Transfers"
          icon={Car}
          value={stats.activeTransfers}
          subtext="Upcoming transfers"
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

      <div className="grid shrink-0 gap-4 md:grid-cols-2">
        <ChartCard
          title="Monthly Transfers"
          icon={TrendingUp}
          config={chartConfig}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedMonthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="transfers"
                fill="var(--color-transfers)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend" icon={DollarSign} config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedMonthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-transfers)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-transfers)",
                  strokeWidth: 2,
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="min-h-[24rem] flex-1">
        <CardHeader className="shrink-0">
          <CardTitle>All Transfers</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <TransfersTable
            transfers={transfers}
            paginationStatus={paginationStatus}
            loadMore={loadMore}
            fullHeight
          />
        </CardContent>
      </Card>
    </div>
  );
}

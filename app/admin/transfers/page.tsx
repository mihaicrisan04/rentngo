"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePeriodicNow } from "@/hooks/use-periodic-now";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatPrice } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Users,
  ArrowRight,
  Luggage,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

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

  const updateStatus = useMutation(api.transfers.updateTransferStatus);
  const deleteTransfer = useMutation(api.transfers.deleteTransferPermanently);

  const handleStatusUpdate = async (
    transferId: Id<"transfers">,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ) => {
    try {
      await updateStatus({ transferId, newStatus });
      toast.success("Transfer status updated", {
        description: `Status changed to ${newStatus}`,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to update status", {
        description: "Please try again later.",
        position: "bottom-right",
      });
      console.error("Status update error:", error);
    }
  };

  const handleDelete = async (
    transferId: Id<"transfers">,
    customerName: string,
  ) => {
    if (
      confirm(
        `Are you sure you want to permanently delete the transfer for ${customerName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteTransfer({ transferId });
        toast.success("Transfer deleted successfully", {
          description: `Transfer for ${customerName} has been removed.`,
          position: "bottom-right",
        });
      } catch (error) {
        toast.error("Failed to delete transfer", {
          description: "Please try again later.",
          position: "bottom-right",
        });
        console.error("Delete error:", error);
      }
    }
  };

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transfers
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransfers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.transferGrowth >= 0 ? "+" : ""}
              {stats.transferGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Transfers
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTransfers}</div>
            <p className="text-xs text-muted-foreground">Upcoming transfers</p>
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
              €{stats.currentMonthRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueGrowth >= 0 ? "+" : ""}
              {stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Confirmations
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingConfirmations}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
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
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
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
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No transfers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transfers.map((transfer) => (
                      <TableRow key={transfer._id}>
                        <TableCell className="font-medium">
                          #{transfer.transferNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transfer.customerInfo.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.customerInfo.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.customerInfo.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 max-w-[200px]">
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {transfer.pickupLocation.address.split(",")[0]}
                              </span>
                            </div>
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {transfer.dropoffLocation.address.split(",")[0]}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {transfer.vehicle ? (
                            <div>
                              <div className="font-medium">
                                {transfer.vehicle.make} {transfer.vehicle.model}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {transfer.vehicle.year}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Vehicle unavailable
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {formatDate(transfer.pickupDate)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.pickupTime}
                            </div>
                            {transfer.transferType === "round_trip" && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Round Trip
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{transfer.passengers} pax</span>
                            </div>
                            <div>{transfer.distanceKm} km</div>
                            {transfer.luggageCount !== undefined &&
                              transfer.luggageCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <Luggage className="h-3 w-3" />
                                  <span>{transfer.luggageCount} bags</span>
                                </div>
                              )}
                            {transfer.customerInfo.flightNumber && (
                              <div className="text-muted-foreground">
                                ✈ {transfer.customerInfo.flightNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(transfer.totalPrice)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {transfer.paymentMethod.replace(/_/g, " ")}
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={transfer.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {transfer.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      transfer._id,
                                      "confirmed",
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </DropdownMenuItem>
                              )}
                              {transfer.status === "confirmed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      transfer._id,
                                      "completed",
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              {(transfer.status === "pending" ||
                                transfer.status === "confirmed") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(
                                      transfer._id,
                                      "cancelled",
                                    )
                                  }
                                  className="cursor-pointer text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(
                                    transfer._id,
                                    transfer.customerInfo.name,
                                  )
                                }
                                className="cursor-pointer text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {paginationStatus !== "Exhausted" && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadMore(ITEMS_PER_PAGE)}
                  disabled={paginationStatus === "LoadingMore"}
                >
                  {paginationStatus === "LoadingMore"
                    ? "Loading..."
                    : "Load more"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: React.ReactNode;
  subtext: React.ReactNode;
}

export function StatCard({ title, icon: Icon, value, subtext }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}

export function formatGrowth(growth: number): string {
  return `${growth >= 0 ? "+" : ""}${growth}% from last month`;
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { LucideIcon } from "lucide-react";
import React from "react";

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  config: ChartConfig;
  children: React.ComponentProps<typeof ChartContainer>["children"];
}

export function ChartCard({
  title,
  icon: Icon,
  config,
  children,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[200px]">
          {children}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { HomeIcon, CarIcon, CalendarIcon, Settings2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="flex-1 h-screen bg-background">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4">
            <Settings2 className="w-5 h-5" />
          </SidebarHeader>
         
          <SidebarContent>
            <SidebarMenu className="px-2">
              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard") && !pathname.includes("/vehicles") && !pathname.includes("/reservations")}
                tooltip="Overview"
              >
                <Link href="/dashboard" className="px-2">
                  <HomeIcon className="w-5 h-5" />
                  <span className="ml-2">Overview</span>
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard/vehicles")}
                tooltip="Vehicles"
              >
                <Link href="/dashboard/vehicles" className="px-2">
                  <CarIcon className="w-5 h-5" />
                  <span className="ml-2">Vehicles</span>
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard/reservations")}
                tooltip="Reservations"
              >
                <Link href="/dashboard/reservations" className="px-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="ml-2">Reservations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarTrigger/>
            <UserButton/>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-auto p-8 transition-[margin] duration-300 linear ${
            open ? "ml-40" : "ml-12"
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
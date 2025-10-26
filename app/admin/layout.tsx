"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  // Check if we're in ordering routes
  const isOrderingRoute = pathSegments.includes("ordering");
  const classIdSegment =
    isOrderingRoute && pathSegments.length > 3 ? pathSegments[3] : null;

  // Fetch class name if we're on a class detail page
  const vehicleClass = useQuery(
    api.vehicleClasses.getById,
    classIdSegment ? { id: classIdSegment as Id<"vehicleClasses"> } : "skip",
  );

  const breadcrumbItems = pathSegments.map((item, index, array) => {
    const href = "/" + array.slice(0, index + 1).join("/");

    // Special handling for class ID in ordering route
    if (isOrderingRoute && index === 3 && vehicleClass) {
      return {
        href,
        label: vehicleClass.displayName || vehicleClass.name,
      };
    }

    return {
      href,
      label: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, " "),
    };
  });

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

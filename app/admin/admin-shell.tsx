"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
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

const CLASS_DETAIL_ROUTE = ["admin", "vehicles", "classes"] as const;

function matchClassDetailSegment(pathSegments: string[]) {
  const matchesPrefix =
    pathSegments.length > CLASS_DETAIL_ROUTE.length &&
    CLASS_DETAIL_ROUTE.every(
      (segment, index) => pathSegments[index] === segment,
    );
  if (!matchesPrefix) return null;
  return {
    index: CLASS_DETAIL_ROUTE.length,
    id: pathSegments[CLASS_DETAIL_ROUTE.length] as Id<"vehicleClasses">,
  };
}

function toTitleLabel(segment: string) {
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const classDetail = matchClassDetailSegment(pathSegments);

  // Fetch class name if we're on a class detail page
  const vehicleClass = useQuery(
    api.vehicleClasses.getById,
    classDetail ? { id: classDetail.id } : "skip",
  );

  const breadcrumbItems = pathSegments.map((item, index, array) => {
    const href = "/" + array.slice(0, index + 1).join("/");

    if (classDetail && index === classDetail.index && vehicleClass) {
      return {
        href,
        label: vehicleClass.displayName || vehicleClass.name,
      };
    }

    return { href, label: toTitleLabel(item) };
  });

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AdminSidebar />
      <SidebarInset className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden md:peer-data-[variant=inset]:h-[calc(100svh-(--spacing(4)))]">
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

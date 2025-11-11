"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Car,
  Calendar,
  Sun,
  ArrowRightLeft,
  LayoutDashboard,
  Building2,
  NotepadText

} from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Vehicle Management",
    url: "/admin/vehicles",
    icon: Car,
  },
  {
    title: "Reservations",
    url: "/admin/reservations",
    icon: Calendar,
  },
  {
    title: "Seasons",
    url: "/admin/seasons",
    icon: Sun,
  },
  {
    title: "Transfers",
    url: "/admin/transfers",
    icon: ArrowRightLeft,
  },
  {
    title: "Blogs",
    url: "/admin/blogs",
    icon: NotepadText,
  }
  // {
  //   title: "Settings",
  //   url: "/admin/settings",
  //   icon: Settings2,
  // },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navItemsWithActiveState = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton>
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">Rent'n Go</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItemsWithActiveState} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

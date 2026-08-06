"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Car,
  Calendar,
  Sun,
  ArrowRightLeft,
  LayoutDashboard,
  NotepadText,
  TicketPercent,
  Share2

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
    title: "Coupons",
    url: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    title: "Affiliates",
    url: "/admin/affiliates",
    icon: Share2,
  },
  {
    title: "Blogs",
    url: "/admin/blogs",
    icon: NotepadText,
  }
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navItemsWithActiveState = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex h-12 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <Image
                        src="/logo.png"
                        alt="Rent'n Go"
                        width={130}
                        height={42}
                        className="h-8 w-auto group-data-[collapsible=icon]:hidden"
                    />
                    <Image
                        src="/favicon.ico"
                        alt="Rent'n Go"
                        width={24}
                        height={24}
                        unoptimized
                        className="hidden h-6 w-6 rounded-md group-data-[collapsible=icon]:block"
                    />
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overscroll-contain">
        <NavMain items={navItemsWithActiveState} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail className="after:left-[calc(50%+2px)] group-data-[collapsible=icon]:after:left-[calc(50%+6px)] after:inset-y-auto after:top-1/2 after:h-4/5 after:-translate-y-1/2 after:rounded-full hover:after:bg-transparent hover:after:bg-gradient-to-b hover:after:from-transparent hover:after:via-sidebar-border hover:after:to-transparent" />
    </Sidebar>
  )
}

"use client"

import * as React from "react"
import { useAuth } from "@/hooks/useAuth"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { user } = useAuth()
  const activeTeam = teams[0]

  if (!activeTeam) {
    return null
  }

  // Obtener el rol del usuario para mostrarlo
  const userRole = user?.role || 'Usuario'
  const roleDisplayNames = {
    admin: 'Administrador',
    creator: 'Creador',
    validator: 'Validador',
    user: 'Usuario'
  }
  const displayRole = roleDisplayNames[userRole as keyof typeof roleDisplayNames] || userRole

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <activeTeam.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{displayRole}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

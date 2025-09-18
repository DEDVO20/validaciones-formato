"use client"

import * as React from "react"
import { useAuth } from "@/hooks/useAuth"

import {
  GalleryVerticalEnd,
  Home,
  PieChart,
  User,
  FileText,
  Edit,
  CheckSquare,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Datos de navegación del dashboard
const data = {
  teams: [
    {
      name: "Herramientas Tecnologicas",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Formatos",
      url: "/formats",
      icon: FileText,
    },
    {
      title: "Diligenciamientos",
      url: "/completions",
      icon: Edit,
    },
    {
      title: "Validaciones",
      url: "/validations",
      icon: CheckSquare,
    },
    {
      title: "Usuarios",
      url: "/users",
      icon: User,
    },

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole } = useAuth()

  // Filtrar elementos de navegación basándose en el rol del usuario
  const filteredNavMain = data.navMain.filter(item => {
    // Solo mostrar la ruta de usuarios a los administradores
    if (item.url === '/users') {
      return hasRole(['admin'])
    }
    // Solo mostrar formatos a validadores y administradores (pueden ver pero no crear)
    if (item.url === '/formats') {
      return hasRole(['admin', 'validator'])
    }
    // Solo mostrar validaciones a validadores y administradores
    if (item.url === '/validations') {
      return hasRole(['admin', 'validator'])
    }
    // Solo mostrar diligenciamientos a usuarios y administradores (validadores NO pueden hacer diligenciamientos)
    if (item.url === '/completions') {
      return hasRole(['admin', 'user'])
    }
    // Mostrar dashboard a todos los usuarios autenticados
    return true
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

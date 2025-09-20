"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import DashboardLayout from "@/components/DashboardLayout"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"

// import type { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const { token, hasRole } = useAuth()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    if (!token) return
    fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err))
  }, [token])

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (error) {
      console.error("Error eliminando usuario:", error)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "user":
        return "Usuario"
      case "validator":
        return "Validador"
      case "admin":
        return "Administrador"
      default:
        return role
    }
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => {
        return getRoleLabel(row.getValue("role"))
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: { original: User } }) => {
        const user = row.original
        
        // Solo los administradores pueden ver las acciones
        if (!hasRole(['admin'])) {
          return <span className="text-muted-foreground">Sin permisos</span>
        }
        
        return (
          <div className="flex gap-2">
            <EditUserDialog
              user={user}
              onUserUpdated={(updatedUser) =>
                setUsers((prev) =>
                  prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
                )
              }
            />

            {/* AlertDialog para eliminar */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Estás seguro de eliminar este usuario?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El usuario{" "}
                    <strong>{user.name}</strong> será eliminado
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Usuarios", isActive: true },
  ]

  // Verificar si el usuario tiene permisos de administrador
  if (!hasRole(['admin'])) {
    return (
      <DashboardLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center h-96">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumbItems={breadcrumbItems}>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <CreateUserDialog
              onUserCreated={(newUser) =>
                setUsers((prev) => [...prev, newUser])
              }
            />
          </div>

          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

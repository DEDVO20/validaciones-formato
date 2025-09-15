import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { CreateFormatDialog } from '@/components/formats/CreateFormatDialog';
import { EditFormatDialog } from '@/components/formats/EditFormatDialog';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Send } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Format {
  id: number;
  titulo: string;
  estado: 'activo' | 'inactivo';
  contenido: string;
  variables: { name: string; type: string }[];
  createdAt: string;
  updatedAt: string;
}

const FormatsPage: React.FC = () => {
  const [formats, setFormats] = useState<Format[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [formatToDelete, setFormatToDelete] = useState<Format | null>(null);
  const { hasRole, token } = useAuth();
  const navigate = useNavigate();

  const columns: ColumnDef<Format>[] = [
    {
      accessorKey: 'titulo',
      header: 'Título',
      cell: ({ row }: { row: { original: Format } }) => row.original.titulo,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }: { row: { original: Format } }) => {
        const estado = row.original.estado;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {estado}
          </span>
        );
      },
    },
    {
      accessorKey: 'variables',
      header: 'Cantidad de Variables',
      cell: ({ row }: { row: { original: Format } }) => {
        const variables = row.original.variables;
        if (!variables || !Array.isArray(variables) || variables.length === 0) {
          return <span className="text-gray-500">0</span>;
        }
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {variables.length}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de Creación',
      cell: ({ row }: { row: { original: Format } }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: { row: { original: Format } }) => {
        const format = row.original;
        return (
          <div className="flex space-x-2">
            {/* Solo administradores pueden editar y eliminar formatos */}
            {hasRole(['admin']) && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedFormat(format);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar formato</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => openDeleteDialog(format)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar formato</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {/* Todos los usuarios autenticados pueden usar formatos */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/formats/${format.id}/use`)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Usar formato</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const fetchFormats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/formats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFormats(data);
      } else {
        console.error('Error fetching formats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  const handleDeleteFormat = async () => {
    if (!token || !formatToDelete) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/formats/${formatToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setFormats(prev => prev.filter(format => format.id !== formatToDelete.id));
        setIsDeleteDialogOpen(false);
        setFormatToDelete(null);
      } else {
        console.error('Error deleting format:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting format:', error);
    }
  };

  const openDeleteDialog = (format: Format) => {
    setFormatToDelete(format);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (token) {
      fetchFormats();
    }
  }, [token]);

  const handleFormatCreated = async (formData: {
    titulo: string;
    estado: string;
    variables: { name: string; type: string }[];
    contenido: string;
  }) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/formats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newFormat = await response.json();
        setFormats(prev => [...prev, newFormat]);
        setIsCreateDialogOpen(false);
      } else {
        console.error('Error creating format:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error creating format:', error);
    }
  };

  const handleFormatUpdated = (updatedFormat: Format) => {
    setFormats(prev => prev.map(format => 
      format.id === updatedFormat.id ? updatedFormat : format
    ));
    setIsEditDialogOpen(false);
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Formatos", isActive: true },
  ];

  return (
    <DashboardLayout breadcrumbItems={breadcrumbItems}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Formatos</CardTitle>
              <CardDescription>
                Administra los formatos disponibles en el sistema
              </CardDescription>
            </div>
            {/* Solo administradores pueden crear formatos */}
            {hasRole(['admin']) && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Formato
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={formats} />
        </CardContent>
      </Card>

      <CreateFormatDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleFormatCreated}
      />

      <EditFormatDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        format={selectedFormat}
        onFormatUpdated={handleFormatUpdated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de eliminar este formato?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El formato{" "}
              <strong>{formatToDelete?.titulo}</strong> será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setFormatToDelete(null);
            }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFormat}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default FormatsPage;
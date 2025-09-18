import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/useAuth';
import { Eye, Check, X, FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import type { ColumnDef } from '@tanstack/react-table';

interface ValidationItem {
  id: number;
  completionId: number;
  validadorId: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  Validador?: {
    id: number;
    name: string;
    email: string;
  };
  Completion?: {
    id: number;
    datos: Record<string, any>;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    User?: {
      id: number;
      name: string;
      email: string;
    };
    Format?: {
      id: number;
      titulo: string;
    };
  };
}

const ValidationsPage: React.FC = () => {
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedValidation, setSelectedValidation] = useState<ValidationItem | null>(null);
  const { hasRole, token } = useAuth();
  const [previewPdf, setPreviewPdf] = useState<string>('');

  const handlePreviewPDF = async (validation: ValidationItem) => {
    try {
      if (!validation.Completion?.id) {
        console.error('No completion ID found');
        return;
      }

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Usar el endpoint apropiado según el estado de validación
      const endpoint = validation.estado === 'aprobado' 
        ? `${import.meta.env.VITE_API_URL}/pdf/preview-validated/${validation.Completion.id}`
        : `${import.meta.env.VITE_API_URL}/pdf/preview-base64/${validation.Completion.id}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewPdf(data.pdfBase64);
        setSelectedValidation(validation); // abre modal
      } else {
        console.error('Error generating PDF preview:', await response.text());
        alert("No se pudo generar la vista previa");
      }
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert("No se pudo generar la vista previa");
    }
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { variant: 'secondary' as const, label: 'Pendiente', icon: Clock },
      aprobado: { variant: 'default' as const, label: 'Aprobado', icon: Check },
      rechazado: { variant: 'destructive' as const, label: 'Rechazado', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const columns: ColumnDef<ValidationItem>[] = [
    {
      accessorKey: 'Completion.Format.titulo',
      header: 'Formato',
      cell: ({ row }: { row: { original: ValidationItem } }) => {
        return row.original.Completion?.Format?.titulo || 'N/A';
      },
    },
    {
      accessorKey: 'Completion.User.name',
      header: 'Usuario',
      cell: ({ row }: { row: { original: ValidationItem } }) => {
        return row.original.Completion?.User?.name || 'N/A';
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => {
        return getStatusBadge(getValue() as string);
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de Creación',
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Fecha de Actualización',
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: { row: { original: ValidationItem } }) => {
        const validation = row.original;
        const canValidate = validation.estado === 'pendiente';
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              title="Ver detalles"
              onClick={() => handlePreviewPDF(validation)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canValidate && hasRole(['validator', 'admin']) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 hover:text-green-700"
                  title="Aprobar"
                  onClick={() => handleValidation(validation.completionId, 'aprobado')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  title="Rechazar"
                  onClick={() => handleValidation(validation.completionId, 'rechazado')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {validation.estado === 'aprobado' && (
              <Button 
                variant="outline" 
                size="sm" 
                title="Descargar PDF"
                onClick={() => handleDownloadPDF(validation.completionId)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const fetchValidations = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Obtener diligenciamientos pendientes de validación
      const pendingResponse = await fetch('http://localhost:3000/api/validations/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Obtener todas las validaciones (incluyendo completadas)
      const allValidationsResponse = await fetch('http://localhost:3000/api/validations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const allValidations = [];
      
      // Procesar diligenciamientos pendientes
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        const pendingValidations = pendingData.map((completion: any) => ({
          id: `pending_${completion.id}`, // ID único para pendientes
          completionId: completion.id,
          validadorId: null,
          estado: 'pendiente',
          observaciones: null,
          createdAt: completion.createdAt,
          updatedAt: completion.updatedAt,
          Completion: completion
        }));
        allValidations.push(...pendingValidations);
      }
      
      // Procesar validaciones completadas
      if (allValidationsResponse.ok) {
        const completedData = await allValidationsResponse.json();
        const completedValidations = completedData.map((validation: any) => ({
          id: validation.id,
          completionId: validation.completionId,
          validadorId: validation.validadorId,
          estado: validation.estado,
          observaciones: validation.observaciones,
          createdAt: validation.createdAt,
          updatedAt: validation.updatedAt,
          Validador: validation.Validador, // Agregar información del validador
          Completion: validation.Completion
        }));
        allValidations.push(...completedValidations);
      }
      
      
      setValidations(allValidations);
    } catch (error) {
      console.error('Error fetching validations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (completionId: number, newStatus: 'aprobado' | 'rechazado') => {
    try {
      const response = await fetch(`http://localhost:3000/api/validations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          completionId: completionId,
          estado: newStatus,
          observaciones: `Validación ${newStatus}` 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error validating completion:', errorData);
        throw new Error('Error validating completion:', errorData)
      }

      fetchValidations();
    } catch (error) {
      console.error('Error validating completion:', error);
    }
  };

  const handleDownloadPDF = async (completionId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pdf/download/${completionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error downloading PDF:', errorData);
        alert('Error al descargar el PDF');
        return;
      }

      // Crear blob y descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `documento_validado_${completionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  useEffect(() => {
    if (token) fetchValidations();
  }, [token]);

  const filterValidations = (status: string) => {
    switch (status) {
      case 'pending':
        return validations.filter(v => v.estado === 'pendiente');
      case 'completed':
        return validations.filter(v => v.estado === 'aprobado' || v.estado === 'rechazado');
      default:
        return validations;
    }
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Validaciones", isActive: true },
  ];

  return (
    <DashboardLayout breadcrumbItems={breadcrumbItems}>
      <Card>
        <CardHeader>
          <CardTitle>Validaciones</CardTitle>
          <CardDescription>
            Revisa y valida los diligenciamientos enviados por los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pendientes ({filterValidations('pending').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completadas ({filterValidations('completed').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Todas ({validations.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              <DataTable columns={columns} data={filterValidations('pending')} />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <DataTable columns={columns} data={filterValidations('completed')} />
            </TabsContent>
            
            <TabsContent value="all" className="mt-4">
              <DataTable columns={columns} data={validations} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={!!selectedValidation} onOpenChange={() => setSelectedValidation(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Diligenciamiento</DialogTitle>
            <DialogDescription>
              Revisa los datos antes de aprobar o rechazar.
            </DialogDescription>
          </DialogHeader>

          {selectedValidation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Vista previa del PDF */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Vista Previa del PDF</h4>
                    {previewPdf ? (
                      <div className="border rounded-lg overflow-hidden shadow-md">
                        <iframe
                          src={`data:application/pdf;base64,${previewPdf}`}
                          className="w-full min-h-[500px] md:min-h-[700px]"
                          title="Vista previa del PDF"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 text-center text-muted-foreground min-h-[500px] md:min-h-[700px] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 mb-4" />
                          <p>Haz clic en el botón de vista previa en la tabla para generar el PDF</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna derecha: Información de usuarios y datos */}
                <div className="space-y-4">
                  {/* Información básica */}
                  <div className="p-4 bg-muted rounded-lg space-y-4">
                    <h4 className="font-semibold">Información del Documento</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Formato:</p>
                        <p className="text-sm text-muted-foreground">{selectedValidation.Completion?.Format?.titulo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estado:</p>
                        <div className="mt-1">{getStatusBadge(selectedValidation.estado)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fecha de creación:</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedValidation.createdAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                      {selectedValidation.estado !== 'pendiente' && (
                        <div>
                          <p className="text-sm font-medium">Fecha de validación:</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedValidation.updatedAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del usuario solicitante */}
                  <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-blue-900">Usuario Solicitante</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Nombre:</p>
                        <p className="text-sm text-blue-700">{selectedValidation.Completion?.User?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Email:</p>
                        <p className="text-sm text-blue-700">{selectedValidation.Completion?.User?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">ID de diligenciamiento:</p>
                        <p className="text-sm text-blue-700">{selectedValidation.Completion?.id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información del validador (si existe) */}
                  {selectedValidation.estado !== 'pendiente' && selectedValidation.Validador && (
                    <div className="p-4 bg-green-50 rounded-lg space-y-3">
                      <h4 className="font-semibold text-green-900">Información de Validación</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-green-800">Validador:</p>
                          <p className="text-sm text-green-700">{selectedValidation.Validador.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">Email del validador:</p>
                          <p className="text-sm text-green-700">{selectedValidation.Validador.email}</p>
                        </div>
                        {selectedValidation.observaciones && (
                          <div>
                            <p className="text-sm font-medium text-green-800">Observaciones:</p>
                            <p className="text-sm text-green-700">{selectedValidation.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Datos enviados */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Datos Enviados</h4>
                    <div className="bg-muted p-3 rounded-md text-sm space-y-2 max-h-[300px] overflow-y-auto">
                      {(() => {
                        let datos: Record<string, any> | null = null;

                        try {
                          const raw = selectedValidation?.Completion?.datos;
                          if (typeof raw === "string") {
                            datos = JSON.parse(raw);
                          } else if (typeof raw === "object" && raw !== null) {
                            datos = raw;
                          }
                        } catch (err) {
                          console.error("Error al procesar datos:", err);
                        }

                        if (datos && Object.keys(datos).length > 0) {
                          return Object.entries(datos).map(([key, value]) => (
                            <div key={key} className="border-b border-muted-foreground/20 pb-2 last:border-b-0">
                              <div className="text-sm">
                                <span className="font-medium text-foreground capitalize">
                                  {key}:
                                </span>
                                <span className="ml-2 text-muted-foreground">
                                  {typeof value === "object" && value !== null
                                    ? JSON.stringify(value)
                                    : String(value ?? "")}
                                </span>
                              </div>
                            </div>
                          ));
                        }

                        return (
                          <div className="text-xs text-muted-foreground">
                            No hay datos disponibles
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ValidationsPage;

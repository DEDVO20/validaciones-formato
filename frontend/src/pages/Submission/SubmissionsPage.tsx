import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { FormatPreview } from '@/components/formats/FormatPreview';

interface Submission  {
  id: number;
  formatId: number;
  usuarioId: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  datos: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  Format?: {
    titulo: string;
  };
  User?: {
    name: string;
    email: string;
  };
}

interface Format {
  id: number;
  titulo: string;
  contenido: string;
  variables: Array<{
    name: string;
    type: string;
  }>;
  estado: 'activo' | 'inactivo';
}

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string>('');
  const { hasRole, token, logout } = useAuth();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { variant: 'secondary' as const, label: 'Pendiente' },
      aprobado: { variant: 'default' as const, label: 'Aprobado' },
      rechazado: { variant: 'destructive' as const, label: 'Rechazado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: 'Format.titulo',
      header: 'Formato',
      cell: ({ row }: { row: { original: Submission } }) => {
        return row.original.Format?.titulo || 'N/A';
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
      header: 'Última Actualización',
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: { row: { original: Submission } }) => {
        const submission = row.original;
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              title="Ver detalles"
              onClick={() => handleViewDetails(submission)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {submission.estado === 'aprobado' && (
              <Button 
                variant="outline" 
                size="sm" 
                title="Descargar PDF"
                onClick={() => handleDownloadPDF(submission.id)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const fetchSubmissions = async () => {  
    try {
      setLoading(true);
      
      const response = await fetch('/api/completions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        logout();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        console.error('Error fetching completions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching completions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  const fetchFormats = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/formats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormats(data.filter((f: Format) => f.estado === 'activo'));
      }
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  const handleNewCompletion = () => {
    fetchFormats();
    setShowNewDialog(true);
  };

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    const format = formats.find(f => f.id === parseInt(formatId));
    if (format) {
      const initialData: Record<string, any> = {};
      format.variables.forEach(variable => {
        initialData[variable.name] = '';
      });
      setFormData(initialData);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handlePreviewCompletion = () => {
    if (!selectedFormat) {
      alert('Selecciona un formato primero');
      return;
    }
    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const handleViewDetails = async (submission: Submission) => {
    try {
      if (!submission.id) {
        console.error('No submission ID found');
        return;
      }

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const endpoint = submission.estado === 'aprobado' 
        ? `${import.meta.env.VITE_API_URL}/pdf/preview-validated/${submission.id}`
        : `${import.meta.env.VITE_API_URL}/pdf/preview-base64/${submission.id}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewPdf(data.pdfBase64);
        setSelectedSubmission(submission);
        setShowDetails(true);
      } else {
        console.error('Error generating PDF preview:', await response.text());
        alert("No se pudo generar la vista previa");
      }
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert("No se pudo generar la vista previa");
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedSubmission(null);
    setPreviewPdf('');
  };

  const resetForm = () => {
    setShowNewDialog(false);
    setShowPreview(false);
    setSelectedFormat('');
    setFormData({});
  };

  const handleSubmitCompletion = async () => {
    if (!selectedFormat || !token) {
      alert('Faltan datos requeridos: formato o token');
      return;
    }
    
    try {
      const response = await fetch('/api/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formatId: parseInt(selectedFormat),
          datos: formData
        })
      });
      
      if (response.ok) {
        resetForm();
        fetchSubmissions();
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`Error: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error creating completion:', error);
      alert('Error de conexión al servidor');
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

  const renderFormField = (variable: any) => {
    const { name, type } = variable;
    
    switch (type) {
      case 'text':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {name}
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );
      case 'number':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {name}
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );
      case 'date':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {name}
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );
      default:
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {name}
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout breadcrumbItems={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Diligenciamientos", isActive: true },
      ]}>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Cargando diligenciamientos...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Diligenciamientos", isActive: true },
  ];

  const pendingSubmissions = submissions.filter(s => s.estado === 'pendiente');
  const completedSubmissions = submissions.filter(s => s.estado === 'aprobado' || s.estado === 'rechazado');

  return (
    <DashboardLayout breadcrumbItems={breadcrumbItems}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Diligenciamientos</CardTitle>
              <CardDescription>
                Gestiona tus formularios diligenciados
              </CardDescription>
            </div>
            {hasRole(['user', 'creator', 'admin']) && (
              <Button onClick={handleNewCompletion}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Diligenciamiento
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No tienes diligenciamientos aún
              </p>
              <Button onClick={handleNewCompletion}>
                <Plus className="mr-2 h-4 w-4" />
                Crear tu primer diligenciamiento
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Pendientes ({pendingSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completados ({completedSubmissions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-6">
                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No tienes diligenciamientos pendientes
                    </p>
                  </div>
                ) : (
                  <DataTable columns={columns} data={pendingSubmissions} />
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                {completedSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No tienes diligenciamientos completados
                    </p>
                  </div>
                ) : (
                  <DataTable columns={columns} data={completedSubmissions} />
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showPreview ? 'Vista Previa del Diligenciamiento' : 'Crear Nuevo Diligenciamiento'}
            </DialogTitle>
            <DialogDescription>
              {showPreview 
                ? 'Revisa la información antes de enviar'
                : 'Selecciona un formato y completa los campos requeridos.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {!showPreview ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Formato *</label>
                <Select value={selectedFormat} onValueChange={handleFormatSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((format) => (
                      <SelectItem key={format.id} value={format.id.toString()}>
                        {format.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFormat && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Campos del Formato</h3>
                  {formats.find(f => f.id === parseInt(selectedFormat))?.variables.map((variable) => renderFormField(variable))}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePreviewCompletion}
                  disabled={!selectedFormat}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Vista Previa
                </Button>
                <Button 
                  onClick={handleSubmitCompletion}
                  disabled={!selectedFormat}
                >
                  Crear Diligenciamiento
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedFormat && (() => {
                const format = formats.find(f => f.id === parseInt(selectedFormat))!;
                const compatibleFormat = {
                  ...format,
                  variables: format.variables.map(v => ({
                    name: v.name,
                    type: v.type
                  }))
                };
                return (
                  <FormatPreview
                    format={compatibleFormat}
                    formData={formData}
                    onApprove={handleSubmitCompletion}
                    onReject={handleBackToForm}
                    onDownloadPDF={() => {}}
                    showActions={true}
                  />
                );
              })()}
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBackToForm}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Formulario
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitCompletion}>
                    Crear Diligenciamiento
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={handleCloseDetails}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Diligenciamiento</DialogTitle>
            <DialogDescription>
              Vista previa del documento generado.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold mb-2">Vista Previa del PDF</h4>
                {previewPdf ? (
                  <div className="border rounded-lg overflow-hidden shadow-md">
                    <iframe
                      src={`data:application/pdf;base64,${previewPdf}`}
                      className="w-full min-h-[500px] md:min-h-[600px]"
                      title="Vista previa del PDF"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground min-h-[500px] md:min-h-[600px] flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 mb-4" />
                      <p>Generando vista previa del PDF...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-muted rounded-lg space-y-4">
                  <h4 className="font-semibold">Información del Documento</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Formato:</p>
                      <p className="text-sm text-muted-foreground">{selectedSubmission.Format?.titulo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estado:</p>
                      <div className="mt-1">{getStatusBadge(selectedSubmission.estado)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Fecha de creación:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedSubmission.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Última actualización:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedSubmission.updatedAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ID de diligenciamiento:</p>
                      <p className="text-sm text-muted-foreground">{selectedSubmission.id}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-blue-900">Usuario Solicitante</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Nombre:</p>
                      <p className="text-sm text-blue-700">{selectedSubmission.User?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Email:</p>
                      <p className="text-sm text-blue-700">{selectedSubmission.User?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">ID de usuario:</p>
                      <p className="text-sm text-blue-700">{selectedSubmission.usuarioId}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <h4 className="font-semibold">Datos Enviados</h4>
                  <div className="bg-muted p-3 rounded-md text-sm space-y-2 max-h-[300px] overflow-y-auto">
                    {(() => {
                      let datos: Record<string, any> | null = null;

                      try {
                        const raw = selectedSubmission?.datos;
                        if (typeof raw === "string") {
                          datos = JSON.parse(raw);
                        } else if (typeof raw === "object" && raw !== null) {
                          datos = raw;
                        }
                      } catch (err) {
                        console.error("Error al procesar datos:", err);
                      }

                      if (!datos || Object.keys(datos).length === 0) {
                        return (
                          <div className="text-xs text-muted-foreground">
                            No hay datos disponibles
                          </div>
                        );
                      }

                      return Object.entries(datos).map(([key, value]) => (
                        <div key={key} className="border-b border-border/50 pb-1 mb-1 last:border-b-0">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-2">{String(value)}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseDetails}>
              Cerrar
            </Button>
            {selectedSubmission?.estado === 'aprobado' && (
              <Button 
                onClick={() => handleDownloadPDF(selectedSubmission.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubmissionsPage;

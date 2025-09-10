import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface Variable {
  name: string;
  type: string;
}

interface Format {
  id: number;
  titulo: string;
  contenido: string;
  variables: Variable[];
}

interface FormatPreviewProps {
  format: Format;
  formData: Record<string, any>;
  onApprove?: () => void;
  onReject?: () => void;
  onDownloadPDF?: () => void;
  showActions?: boolean;
  className?: string;
}

export function FormatPreview({
  format,
  formData,
  onApprove,
  onReject,
  onDownloadPDF,
  showActions = false,
  className = ""
}: FormatPreviewProps) {
  // Función para reemplazar variables en el contenido
  const renderPreviewContent = () => {
    let content = format.contenido;
    
    // Reemplazar variables con los datos del formulario
    format.variables.forEach((variable) => {
      const value = formData[variable.name];
      const displayValue = value !== undefined && value !== null && value !== '' 
        ? String(value) 
        : `[${variable.name}]`; // Mostrar placeholder si no hay valor
      
      const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g');
      content = content.replace(regex, displayValue);
    });
    
    return content;
  };

  const previewContent = renderPreviewContent();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa: {format.titulo}
          </CardTitle>
          {onDownloadPDF && (
            <Button variant="outline" size="sm" onClick={onDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Contenido del formato con variables reemplazadas */}
        <div className="mb-6">
          <div 
            className="prose max-w-none p-4 border rounded-lg bg-white min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>

        {/* Datos del formulario */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-sm text-gray-600">Datos ingresados:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {format.variables.map((variable) => {
              const value = formData[variable.name];
              return (
                <div key={variable.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium text-sm">{variable.name}:</span>
                  <span className="text-sm text-gray-700">
                    {value !== undefined && value !== null && value !== '' 
                      ? String(value) 
                      : <em className="text-gray-400">Sin valor</em>
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        {showActions && (onApprove || onReject) && (
          <div className="flex gap-3 pt-4 border-t">
            {onReject && (
              <Button 
                variant="destructive" 
                onClick={onReject}
                className="flex-1"
              >
                Rechazar
              </Button>
            )}
            {onApprove && (
              <Button 
                onClick={onApprove}
                className="flex-1"
              >
                Aprobar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FormatPreview;

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Variable {
  name: string;
  type: string;
}

interface FormatoEditorProps {
  contenido: string;
  onChange: (nuevoContenido: string) => void;
  variables: Variable[]; // 👈 ahora se pasan dinámicamente
}

export default function FormatoEditor({
  contenido,
  onChange,
  variables,
}: FormatoEditorProps) {
  // Insertar variable en el contenido
  const insertarVariable = (variable: string) => {
    onChange(contenido + " {{" + variable + "}}");
  };

  // Renderizar vista previa reemplazando variables con datos de ejemplo
  const renderVistaPrevia = () => {
    let texto = contenido;
    variables.forEach((v) => {
      const ejemplo =
        v.type === "text"
          ? "Ejemplo texto"
          : v.type === "number"
          ? "123"
          : "2025-09-04";
      texto = texto.replaceAll(`{{${v.name}}}`, ejemplo);
    });
    return texto;
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-lg">Editor de Formato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de variables */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Insertar variable</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {variables.map((v) => (
              <DropdownMenuItem key={v.name} onClick={() => insertarVariable(v.name)}>
                {`{{${v.name}}}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Editor de texto */}
        <Textarea
          value={contenido}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu formato aquí..."
          className="h-40"
        />

        {/* Vista previa */}
        <div className="p-3 border rounded-lg bg-muted">
          <h3 className="font-semibold mb-2">Vista previa:</h3>
          <p className="whitespace-pre-wrap">{renderVistaPrevia()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

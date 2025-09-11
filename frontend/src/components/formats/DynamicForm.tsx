import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export interface Variable {
  name: string;
  type: string;
}

interface Format {
  id: number;
  titulo: string;
  variables: Variable[];
  contenido: string;
}

interface DynamicFormProps {
  format: Format;
  onSubmitted: (data: any) => void;
  onDataChange?: (data: Record<string, any>) => void;
}

export function DynamicForm({ format, onSubmitted, onDataChange }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitted({ formatoId: format.id, datos: formData });
  };

  const renderInput = (variable: Variable) => {
    switch (variable.type) {
      case "text":
        return (
          <Input
            type="text"
            value={formData[variable.name] || ""}
            onChange={(e) => handleChange(variable.name, e.target.value)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={formData[variable.name] || ""}
            onChange={(e) => handleChange(variable.name, Number(e.target.value))}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={formData[variable.name] || ""}
            onChange={(e) => handleChange(variable.name, e.target.value)}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={formData[variable.name] || ""}
            onChange={(e) => handleChange(variable.name, e.target.value)}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">{format.titulo}</h2>

      {format.variables.map((variable) => (
        <div key={variable.name} className="space-y-2">
          <Label htmlFor={variable.name}>{variable.name}</Label>
          {renderInput(variable)}
        </div>
      ))}

      <Button type="submit">Enviar</Button>
    </form>
  );
}

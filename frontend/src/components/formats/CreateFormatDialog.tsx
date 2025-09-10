"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExtension from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

interface Variable {
  name: string
  type: "text" | "number" | "date"
}

interface Format {
  id: number
  titulo: string
  estado: "activo" | "inactivo"
  contenido: string
  variables: Variable[]
  createdAt: string
  updatedAt: string
}

interface CreateFormatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (newFormat: Format) => void
}

const VARIABLE_TYPES: Variable["type"][] = ["text", "number", "date"]

export function CreateFormatDialog({
  open,
  onOpenChange,
  onSave,
}: CreateFormatDialogProps) {
  const { token } = useAuth()

  const [formData, setFormData] = useState<Omit<Format, "id" | "createdAt" | "updatedAt">>({
    titulo: "",
    estado: "activo",
    contenido: "",
    variables: [],
  })

  const [newVariable, setNewVariable] = useState<Variable>({ name: "", type: "text" })
  const [isLoading, setIsLoading] = useState(false)

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: "<p>Escribe el contenido del formato aquí...</p>",
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, contenido: editor.getHTML() }))
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        titulo: "",
        estado: "activo",
        contenido: "",
        variables: [],
      })
      setNewVariable({ name: "", type: "text" })
      if (editor) {
        editor.commands.setContent("<p>Escribe el contenido del formato aquí...</p>")
      }
    }
  }, [open, editor])

  const handleAddVariable = () => {
    if (newVariable.name.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }))
      setNewVariable({ name: "", type: "text" })
    }
  }

  const handleRemoveVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }))
  }

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.commands.insertContent(` {{${variable}}} `)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/formats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newFormat = await response.json()
        onSave(newFormat)
        onOpenChange(false)
      } else {
        console.error('Error creating format')
      }
    } catch (error) {
      console.error('Error creating format:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!editor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Formato</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Título */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="titulo" className="text-right">
                Título
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ingrese el título del formato"
                className="col-span-3"
                required
              />
            </div>

            {/* Variables */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">Variables</Label>
              <div className="col-span-3 space-y-2">
                {formData.variables.map((variable, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <span className="flex-1">
                      {variable.name} ({variable.type})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.name)}
                    >
                      Insertar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveVariable(index)}
                      aria-label={`Eliminar variable ${variable.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Agregar nueva variable */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de variable"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1"
                  />
                  <select
                    value={newVariable.type}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as Variable["type"] }))}
                    className="border rounded p-2"
                  >
                    {VARIABLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t === "text"
                          ? "Texto"
                          : t === "number"
                          ? "Número"
                          : "Fecha"}
                      </option>
                    ))}
                  </select>
                  <Button type="button" onClick={handleAddVariable}>
                    + Agregar
                  </Button>
                </div>
              </div>
            </div>

            {/* Editor de contenido */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">Contenido</Label>
              <div className="col-span-3">
                {/* Toolbar */}
                <div className="border border-b-0 rounded-t-md p-2 bg-gray-50 flex gap-1 flex-wrap">
                  <Button
                    type="button"
                    variant={editor.isActive('bold') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive('italic') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive('underline') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>

                  {/* Variables dinámicas */}
                  {formData.variables.map((v) => (
                    <Button
                      key={v.name}
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => insertVariable(v.name)}
                    >
                      {`{{${v.name}}}`}
                    </Button>
                  ))}
                </div>
                
                {/* Editor */}
                <div className="border border-t-0 rounded-b-md">
                  <EditorContent 
                    editor={editor} 
                    className="prose max-w-none p-4 min-h-[200px] focus-within:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Formato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

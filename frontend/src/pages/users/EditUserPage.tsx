import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getCurrentUser, updateUser } from "@/services/user";
import type { User } from "@/services/user";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    claveAnterior: "",
    claveNueva: "",
    repetirClave: "",
  });

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUser();
        setUserId(data.id);
        setForm({
          nombre: data.nombre || "",
          email: data.email || "",
          claveAnterior: "",
          claveNueva: "",
          repetirClave: "",
        });
      } catch (err) {
        toast.error("Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!userId) {
    toast.error("Usuario no identificado");
    return;
  }

  // Validaciones para cambio de contraseña
  if (form.claveNueva || form.claveAnterior || form.repetirClave) {
    // Si se intenta cambiar la contraseña, todos los campos de contraseña son obligatorios
    if (!form.claveAnterior.trim()) {
      toast.error("La contraseña anterior es obligatoria");
      return;
    }
    
    if (!form.claveNueva.trim()) {
      toast.error("La nueva contraseña es obligatoria");
      return;
    }
    
    if (!form.repetirClave.trim()) {
      toast.error("Debe repetir la nueva contraseña");
      return;
    }
    
    // Validaciones adicionales de seguridad para la nueva contraseña
    if (form.claveNueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (form.claveNueva === form.claveAnterior) {
      toast.error("La nueva contraseña debe ser diferente a la anterior");
      return;
    }
  }

  if (form.claveNueva !== form.repetirClave) {
    toast.error("Las claves nuevas no coinciden");
    return;
  }

  // Mostrar confirmación antes de guardar
  toast("¿Estás seguro de actualizar tu perfil?", {
    action: {
      label: "Sí, actualizar",
      onClick: async () => {
        setSaving(true);
        try {
          const updateData: any = {
            nombre: form.nombre,
            email: form.email,
            updatedAt: new Date().toISOString(),
          };

          if (form.claveNueva) {
            updateData.password = form.claveNueva;
            updateData.currentPassword = form.claveAnterior;
          }

          await updateUser(userId, updateData);

          toast.success("Perfil actualizado con éxito ✅");

          setForm((prev) => ({
            ...prev,
            claveAnterior: "",
            claveNueva: "",
            repetirClave: "",
          }));
        } catch (error) {
          console.error(error);
          toast.error("Error al actualizar usuario ❌");
        } finally {
          setSaving(false);
        }
      },
    },
    cancel: {
      label: "Cancelar",
      onClick: () => {},
    },
  });
};


  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Usuarios", href: "/users" },
    { title: "Editar Usuario", isActive: true },
  ];

  if (loading) {
    return (
      <DashboardLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbItems={breadcrumbItems}>
      <div className="w-full">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/users")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-center mb-6">
              Editar Usuario
            </h1>
            <Card>
          <CardHeader>
            <CardTitle>Editar Mi Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="claveAnterior">Clave Anterior</Label>
                  <Input
                    id="claveAnterior"
                    name="claveAnterior"
                    type="password"
                    value={form.claveAnterior}
                    onChange={handleChange}
                    placeholder="Ingrese su clave actual"
                  />
                </div>
                <div>
                  <Label htmlFor="claveNueva">Clave Nueva</Label>
                  <Input
                    id="claveNueva"
                    name="claveNueva"
                    type="password"
                    value={form.claveNueva}
                    onChange={handleChange}
                    placeholder="Ingrese la nueva clave"
                  />
                </div>
                <div>
                  <Label htmlFor="repetirClave">Repetir Clave</Label>
                  <Input
                    id="repetirClave"
                    name="repetirClave"
                    type="password"
                    value={form.repetirClave}
                    onChange={handleChange}
                    placeholder="Repita la nueva clave"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditUserPage;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DynamicForm } from "@/components/formats/DynamicForm";
import DashboardLayout from "@/components/DashboardLayout";

const UseFormatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [format, setFormat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && token) {
      fetch(`/api/formats/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Error al cargar el formato');
          }
          return res.json();
        })
        .then((data) => {
          setFormat(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, token]);

  const handleFormSubmit = async (data: { formatoId: number; datos: Record<string, any> }) => {
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formatId: data.formatoId,
          datos: data.datos
        })
      });

      if (response.ok) {
        // Éxito: navegar al dashboard
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar el formulario');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error de conexión al servidor');
    }
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Formatos", href: "/formats" },
    { title: "Usar Formato", isActive: true },
  ];

  if (loading) {
    return (
      <DashboardLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Cargando formato...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-600">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!format) {
    return (
      <DashboardLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Formato no encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{format.titulo}</h1>
          <p className="text-gray-600 mt-2">Complete el siguiente formulario</p>
        </div>
        <DynamicForm
          format={format}
          onSubmitted={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
};

export default UseFormatPage;
import { Request, Response } from "express";
import { Format } from "../models/formats.model";
import { Completion } from "../models/completion.model";
import { Validacion } from "../models/validacion.model";
import { User } from "../models/user.model";
import { generarPDFValidado, generarPDFValidadoPreview, generarPDFPreview } from "../utils/pdfGenerator";

interface AuthRequest extends Request {
  user?: any;
}

export const descargarPDF = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { completionId } = req.params;

    // Obtener el diligenciamiento con todas las relaciones necesarias
    const diligenciamiento = await Completion.findByPk(completionId, {
      include: [
        {
          model: Format,
          foreignKey: 'formatId'
        },
        {
          model: Validacion,
          foreignKey: 'completionId',
          include: [
            {
              model: User,
              as: 'Validador',
              foreignKey: 'validadorId',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          foreignKey: 'usuarioId',
          attributes: ['id', 'name', 'email']
        }
      ],
    });

    if (!diligenciamiento) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }

    // Validar que el usuario sea el dueño del diligenciamiento o un validador/admin
    const isOwner = diligenciamiento.usuarioId === req.user.id;
    const isValidatorOrAdmin = ['validator', 'admin'].includes(req.user.role);
    
    if (!isOwner && !isValidatorOrAdmin) {
      return res.status(403).json({ error: "No tienes permiso para descargar este PDF" });
    }

    // Validar que el documento esté aprobado
    if (diligenciamiento.estado !== "aprobado") {
      return res.status(403).json({ error: "El documento debe estar aprobado para generar el PDF" });
    }

    // Obtener la validación asociada
    const validacion = (diligenciamiento as any).Validacion;
    if (!validacion) {
      return res.status(404).json({ error: "No se encontró información de validación" });
    }

    // Obtener el validador
    const validador = (validacion as any).User || await User.findByPk(validacion.validadorId);
    if (!validador) {
      return res.status(404).json({ error: "No se encontró información del validador" });
    }

    // Obtener el usuario solicitante
    const usuario = (diligenciamiento as any).User || await User.findByPk(diligenciamiento.usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: "No se encontró información del usuario" });
    }

    // Generar PDF validado con información completa
    await generarPDFValidado(res, {
      formato: (diligenciamiento as any).Format as Format,
      diligenciamiento,
      validacion,
      usuario,
      validador,
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
};

// Endpoint para previsualizar PDF de validación
export const previsualizarPDFValidado = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { completionId } = req.params;

    // Obtener el diligenciamiento con todas las relaciones necesarias
    const diligenciamiento = await Completion.findByPk(completionId, {
      include: [
        {
          model: Format,
          foreignKey: 'formatId'
        },
        {
          model: Validacion,
          foreignKey: 'completionId',
          include: [
            {
              model: User,
              as: 'Validador',
              foreignKey: 'validadorId',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          foreignKey: 'usuarioId',
          attributes: ['id', 'name', 'email']
        }
      ],
    });

    if (!diligenciamiento) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }

    // Validar que el usuario sea el dueño del diligenciamiento o un validador/admin
    const isOwner = diligenciamiento.usuarioId === req.user.id;
    const isValidatorOrAdmin = ['validator', 'admin'].includes(req.user.role);
    
    if (!isOwner && !isValidatorOrAdmin) {
      return res.status(403).json({ error: "No tienes permiso para previsualizar este PDF" });
    }

    // Para previsualización, no requerimos que esté aprobado
    // Obtener la validación asociada (si existe)
    const validacion = (diligenciamiento as any).Validacion;
    
    // Si hay validación, generar PDF validado
    if (validacion && diligenciamiento.estado === "aprobado") {
      const validador = (validacion as any).Validador || await User.findByPk(validacion.validadorId);
      const usuario = (diligenciamiento as any).User || await User.findByPk(diligenciamiento.usuarioId);
      
      if (!validador || !usuario) {
        return res.status(404).json({ error: "No se encontró información completa" });
      }

      const pdfBase64 = await generarPDFValidadoPreview({
        formato: (diligenciamiento as any).Format as Format,
        diligenciamiento,
        validacion,
        usuario,
        validador,
      });

      return res.json({ pdfBase64 });
    } else {
      // Generar PDF simple para previsualización
      const pdfBase64 = await generarPDFPreview({
        formato: (diligenciamiento as any).Format as Format,
        diligenciamiento,
      });

      return res.json({ pdfBase64 });
    }
  } catch (error) {
    console.error('Error al generar vista previa del PDF:', error);
    res.status(500).json({ error: "Error al generar vista previa del PDF" });
  }
};

// Endpoint para previsualizar PDF simple (sin validación)
export const previsualizarPDF = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { completionId } = req.params;

    // Obtener el diligenciamiento con el formato
    const diligenciamiento = await Completion.findByPk(completionId, {
      include: [
        {
          model: Format,
          foreignKey: 'formatId'
        }
      ],
    });

    if (!diligenciamiento) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }

    // Validar que el usuario sea el dueño del diligenciamiento o un validador/admin
    const isOwner = diligenciamiento.usuarioId === req.user.id;
    const isValidatorOrAdmin = ['validator', 'admin'].includes(req.user.role);
    
    if (!isOwner && !isValidatorOrAdmin) {
      return res.status(403).json({ error: "No tienes permiso para previsualizar este PDF" });
    }

    // Generar PDF simple para previsualización
    const pdfBase64 = await generarPDFPreview({
      formato: (diligenciamiento as any).Format as Format,
      diligenciamiento,
    });

    res.json({ pdfBase64 });
  } catch (error) {
    console.error('Error al generar vista previa del PDF:', error);
    res.status(500).json({ error: "Error al generar vista previa del PDF" });
  }
};

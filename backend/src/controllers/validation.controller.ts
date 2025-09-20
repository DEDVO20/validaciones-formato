import { Request, Response } from "express";
import { Validacion } from "../models/validacion.model";
import { User } from "../models/user.model";
import { FormatSubmission } from "../models/formatSubmission.model";
import { Format } from "../models/formats.model";
import { Completion } from "../models/completion.model";
import { AuthRequest } from "../types/auth.types";
import { createNotification } from "../utils/notification.service";

// Crear validación
export const validationCompletion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { completionId, estado, observaciones } = req.body;
    const validadorId = req.user.id;

    const completion = await Completion.findByPk(completionId, {
      include: [{ model: User, attributes: ["id", "name"] }, { model: Format, attributes: ["titulo"] }]
    });
    if (!completion) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }

    const existingValidation = await Validacion.findOne({ where: { completionId } });
    if (existingValidation) {
      return res.status(400).json({ error: "Este diligenciamiento ya fue validado" });
    }

    const validacion = await Validacion.create({
      completionId,
      validadorId,
      estado,
      observaciones,
    });
    completion.estado = estado;
    await completion.save();

    // Notificar al creador del formato
    const estadoTexto = estado === 'aprobado' ? 'aprobado' : 'rechazado';
    await createNotification(
      completion.usuarioId,
      `Tu formato "${completion.Format.titulo}" ha sido ${estadoTexto} por el validador ${req.user.name}`
    );

    // Notificar al validador que completó la validación
    await createNotification(
      validadorId,
      `Has ${estadoTexto} el formato "${completion.Format.titulo}" de ${completion.User.name}`
    );

    res.status(201).json(validacion);
  } catch (error) {
    res.status(500).json({ error: "Error al validar diligenciamiento" });
  }
};

// Listar validaciones realizadas por un validador o todas si es admin
export const listValidations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Obtener el usuario completo para verificar su rol
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let whereClause = {};
    
    // Si no es admin, solo mostrar sus propias validaciones
    if (user.role !== 'admin') {
      whereClause = { validadorId: req.user.id };
    }

    const validaciones = await Validacion.findAll({
      where: whereClause,
      include: [
        { 
          model: Completion, 
          attributes: ["id", "datos", "estado"],
          include: [
            { model: User, attributes: ["id", "name", "email"] },
            { model: Format, attributes: ["id", "titulo"] }
          ]
        },
        {
          model: User,
          as: 'Validador',
          attributes: ["id", "name", "email"]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json(validaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar validaciones" });
  }
};

// Listar todas las validaciones pendientes (para validadores)
export const getPendingValidations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar que el usuario sea validador o admin
    if (req.user.role !== 'validator' && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para ver validaciones" });
    }

    const completions = await Completion.findAll({
      include: [
        {
          model: Validacion,
          required: false // LEFT JOIN para incluir completions sin validación
        },
        { model: User, attributes: ["id", "name", "email"] },
        { model: Format, attributes: ["id", "titulo"] }
      ],
      where: {
        '$Validacion.id$': null // Solo completions sin validación
      }
    });

    res.json(completions);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar validaciones pendientes" });
  }
};

// Listar todas las validaciones completadas (aprobadas o rechazadas)
export const getCompletedValidations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Verificar que el usuario sea validador o admin
    if (req.user.role !== 'validator' && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para ver validaciones" });
    }

    const validaciones = await Validacion.findAll({
      include: [
        {
          model: Completion,
          attributes: ["id", "datos", "estado"],
          include: [
            { model: User, attributes: ["id", "name", "email"] },
            { model: Format, attributes: ["id", "titulo"] }
          ]
        },
        {
          model: User,
          as: 'Validador',
          attributes: ["id", "name", "email"]
        }
      ],
      where: {
        estado: ['aprobado', 'rechazado']
      },
      order: [['updatedAt', 'DESC']]
    });

    res.json(validaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar validaciones completadas" });
  }
};

// Obtener validación por completion ID
export const getValidationByCompletion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { completionId } = req.params;

    const validacion = await Validacion.findOne({
      where: { completionId },
      include: [{ model: Completion, attributes: ["id", "datos"] }],
    });

    if (!validacion) {
      return res.status(404).json({ error: "Validación no encontrada" });
    }

    res.json(validacion);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar validación" });
  }
};

// Actualizar estado de validación
export const updateValidation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { id } = req.params;
    const { estado, comentarios } = req.body;

    const validacion = await Validacion.findByPk(id);
    if (!validacion) {
      return res.status(404).json({ error: "Validación no encontrada" });
    }

    // Actualizar la validación
    await validacion.update({ estado, comentarios });

    // Si la validación es aprobada o rechazada, actualizar el completion
    if (estado === "aprobado" || estado === "rechazado") {
      await Completion.update(
        { estado },
        { where: { id: validacion.completionId } }
      );
    }

    res.json({ message: "Validación actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar validación" });
  }
};

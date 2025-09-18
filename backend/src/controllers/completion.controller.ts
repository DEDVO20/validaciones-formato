import { Request, Response } from "express";
import { Completion } from "../models/completion.model";
import { Format } from "../models/formats.model";
import { User } from "../models/user.model";
import { AuthRequest } from "../types/auth.types";
import { createNotification } from "../utils/notification.service";

export const createCompletion = async (req: AuthRequest, res: Response) => {
  try {
    const { formatId, datos } = req.body;
    const usuarioId = req.user.id;

    const formato = await Format.findByPk(formatId);
    
    if (!formato || formato.estado !== "activo") {
      return res.status(400).json({ error: "Formato no válido o inactivo" });
    }

    const nuevo = await Completion.create({
      formatId,
      usuarioId,
      datos,
    });

    // Notificar a todos los validadores disponibles
    const validadores = await User.findAll({
      where: { role: 'validator' }
    });

    const notificationPromises = validadores.map(validador => 
      createNotification(
        validador.id,
        `Nuevo formato "${formato.titulo}" enviado por ${req.user.name} requiere validación`
      )
    );

    await Promise.all(notificationPromises);

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error en createCompletion:', error);
    res.status(500).json({ error: "Error al guardar diligenciamiento" });
  }
};

export const listCompletions = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user.id;

    const registros = await Completion.findAll({
      where: { usuarioId },
      include: [
        { model: Format, attributes: ["titulo"] },
        { model: User, attributes: ["name", "email"] }
      ],
    });

    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar diligenciamientos" });
  }
};

export const updateCompletion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { datos } = req.body;
    const usuarioId = req.user.id;

    const completion = await Completion.findByPk(id);
    
    if (!completion) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }

    // Verificar que el usuario sea el propietario del diligenciamiento
    if (completion.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "No tienes permiso para editar este diligenciamiento" });
    }

    // Solo permitir edición si está en estado pendiente o rechazado
    if (completion.estado !== 'pendiente' && completion.estado !== 'rechazado') {
      return res.status(400).json({ error: "Solo se pueden editar diligenciamientos pendientes o rechazados" });
    }

    // Actualizar los datos y cambiar estado a pendiente si estaba rechazado
    await completion.update({
      datos,
      estado: 'pendiente'
    });

    // Si el diligenciamiento estaba rechazado y ahora se actualiza, notificar a validadores
    if (completion.estado === 'rechazado') {
      const formato = await Format.findByPk(completion.formatId);
      const validadores = await User.findAll({
        where: { role: 'validator' }
      });

      const notificationPromises = validadores.map(validador => 
        createNotification(
          validador.id,
          `Formato "${formato?.titulo}" actualizado por ${req.user.name} requiere nueva validación`
        )
      );

      await Promise.all(notificationPromises);
    }

    res.json(completion);
  } catch (error) {
    console.error('Error en updateCompletion:', error);
    res.status(500).json({ error: "Error al actualizar diligenciamiento" });
  }
};
 
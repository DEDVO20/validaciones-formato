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
      include: [{ model: Format, attributes: ["titulo"] }],
    });

    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar diligenciamientos" });
  }
};
 
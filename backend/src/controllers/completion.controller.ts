import { Request, Response } from "express";
import { Completion } from "../models/completion.model";
import { Format } from "../models/formats.model";
import { AuthRequest } from "../types/auth.types";

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
 
import { Request, Response } from "express";
import { FormatSubmission } from "../models/formatSubmission.model";

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const { formatoId, datos } = req.body;
    const usuarioId = (req as any).user.id; // Obtener usuarioId del token de autenticación
    
    const submission = await FormatSubmission.create({
      usuarioId,
      formatoId,
      data: datos,
    });
    res.status(201).json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: "Error al crear el diligenciamiento" });
  }
};

export const getSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await FormatSubmission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar diligenciamiento" });
  }
};

export const updateSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { usuarioId, formatoId, data, estado } = req.body;
    const submission = await FormatSubmission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }
    await submission.update({
      usuarioId,
      formatoId,
      data,
      estado,
    });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar diligenciamiento" });
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await FormatSubmission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }
    await submission.destroy();
    res.json({ message: "Diligenciamiento eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar diligenciamiento" });
  }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await FormatSubmission.findAll({
      include: ["user", "format"], // incluye datos del usuario y formato
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener diligenciamientos" });
  }
};

export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user.id;
    const submissions = await FormatSubmission.findAll({
      where: { usuarioId },
      include: ["format"], // incluye datos del formato
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mis diligenciamientos" });
  }
};

export const getPendingSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await FormatSubmission.findAll({
      where: { estado: "pendiente" },
      include: ["user", "format"],
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener diligenciamientos pendientes" });
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // "aprobado" o "rechazado"
    const submission = await FormatSubmission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ error: "Diligenciamiento no encontrado" });
    }
    await submission.update({ estado });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};


import { Request, Response } from "express";
import { FormatSubmission } from "../models/formatSubmission.model";
import { Format } from "../models/formats.model";
import { User } from "../models/user.model";

// Crear un nuevo submission
export const createSubmission = async (req: Request, res: Response) => {
  try {
    const { formatId, data } = req.body;
    const userId = (req as any).user.id;

    const submission = await FormatSubmission.create({
      formatId,
      userId,
      data,
      status: 'pendiente'
    });

    res.status(201).json({
      message: "Submission creado exitosamente",
      submission
    });
  } catch (error) {
    console.error("Error al crear submission:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un submission por ID
export const getSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const submission = await FormatSubmission.findByPk(id, {
      include: [
        {
          model: Format,
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission no encontrado" });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error al obtener submission:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar un submission
export const updateSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = (req as any).user.id;

    const submission = await FormatSubmission.findByPk(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission no encontrado" });
    }

    // Verificar que el usuario sea el propietario del submission
    if (submission.userId !== userId) {
      return res.status(403).json({ message: "No tienes permisos para actualizar este submission" });
    }

    await submission.update({ data });

    res.json({
      message: "Submission actualizado exitosamente",
      submission
    });
  } catch (error) {
    console.error("Error al actualizar submission:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los submissions
export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await FormatSubmission.findAll({
      include: [
        {
          model: Format,
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error al obtener submissions:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener submissions del usuario actual
export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const submissions = await FormatSubmission.findAll({
      where: { userId },
      include: [
        {
          model: Format,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error al obtener submissions del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener submissions pendientes
export const getPendingSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await FormatSubmission.findAll({
      where: { status: 'pendiente' },
      include: [
        {
          model: Format,
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error al obtener submissions pendientes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar el estado de un submission
export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pendiente', 'aprobado', 'rechazado'].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const submission = await FormatSubmission.findByPk(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission no encontrado" });
    }

    await submission.update({ status });

    res.json({
      message: "Estado del submission actualizado exitosamente",
      submission
    });
  } catch (error) {
    console.error("Error al actualizar estado del submission:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
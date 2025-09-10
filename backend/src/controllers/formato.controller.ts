import { Request, Response } from "express";
import { Format } from "../models/formats.model";

export const createFormat = async (req: Request, res: Response) => {
  try {
    const { titulo, estado, contenido, variables } = req.body;
    const format = await Format.create({
      titulo,
      estado,
      contenido,
      variables: variables || [],
    });
    res.status(201).json(format);
  } catch (error) {
    console.error('Error creating format:', error);
    res.status(500).json({ message: "Error al crear formato", error });
  }
};

export const getFormat = async (req: Request, res: Response) => {
  try {
    const {titulo, estado} = req.query;

    const filters: any = {};
    if (titulo) {
      filters.titulo = titulo;
    }
    if (estado) {
      filters.estado = estado;
    }

    const formats = await Format.findAll({
      where: filters,
    });
    
    // Parsear las variables de string JSON a objetos
    const formatsWithParsedVariables = formats.map(format => {
      const formatData = format.toJSON();
      try {
        formatData.variables = typeof formatData.variables === 'string' 
          ? JSON.parse(formatData.variables) 
          : formatData.variables || [];
      } catch (error) {
        console.error('Error parsing variables for format', formatData.id, error);
        formatData.variables = [];
      }
      return formatData;
    });
    
    res.json(formatsWithParsedVariables);
  } catch (error) {
    res.status(500).json({ error: "Error al listar formatos" });
  }
};

// Obtener formato por ID
export const getFormatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const format = await Format.findByPk(id);
    if (!format) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    // Parsear las variables de string JSON a objetos
    const formatData = format.toJSON();
    try {
      formatData.variables = typeof formatData.variables === 'string' 
        ? JSON.parse(formatData.variables) 
        : formatData.variables || [];
    } catch (error) {
      console.error('Error parsing variables for format', formatData.id, error);
      formatData.variables = [];
    }

    res.json(formatData);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener formato" });
  }
};

export const updateFormat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, estado, contenido, variables } = req.body;

    const format = await Format.findByPk(id);
    if (!format) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    await format.update({
      titulo,
      estado,
      contenido,
      variables: variables || [],
    });

    res.json(format);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar formato", error });
  }
};

export const deleteFormat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = await Format.findByPk(id);
    if (!format) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }
    await format.destroy();
    res.json({ message: "Formato eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al ", error });
  }
};

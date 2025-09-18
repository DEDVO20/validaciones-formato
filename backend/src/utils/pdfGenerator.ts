import htmlPdf from 'html-pdf-node';
import { Response } from "express";
import { Format } from "../models/formats.model";
import { Completion } from "../models/completion.model";
import { Validacion } from "../models/validacion.model";
import { User } from "../models/user.model";

interface PdfData {
  formato: Format;
  diligenciamiento: Completion;
}

interface ValidatedPdfData {
  formato: Format;
  diligenciamiento: Completion;
  validacion: Validacion;
  usuario: User;
  validador: User;
}

function replaceVariables(template: string, datos: Record<string, any>) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = datos[key.trim()];
    return value !== undefined ? String(value) : "";
  });
}

// Función para generar PDF y enviarlo como descarga
export const generarPDF = async (res: Response, data: PdfData) => {
  const { formato, diligenciamiento } = data;

  // 📌 Parsear datos del diligenciamiento
  const datos = typeof diligenciamiento.datos === "string"
    ? JSON.parse(diligenciamiento.datos)
    : diligenciamiento.datos || {};

  // 📌 Reemplazar variables
  const contenido = replaceVariables(formato.contenido, datos);

  // 📌 Crear HTML para el PDF (solo información del formato)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          line-height: 1.6;
          margin: 40px;
          color: #000;
        }
        h1, h2, h3 {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 30px;
        }
        .content {
          text-align: justify;
          margin-bottom: 30px;
        }
        p {
          margin-bottom: 12px;
        }
        strong {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="title">${formato.titulo}</div>
      <div class="content">${contenido}</div>
    </body>
    </html>
  `;

  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  };

  try {
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=formato_${diligenciamiento.id}.pdf`
    );
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error al generar PDF' });
  }
};

// Función para generar PDF en base64 para previsualización
export const generarPDFPreview = async (data: PdfData): Promise<string> => {
  const { formato, diligenciamiento } = data;

  // 📌 Parsear datos del diligenciamiento
  const datos = typeof diligenciamiento.datos === "string"
    ? JSON.parse(diligenciamiento.datos)
    : diligenciamiento.datos || {};

  // 📌 Reemplazar variables
  const contenido = replaceVariables(formato.contenido, datos);

  // 📌 Crear HTML para el PDF (solo información del formato)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          line-height: 1.6;
          margin: 40px;
          color: #000;
        }
        h1, h2, h3 {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 30px;
        }
        .content {
          text-align: justify;
          margin-bottom: 30px;
        }
        p {
          margin-bottom: 12px;
        }
        strong {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="title">${formato.titulo}</div>
      <div class="content">${contenido}</div>
    </body>
    </html>
  `;

  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  };

  try {
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    return pdfBuffer.toString('base64');
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw new Error('Error al generar vista previa del PDF');
  }
};

// Función para generar PDF validado y enviarlo como descarga
export const generarPDFValidado = async (res: Response, data: ValidatedPdfData) => {
  const { formato, diligenciamiento, validacion, usuario, validador } = data;

  // 📌 Parsear datos del diligenciamiento
  const datos = typeof diligenciamiento.datos === "string"
    ? JSON.parse(diligenciamiento.datos)
    : diligenciamiento.datos || {};

  // 📌 Reemplazar variables en el contenido
  const contenido = replaceVariables(formato.contenido, datos);

  // 📌 Crear HTML para el PDF validado (solo información del formato)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          line-height: 1.6;
          margin: 40px;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .format-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .content {
          text-align: justify;
          margin: 30px 0;
        }
        p {
          margin-bottom: 12px;
        }
        strong {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
      </div>
      
      <div class="format-title">${formato.titulo}</div>
      
      <div class="content">${contenido}</div>
      
    </body>
    </html>
  `;

  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  };

  try {
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=documento_validado_${diligenciamiento.id}.pdf`
    );
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating validated PDF:', error);
    res.status(500).json({ error: 'Error al generar PDF validado' });
  }
};

// Función para generar PDF validado en base64 para previsualización
export const generarPDFValidadoPreview = async (data: ValidatedPdfData): Promise<string> => {
  try {
    const { formato, diligenciamiento, validacion, usuario, validador } = data;

    // Validar que todos los datos necesarios estén presentes
    if (!formato || !diligenciamiento || !validacion || !usuario || !validador) {
      console.error('Datos faltantes para generar PDF validado:', {
        formato: !!formato,
        diligenciamiento: !!diligenciamiento,
        validacion: !!validacion,
        usuario: !!usuario,
        validador: !!validador
      });
      throw new Error('Datos incompletos para generar PDF validado');
    }

    // 📌 Parsear datos del diligenciamiento
    const datos = typeof diligenciamiento.datos === "string"
      ? JSON.parse(diligenciamiento.datos)
      : diligenciamiento.datos || {};

    // 📌 Reemplazar variables en el contenido
    const contenido = replaceVariables(formato.contenido, datos);

  // 📌 Crear HTML para el PDF validado (solo información del formato)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          line-height: 1.6;
          margin: 40px;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .format-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .content {
          text-align: justify;
          margin: 30px 0;
        }
        p {
          margin-bottom: 12px;
        }
        strong {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
      </div>
      
      <div class="format-title">${formato.titulo}</div>
      
      <div class="content">${contenido}</div>
      
    </body>
    </html>
  `;

  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  };

  try {
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    return pdfBuffer.toString('base64');
  } catch (error) {
    console.error('Error generating validated PDF preview:', error);
    throw new Error('Error al generar vista previa del PDF validado');
  }
} catch (error) {
  console.error('Error en generarPDFValidadoPreview:', error);
  throw error;
}
};

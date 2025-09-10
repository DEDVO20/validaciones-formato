import * as htmlPdf from 'html-pdf-node';
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

  // 📌 Crear HTML para el PDF
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
        .footer {
          font-size: 10px;
          margin-top: 40px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
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
      <div class="footer">
        <p>Generado por: Usuario ${diligenciamiento.usuarioId}</p>
        <p>Fecha: ${new Date(diligenciamiento.createdAt).toLocaleString()}</p>
      </div>
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

  // 📌 Crear HTML para el PDF
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
        .footer {
          font-size: 10px;
          margin-top: 40px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
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
      <div class="footer">
        <p>Generado por: Usuario ${diligenciamiento.usuarioId}</p>
        <p>Fecha: ${new Date(diligenciamiento.createdAt).toLocaleString()}</p>
      </div>
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

  // 📌 Crear HTML para el PDF validado
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
        .validated-title {
          font-size: 20px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .separator {
          border-bottom: 1px solid #e5e7eb;
          margin: 20px 0;
        }
        .format-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .validation-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .approved {
          color: #059669;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .validation-info {
          color: #374151;
          font-size: 11px;
          line-height: 1.4;
        }
        .content {
          text-align: justify;
          margin: 30px 0;
        }
        .observations {
          margin-top: 40px;
        }
        .observations-title {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          text-decoration: underline;
          margin-bottom: 10px;
        }
        .observations-text {
          font-size: 11px;
          color: #374151;
          text-align: justify;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 9px;
          color: #6b7280;
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
        <div class="validated-title">DOCUMENTO VALIDADO</div>
        <div class="separator"></div>
      </div>
      
      <div class="format-title">${formato.titulo}</div>
      
      <div class="validation-box">
        <div class="approved">✓ DOCUMENTO APROBADO</div>
        <div class="validation-info">
          <div>Validado por: ${validador.name}</div>
          <div>Fecha de validación: ${new Date(validacion.updatedAt).toLocaleString('es-ES')}</div>
          <div>Usuario solicitante: ${usuario.name}</div>
        </div>
      </div>
      
      <div class="content">${contenido}</div>
      
      ${validacion.observaciones ? `
        <div class="observations">
          <div class="observations-title">Observaciones del Validador:</div>
          <div class="observations-text">${validacion.observaciones}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        <div>Documento generado el: ${new Date().toLocaleString('es-ES')}</div>
        <div>ID de diligenciamiento: ${diligenciamiento.id}</div>
        <div>Estado: ${diligenciamiento.estado.toUpperCase()}</div>
      </div>
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
  const { formato, diligenciamiento, validacion, usuario, validador } = data;

  // 📌 Parsear datos del diligenciamiento
  const datos = typeof diligenciamiento.datos === "string"
    ? JSON.parse(diligenciamiento.datos)
    : diligenciamiento.datos || {};

  // 📌 Reemplazar variables en el contenido
  const contenido = replaceVariables(formato.contenido, datos);

  // 📌 Crear HTML para el PDF validado
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
        .validated-title {
          font-size: 20px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .separator {
          border-bottom: 1px solid #e5e7eb;
          margin: 20px 0;
        }
        .format-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .validation-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .approved {
          color: #059669;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .validation-info {
          color: #374151;
          font-size: 11px;
          line-height: 1.4;
        }
        .content {
          text-align: justify;
          margin: 30px 0;
        }
        .observations {
          margin-top: 40px;
        }
        .observations-title {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          text-decoration: underline;
          margin-bottom: 10px;
        }
        .observations-text {
          font-size: 11px;
          color: #374151;
          text-align: justify;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 9px;
          color: #6b7280;
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
        <div class="validated-title">DOCUMENTO VALIDADO</div>
        <div class="separator"></div>
      </div>
      
      <div class="format-title">${formato.titulo}</div>
      
      <div class="validation-box">
        <div class="approved">✓ DOCUMENTO APROBADO</div>
        <div class="validation-info">
          <div>Validado por: ${validador.name}</div>
          <div>Fecha de validación: ${new Date(validacion.updatedAt).toLocaleString('es-ES')}</div>
          <div>Usuario solicitante: ${usuario.name}</div>
        </div>
      </div>
      
      <div class="content">${contenido}</div>
      
      ${validacion.observaciones ? `
        <div class="observations">
          <div class="observations-title">Observaciones del Validador:</div>
          <div class="observations-text">${validacion.observaciones}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        <div>Documento generado el: ${new Date().toLocaleString('es-ES')}</div>
        <div>ID de diligenciamiento: ${diligenciamiento.id}</div>
        <div>Estado: ${diligenciamiento.estado.toUpperCase()}</div>
      </div>
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
};

declare module 'html-pdf-node' {
  interface Options {
    format?: string;
    width?: string;
    height?: string;
    orientation?: 'portrait' | 'landscape';
    border?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    header?: {
      height?: string;
      contents?: string;
    };
    footer?: {
      height?: string;
      contents?: string;
    };
    type?: string;
    quality?: string;
    phantomPath?: string;
    phantomArgs?: string[];
    script?: string;
    timeout?: number;
  }

  interface File {
    url?: string;
    content?: string;
  }

  function generatePdf(file: File, options?: Options): Promise<Buffer>;

  const htmlPdfNode: {
    generatePdf: typeof generatePdf;
  };

  export default htmlPdfNode;
}
export async function readPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 80) throw new Error('Please split PDFs longer than 80 pages into smaller booking documents.');
    const pages: string[] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      let text = '', previousY: number | undefined;
      for (const item of content.items) {
        if (!('str' in item)) continue;
        const y = item.transform[5];
        if (previousY !== undefined && Math.abs(y - previousY) > 3 && !text.endsWith('\n')) text += '\n';
        text += item.str + (item.hasEOL ? '\n' : ' '); previousY = y;
      }
      pages.push(text.trim());
    }
    const text = pages.join('\n\n');
    if (!text.trim()) throw new Error('This PDF has no readable text layer (it may be scanned). No details were guessed. Use manual entry from the preview or a searchable PDF.');
    return text;
  } finally { await task.destroy(); }
}

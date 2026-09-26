'use client';
import { useEffect, useRef, useState } from 'react';
export function PdfPreview({ file }: { file: File }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1), [pages, setPages] = useState(1);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    let destroy: (() => Promise<void>) | undefined;
    setLoading(true); setError('');
    (async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      if (cancelled) return;
      const task = pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
      destroy = () => task.destroy();
      if (cancelled) { await task.destroy(); return; }
      const pdf = await task.promise;
      if (cancelled) return;
      setPages(pdf.numPages);
      const pdfPage = await pdf.getPage(Math.min(page,pdf.numPages));
      const target = canvas.current;
      if (cancelled || !target) return;
      const original = pdfPage.getViewport({scale:1});
      const viewport = pdfPage.getViewport({scale:Math.min(2,1000/original.width)});
      target.width = viewport.width; target.height = viewport.height;
      await pdfPage.render({canvas:target,viewport}).promise;
      if (!cancelled) setLoading(false);
    })().catch(e => { if (!cancelled) {setError(e instanceof Error?e.message:'Preview unavailable. Open the original PDF below.');setLoading(false);} });
    return () => { cancelled = true; void destroy?.(); };
  },[file,page]);
  return <div className="pdf-renderer">
    <div className="pdf-page-controls"><button disabled={page <= 1} onClick={() => setPage(page-1)}>Previous page</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page+1)}>Next page</button></div>
    {loading && <p role="status">Rendering original PDF…</p>}{error && <p role="alert">{error}</p>}
    <div className="pdf-canvas-scroll"><canvas ref={canvas} role="img" aria-label={`Original PDF page ${page}: ${file.name}`} /></div>
  </div>;
}

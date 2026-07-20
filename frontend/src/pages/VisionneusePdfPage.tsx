import { FileText, Download, Printer, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Share2, Expand } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function VisionneusePdfPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const documentInfo = location.state?.document || {};
  const pdfUrl = documentInfo.file_url || 'http://localhost:8001/api/documents/1/download/';


  return (
    <div className="fixed inset-0 z-50 bg-gray-900 font-poppins flex flex-col text-white">
      {/* Top Bar */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 text-red-400 rounded flex items-center justify-center font-bold text-[10px]">PDF</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">{documentInfo.title || 'Document PDF'}</h2>
              <p className="text-[10px] text-gray-400">{documentInfo.created_at ? `Ajouté le ${new Date(documentInfo.created_at).toLocaleDateString('fr-FR')}` : ''}{documentInfo.created_by_name ? ` par ${documentInfo.created_by_name}` : ''}{documentInfo.file_size ? ` • ${documentInfo.file_size}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-2 border border-gray-700">
           <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-2 hover:text-orange-400 text-gray-400"><ZoomOut size={16}/></button>
           <span className="text-xs font-medium w-12 text-center text-gray-300">{Math.round(scale * 100)}%</span>
           <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-2 hover:text-orange-400 text-gray-400"><ZoomIn size={16}/></button>
           <div className="w-px h-4 bg-gray-700 mx-2"></div>
           <button onClick={() => setScale(1.0)} className="p-2 hover:text-orange-400 text-gray-400"><Expand size={16}/></button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"><Share2 size={14}/> Partager</button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"><Printer size={14}/> Imprimer</button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"><Download size={14}/> Télécharger</button>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 overflow-auto relative flex justify-center py-6">
        <div className="w-full h-full flex justify-center">
          <Document
            file={({
              url: pdfUrl,
              httpHeaders: {
                Authorization: `Bearer ${localStorage.getItem('access')}`,
              },
            } as any)}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-white">Chargement du document...</div>}
            error={<div className="text-red-500 bg-white dark:bg-[var(--dash-card-bg)] p-4 rounded">Erreur lors de la création de l'aperçu PDF. Le fichier n'existe peut-être pas ou son format n'est pas supporté.</div>}
          >
            <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} />
          </Document>
        </div>

        {/* Floating Page Nav */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full shadow-lg z-50">
           <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="text-gray-400 hover:text-white"><ArrowLeft size={16}/></button>
           <span className="text-xs font-semibold">{pageNumber} / {numPages || '-'}</span>
           <button onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} className="text-gray-400 hover:text-white"><ArrowRight size={16}/></button>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { CatalogItem } from '../types';
import { exportCatalogToJson } from '../utils/storage';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  FileJson, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface ImportExportModalProps {
  items: CatalogItem[];
  onClose: () => void;
  onImportItems: (newItems: CatalogItem[]) => void;
  onResetToDefault: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  items,
  onClose,
  onImportItems,
  onResetToDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExport = () => {
    exportCatalogToJson(items);
    setFeedback({
      type: 'success',
      message: `Záloha ${items.length} položiek bola úspešne vygenerovaná a stiahnutá.`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].category) {
          onImportItems(parsed);
          setFeedback({
            type: 'success',
            message: `Úspešne importovaných ${parsed.length} položiek do katalógu.`,
          });
        } else {
          throw new Error('Neplatná štruktúra JSON súboru katalógu.');
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: `Chyba pri importe: ${err.message || 'Súbor nie je platný JSON.'}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Naozaj chcete obnoviť katalóg na predvolené ukážkové dáta? Všetky vlastné zmeny budú nahradené.')) {
      onResetToDefault();
      setFeedback({
        type: 'success',
        message: 'Katalóg bol obnovený na predvolené vzorové dáta.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Zálohovanie a správa dát
              </h2>
              <p className="text-xs text-slate-400">
                Exportujte, importujte alebo obnovte svoj katalóg.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-700/50 text-emerald-200'
                : 'bg-rose-950/70 border-rose-700/50 text-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Export card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">Stiahnuť zálohu katalógu</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Uloží všetky filmy, seriály, hudbu, knihy, hry a poznámky do JSON súboru.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Stiahnuť JSON</span>
            </button>
          </div>

          {/* Import card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">Importovať zo zálohy</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Nahrajte predtým stiahnutý .json súbor s vašou zbierkou.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Vybrať súbor</span>
            </button>
          </div>

          {/* Reset card */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-300">Predvolené ukážkové dáta</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Obnoviť katalóg na predvolených 10 vzorových záznamov v slovenčine.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-700/50 text-xs font-semibold transition-all shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Obnoviť</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Hotovo
          </button>
        </div>

      </div>
    </div>
  );
};

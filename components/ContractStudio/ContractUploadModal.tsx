import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Sparkles, CheckCircle2, ArrowRight, AlertCircle, FileCode, BookOpen, Layers, Check } from 'lucide-react';
import { SAMPLE_CONTRACTS } from '../../constants';
import { parseUploadedContractFile, extractFieldsAndSignatures, ParseResult } from '../../services/documentParser';

interface ContractUploadModalProps {
  onLoadParsedContract: (result: ParseResult) => void;
  onClose: () => void;
}

const ContractUploadModal: React.FC<ContractUploadModalProps> = ({ onLoadParsedContract, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setParsedPreview(null);

    try {
      const validExtensions = ['docx', 'pdf', 'txt', 'md', 'rtf'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(fileExt)) {
        throw new Error(`Unsupported file type (.${fileExt}). Please upload a Word (.docx), PDF (.pdf), or Text (.txt) template file.`);
      }

      const result = await parseUploadedContractFile(file);
      setParsedPreview(result);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(err.message || 'Failed to read contract file. Please try a different document or format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview) {
      onLoadParsedContract(parsedPreview);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_CONTRACTS.find(s => s.id === sampleId);
    if (!sample) return;

    const detected = extractFieldsAndSignatures(sample.content, sample.title);
    const result: ParseResult = {
      title: sample.title,
      rawText: detected.transformedText || sample.content,
      detectedFields: detected.fields,
      detectedSignatures: detected.signatures,
      fileType: 'custom',
      scannedVariableCount: detected.fields.length
    };
    onLoadParsedContract(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Upload Template File</h3>
              <p className="text-xs text-slate-400">Scan MS-Word (.docx), PDF, or Text to auto-generate variables on the left pane</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error reading file</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Parsed Scanning Success Preview Step */}
          {parsedPreview ? (
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950">
                      Scan Complete: Found {parsedPreview.detectedFields.length} Dynamic Variables
                    </h4>
                    <p className="text-xs text-emerald-800/80">
                      "{parsedPreview.title}" ready to load into the studio left pane.
                    </p>
                  </div>
                </div>
              </div>

              {/* Scanned Variables Chips */}
              <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Auto-Detected Fillable Fields:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {parsedPreview.detectedFields.map((field) => (
                    <span
                      key={field.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {field.label}
                      <span className="text-[10px] text-slate-500 font-mono font-normal">
                        ({field.category || 'General'})
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setParsedPreview(null)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Choose a different file
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow"
                >
                  <span>Auto-Generate Fields on Left Pane</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Drag & Drop Area */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.txt,.md,.rtf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {isProcessing ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-800">Scanning template file for variables...</p>
                  <p className="text-xs text-slate-500">Detecting brackets, underlines, party names, dates, and blanks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Upload size={28} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      Click to browse or drag & drop template file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports Microsoft Word (<span className="font-semibold text-slate-700">.docx</span>), PDF (<span className="font-semibold text-slate-700">.pdf</span>), and Plain Text (<span className="font-semibold text-slate-700">.txt</span>)
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600 shadow-2xs">
                    <Sparkles size={13} className="text-indigo-600" />
                    Auto-scans variables & populates left pane form automatically
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preset Sample Contracts Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                Or start with a pre-formatted template
              </span>
            </div>
          </div>

          {/* Sample Contracts Grid */}
          <div className="space-y-3">
            {SAMPLE_CONTRACTS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0 mt-0.5">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {sample.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {sample.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded-lg flex items-center gap-1 transition-all shrink-0 ml-3"
                >
                  Use <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>All documents are processed locally in your browser for privacy.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ContractUploadModal;

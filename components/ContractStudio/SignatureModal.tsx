import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, Type, Image as ImageIcon } from 'lucide-react';
import { ContractSignature } from '../../types';

interface SignatureModalProps {
  signature: ContractSignature;
  onSave: (sig: ContractSignature) => void;
  onClose: () => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ signature, onSave, onClose }) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState(signature.name || '');
  const [selectedFont, setSelectedFont] = useState<'font-vibes' | 'font-serif' | 'font-sans'>('font-vibes');
  const [penColor, setPenColor] = useState('#0f172a'); // slate-900 / dark ink
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set display resolution for crisp rendering on retina
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;

    // If signature already exists and is draw
    if (signature.signatureData && signature.type === 'draw') {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = signature.signatureData;
    }
  }, [tab, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (tab === 'draw') {
      const canvas = canvasRef.current;
      const signatureData = canvas ? canvas.toDataURL('image/png') : undefined;
      onSave({
        ...signature,
        type: 'draw',
        signatureData: hasDrawn ? signatureData : undefined,
        signedDate: today
      });
    } else if (tab === 'type') {
      onSave({
        ...signature,
        name: typedName,
        type: 'type',
        signedDate: today
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{signature.label}</h3>
            <p className="text-xs text-slate-400">Digital signature authentication</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <button
            onClick={() => setTab('draw')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'draw' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool size={14} /> Draw Signature
          </button>
          <button
            onClick={() => setTab('type')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'type' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type size={14} /> Type & Cursive
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'draw' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Draw with your finger or mouse</label>
                
                {/* Pen color picker */}
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#0f172a', name: 'Dark Ink' },
                    { color: '#1e3a8a', name: 'Navy Blue' },
                    { color: '#831843', name: 'Burgundy' },
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => setPenColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        penColor === c.color ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-white'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-[#fafafa] overflow-hidden h-48 touch-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                    <PenTool size={24} className="mb-1 opacity-50" />
                    <span className="text-xs">Sign above the baseline</span>
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 border-b border-slate-300 pointer-events-none" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  onClick={handleClear}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-slate-100"
                >
                  <RotateCcw size={13} /> Clear Canvas
                </button>
                <span className="text-slate-400">Signatures are stamped cleanly into PDF</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter full name..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center min-h-[100px] flex items-center justify-center">
                <p
                  className="text-3xl text-slate-900"
                  style={{ fontFamily: "'Great Vibes', cursive, serif" }}
                >
                  {typedName || 'Your Signature Preview'}
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                By clicking "Apply Signature", this electronic cursive signature will be bound to the contract.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Check size={16} /> Apply Signature
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignatureModal;

import React from 'react';
import { X, Info, CheckCircle2, AlertTriangle, PenTool, Printer, Sparkles, FileText, Upload } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">About Covenant Studio</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-600">
          
          {/* What is it */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">What is this app?</h3>
            <p className="leading-relaxed text-sm">
              <strong>Covenant Studio</strong> is a comprehensive creation suite for officiants, pastors, counselors, and couples. 
              You can generate keepsake certificates and create/fill complete marital covenant contracts from uploaded sample files (Word, PDF, Text).
            </p>
          </section>

          {/* How to use */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Features & How to Use</h3>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-indigo-600"><Upload size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">1. Upload Sample Contract Files (.docx, .pdf, .txt)</h4>
                  <p className="text-xs">Upload your ministry's premarital covenant, wedding agreement, or counseling accord. The app scans and extracts placeholders like <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">[Bride Name]</code>, dates, and blanks.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-indigo-600"><FileText size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">2. Fill Out Necessary Fields & Add Clauses</h4>
                  <p className="text-xs">Fill names, dates, counseling hours, and fees. Insert standard covenant clauses from our clause library (fidelity, communication, financial transparency).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-indigo-600"><PenTool size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">3. Digital Signature Authentication</h4>
                  <p className="text-xs">Parties can sign directly via drawing canvas or cursive certification, stamped on the contract before printing.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-indigo-600"><Printer size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">4. Print & Export PDF</h4>
                  <p className="text-xs">Choose elegant paper themes (Parchment, Navy Covenant, Modern Minimal), official gold seals, and print clean multi-page PDFs.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-amber-800 mb-1 text-sm">Important Information</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  These documents and certificates are for <strong>covenantal, pastoral, and commemorative purposes</strong>. 
                  Civil legal marriage licenses must always be obtained from and filed with your municipal or county registrar.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors text-sm"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;

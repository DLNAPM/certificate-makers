import React from 'react';
import { X, Info, CheckCircle2, AlertTriangle, PenTool, Printer, Sparkles } from 'lucide-react';

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
            <h2 className="text-xl font-bold text-slate-900">About Covenant Certificates</h2>
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
            <p className="leading-relaxed">
              **Certificate Maker** is a design tool created for officiants, counselors, and couples. 
              It allows you to create elegant, commemorative certificates to acknowledge the completion of 
              premarital counseling or to celebrate the wedding covenant.
            </p>
          </section>

          {/* How to use */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">How to use</h3>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-slate-700"><PenTool size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">1. Customize Details</h4>
                  <p className="text-sm">Enter the names, date, and choose a scripture or slogan.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-slate-700"><Sparkles size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">2. Design & Layout</h4>
                  <p className="text-sm">Drag signatures to move them. Use the sidebar to pick a background or use AI to generate a unique texture.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-100 p-2 h-fit rounded-lg text-slate-700"><Printer size={20} /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">3. Save & Print</h4>
                  <p className="text-sm">Print directly to PDF (Landscape mode) or sign in with Google to save your template for later.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-amber-800 mb-1">Important Disclaimer</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  This document is for <strong>ceremonial and commemorative purposes only</strong>. 
                  It is <span className="underline font-semibold">NOT a legal marriage license</span> and 
                  cannot be used to legally validate a marriage in any jurisdiction. 
                  Please contact your local county clerk or government office for legal marriage documentation.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;
import React from 'react';
import { ContractField, ContractSignature, ContractTheme } from '../../types';
import { renderContractText } from '../../services/documentParser';
import { CONTRACT_THEMES } from '../../constants';
import { Award, ShieldCheck, PenTool, CheckCircle, Sparkles } from 'lucide-react';

interface ContractPreviewProps {
  title: string;
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  includeSignatures?: boolean;
  themeId: string;
  sealType: 'covenant_gold' | 'counseling_ribbon' | 'classic_crest' | 'none';
  highlightPlaceholders: boolean;
  onOpenSignatureModal: (signature: ContractSignature) => void;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({
  title,
  rawContent,
  fields,
  signatures,
  includeSignatures = true,
  themeId,
  sealType,
  highlightPlaceholders,
  onOpenSignatureModal,
}) => {
  const theme = CONTRACT_THEMES.find(t => t.id === themeId) || CONTRACT_THEMES[0];

  // Process text with filled fields
  const processedText = renderContractText(rawContent, fields, highlightPlaceholders);

  // Split into paragraphs for proper typographic structure
  const paragraphs = processedText.split('\n\n').filter(p => p.trim());

  return (
    <div className="w-full flex justify-center py-6 px-2 sm:px-6">
      {/* Printable Sheet (Letter Aspect Ratio / ~816x1056 or min-h portrait) */}
      <div
        id="contract-print-sheet"
        className={`relative w-full max-w-[850px] min-h-[1100px] shadow-2xl p-8 sm:p-14 print:p-8 print:shadow-none print:w-full print:max-w-none print:min-h-0 transition-all ${theme.bgClass}`}
        style={{
          backgroundColor: theme.paperColor,
          fontFamily: theme.bodyFont === 'font-serif' ? "'Plus Jakarta Sans', Georgia, serif" : 'inherit'
        }}
      >
        {/* Outer & Inner Decorative Borders */}
        {theme.pageBorder === 'double' && (
          <>
            <div
              className="absolute inset-3 sm:inset-4 border-2 pointer-events-none print:inset-2"
              style={{ borderColor: theme.accentColor }}
            />
            <div
              className="absolute inset-5 sm:inset-6 border pointer-events-none opacity-60 print:inset-3"
              style={{ borderColor: theme.accentColor }}
            />
          </>
        )}

        {theme.pageBorder === 'ornate' && (
          <>
            <div
              className="absolute inset-4 border-4 rounded-xl pointer-events-none print:inset-2"
              style={{ borderColor: theme.accentColor }}
            />
            <div
              className="absolute inset-6 border border-dashed rounded-lg pointer-events-none opacity-40 print:inset-3"
              style={{ borderColor: theme.accentColor }}
            />
          </>
        )}

        {theme.pageBorder === 'single' && (
          <div
            className="absolute inset-4 border pointer-events-none print:inset-2"
            style={{ borderColor: theme.accentColor }}
          />
        )}

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between min-h-[1000px] print:min-h-0">
          
          {/* Header & Seal */}
          <div>
            <div className="flex items-start justify-between border-b pb-6 mb-8 gap-4" style={{ borderColor: `${theme.accentColor}33` }}>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <span
                    className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded"
                    style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}
                  >
                    Solemn Agreement & Covenant
                  </span>
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                  style={{
                    fontFamily: theme.headerFont.includes('serif') ? "'Cinzel', Georgia, serif" : 'inherit',
                    color: theme.accentColor
                  }}
                >
                  {title || 'Covenant Contract & Agreement'}
                </h1>
              </div>

              {/* Official Seal / Medallion */}
              {sealType !== 'none' && (
                <div className="hidden sm:flex flex-col items-center justify-center shrink-0">
                  {sealType === 'covenant_gold' && (
                    <div className="w-20 h-20 rounded-full border-2 border-yellow-600 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 flex flex-col items-center justify-center shadow-md text-amber-900 text-center p-1 relative group">
                      <div className="w-16 h-16 rounded-full border border-dashed border-amber-600 flex flex-col items-center justify-center">
                        <Award size={20} className="text-amber-700 mb-0.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Covenant</span>
                        <span className="text-[6px] font-bold uppercase tracking-widest text-amber-700">Official Seal</span>
                      </div>
                    </div>
                  )}

                  {sealType === 'counseling_ribbon' && (
                    <div className="w-20 h-20 rounded-full border-2 border-indigo-700 bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center shadow-md text-indigo-900 text-center p-1">
                      <div className="w-16 h-16 rounded-full border border-dashed border-indigo-500 flex flex-col items-center justify-center">
                        <ShieldCheck size={20} className="text-indigo-700 mb-0.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Ministry</span>
                        <span className="text-[6px] font-bold uppercase tracking-widest text-indigo-700">Verified</span>
                      </div>
                    </div>
                  )}

                  {sealType === 'classic_crest' && (
                    <div className="w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-100 flex flex-col items-center justify-center shadow-md text-slate-800 text-center p-1">
                      <div className="w-16 h-16 rounded-full border border-dashed border-slate-400 flex flex-col items-center justify-center">
                        <Sparkles size={18} className="text-slate-700 mb-0.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Sacred Accord</span>
                        <span className="text-[6px] font-bold uppercase tracking-widest text-slate-600">Legal Standard</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Body Text */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-justify break-words">
              {paragraphs.map((paragraph, index) => {
                // If it's a section title e.g. "1. PURPOSE & COMMITMENT" or "RECITALS"
                const isHeading = /^(?:[0-9]+\.|\bRECITALS\b|\bPURPOSE\b|\bSOLEMN\b|\bWITNESS\b|\bNOW, THEREFORE\b)/i.test(paragraph.trim());
                
                // If paragraph is the signature placeholder block in raw text, we render actual signature cards instead if includeSignatures is true
                if (paragraph.includes('SIGNATURES:') || paragraph.includes('IN WITNESS WHEREOF') || paragraph.includes('EXECUTED by the parties') || paragraph.includes('SEALED AND ATTESTED')) {
                  if (!includeSignatures) return null;
                  return (
                    <div key={index} className="pt-4 pb-2">
                      <p
                        className="font-bold text-sm uppercase tracking-wide mb-2"
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    </div>
                  );
                }

                // If paragraph has underscores e.g. "_______________________"
                if (paragraph.trim().startsWith('___')) {
                  return null; // Skip raw underscore text in favor of rich signature grid below
                }

                return (
                  <p
                    key={index}
                    className={`${isHeading ? 'font-bold mt-4' : 'opacity-90'}`}
                    dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, '<br/>') }}
                  />
                );
              })}
            </div>
          </div>

          {/* Signatures & Execution Section (Conditional based on creator enable/disable toggle) */}
          {includeSignatures && signatures.length > 0 && (
            <div className="mt-12 pt-8 border-t break-inside-avoid print:mt-6 print:pt-4" style={{ borderColor: `${theme.accentColor}33` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3">
                {signatures.map((sig) => {
                  const hasSignature = !!(sig.signatureData || (sig.type === 'type' && sig.name));

                  return (
                    <div
                      key={sig.id}
                      className="flex flex-col justify-end p-4 rounded-xl border border-dashed border-slate-300 bg-white/60 print:bg-transparent print:border-none print:p-0 transition-all hover:border-indigo-400 group"
                    >
                      <div className="min-h-[60px] flex items-end justify-center mb-1 relative">
                        {sig.signatureData ? (
                          <img
                            src={sig.signatureData}
                            alt={`${sig.label} signature`}
                            className="max-h-16 max-w-full object-contain mx-auto"
                          />
                        ) : sig.name ? (
                          <p
                            className="text-2xl text-slate-800 text-center"
                            style={{ fontFamily: "'Great Vibes', cursive, serif" }}
                          >
                            {sig.name}
                          </p>
                        ) : null}

                        {/* Interactive Sign Button overlay for web UI */}
                        <button
                          onClick={() => onOpenSignatureModal(sig)}
                          className="no-print absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/80 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-opacity shadow-md"
                        >
                          <PenTool size={13} /> {hasSignature ? 'Edit Signature' : 'Sign Now'}
                        </button>
                      </div>

                      {/* Signature Baseline */}
                      <div className="border-b-2 border-slate-700 mb-1.5" />

                      <div className="text-center sm:text-left">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {sig.name || '[Name Required]'}
                        </p>
                        <p className="text-[11px] font-semibold text-indigo-700 truncate">
                          {sig.title || sig.label}
                        </p>
                        {sig.label && sig.title && sig.label !== sig.title && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {sig.label}
                          </p>
                        )}
                        {sig.signedDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Signed: {sig.signedDate}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Document Bottom Authentication Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
                <span>Covenant Document Security Verification • ID: {Date.now().toString(36).toUpperCase()}</span>
                <span>Executed with authentic digital attestations</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContractPreview;

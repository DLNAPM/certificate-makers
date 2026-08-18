import React from 'react';
import { 
  ContractField, 
  ContractSignature, 
  ContractTheme, 
  OfficialSealType, 
  SealPosition, 
  SealEffectStyle 
} from '../../types';
import { renderContractText } from '../../services/documentParser';
import { CONTRACT_THEMES } from '../../constants';
import { Award, ShieldCheck, PenTool, CheckCircle, Sparkles } from 'lucide-react';
import OfficialSeal from '../OfficialSeal';

interface ContractPreviewProps {
  title: string;
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  includeSignatures?: boolean;
  themeId: string;
  sealType: OfficialSealType;
  customSealUrl?: string;
  sealPosition?: SealPosition;
  sealSize?: number;
  sealEffect?: SealEffectStyle;
  ribbonColor?: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
  highlightPlaceholders: boolean;
  onOpenSignatureModal: (signature: ContractSignature) => void;
  onOpenSealModal?: () => void;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({
  title,
  rawContent,
  fields,
  signatures,
  includeSignatures = true,
  themeId,
  sealType,
  customSealUrl,
  sealPosition = 'header_right',
  sealSize = 84,
  sealEffect = 'gold_foil',
  ribbonColor = 'none',
  highlightPlaceholders,
  onOpenSignatureModal,
  onOpenSealModal,
}) => {
  const theme = CONTRACT_THEMES.find(t => t.id === themeId) || CONTRACT_THEMES[0];

  // Process text with filled fields
  const processedText = renderContractText(rawContent, fields, highlightPlaceholders);

  // Split into paragraphs for proper typographic structure
  const rawParagraphs = processedText.split('\n\n').filter(p => p.trim());

  // Clean and format each paragraph so markdown asterisks never leak into rendered output
  const paragraphs = rawParagraphs.map(p => {
    return p
      .replace(/\*{3}([^\*\n\r]+)\*{3}/g, '<strong>$1</strong>')
      .replace(/\*{2}([^\*\n\r]+)\*{2}/g, '<strong>$1</strong>')
      .replace(/\*([^\*\n\r]+)\*/g, '$1')
      .replace(/\\\*/g, '')
      .replace(/\*{1,}/g, '');
  });

  const displayTitle = (title || 'Covenant Contract & Agreement').replace(/\*{1,}/g, '').trim();

  // Render Seal helper
  const renderSeal = (extraClasses: string = '') => {
    if (sealType === 'none') return null;

    return (
      <div 
        onClick={onOpenSealModal}
        className={`group relative select-none ${onOpenSealModal ? 'cursor-pointer' : ''} ${extraClasses}`}
        title={onOpenSealModal ? "Click to change or upload Official Seal / Medallion" : undefined}
      >
        <OfficialSeal
          sealType={sealType}
          customSealUrl={customSealUrl}
          size={sealSize}
          effect={sealEffect}
          ribbonColor={ribbonColor}
          interactive={!!onOpenSealModal}
        />
        {onOpenSealModal && (
          <div className="no-print absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap transition-opacity pointer-events-none z-30">
            Edit Seal
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center py-6 px-2 sm:px-6 print:p-0 print:m-0 print:w-full print:block">
      {/* Printable Sheet (Letter Aspect Ratio / Upright Portrait) */}
      <div
        id="contract-print-sheet"
        className={`relative w-full max-w-[850px] min-h-[1100px] shadow-2xl p-8 sm:p-14 print:p-8 print:m-0 print:shadow-none print:w-full print:max-w-none print:min-h-0 print:bg-white transition-all ${theme.bgClass}`}
        style={{
          backgroundColor: theme.paperColor,
          fontFamily: theme.bodyFont === 'font-serif' ? "'Plus Jakarta Sans', Georgia, serif" : 'inherit'
        }}
      >
        {/* Watermark Seal if chosen */}
        {sealPosition === 'watermark' && sealType !== 'none' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0 select-none overflow-hidden">
            <OfficialSeal
              sealType={sealType}
              customSealUrl={customSealUrl}
              size={Math.max(260, sealSize * 3)}
              effect="original"
              ribbonColor="none"
            />
          </div>
        )}

        {/* Outer & Inner Decorative Borders (Calibrated to wrap safely around all text) */}
        {theme.pageBorder === 'double' && (
          <>
            <div
              className="absolute inset-3 sm:inset-4 border-2 pointer-events-none print:inset-2.5"
              style={{ borderColor: theme.accentColor }}
            />
            <div
              className="absolute inset-5 sm:inset-6 border pointer-events-none opacity-60 print:inset-4"
              style={{ borderColor: theme.accentColor }}
            />
          </>
        )}

        {theme.pageBorder === 'ornate' && (
          <>
            <div
              className="absolute inset-4 border-4 rounded-xl pointer-events-none print:inset-3"
              style={{ borderColor: theme.accentColor }}
            />
            <div
              className="absolute inset-6 border border-dashed rounded-lg pointer-events-none opacity-40 print:inset-4.5"
              style={{ borderColor: theme.accentColor }}
            />
          </>
        )}

        {theme.pageBorder === 'single' && (
          <div
            className="absolute inset-4 border pointer-events-none print:inset-3"
            style={{ borderColor: theme.accentColor }}
          />
        )}

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between min-h-[1000px] print:min-h-0 px-2 sm:px-4 print:px-3">
          
          {/* Header & Seal */}
          <div>
            <div className={`flex items-start justify-between border-b pb-6 mb-8 gap-4 ${sealPosition === 'header_center' ? 'flex-col sm:flex-row items-center text-center' : ''}`} style={{ borderColor: `${theme.accentColor}33` }}>
              
              {/* Left Seal if header_left */}
              {sealPosition === 'header_left' && (
                <div className="shrink-0 hidden sm:flex">
                  {renderSeal()}
                </div>
              )}

              <div className={`flex-1 ${sealPosition === 'header_center' ? 'text-center' : 'text-center sm:text-left'}`}>
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
                  {displayTitle}
                </h1>
              </div>

              {/* Center Seal if header_center */}
              {sealPosition === 'header_center' && (
                <div className="my-2 sm:my-0 shrink-0">
                  {renderSeal()}
                </div>
              )}

              {/* Right Seal if header_right (default) */}
              {sealPosition === 'header_right' && (
                <div className="hidden sm:flex shrink-0">
                  {renderSeal()}
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
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-6">
                
                {/* Bottom Left Seal if chosen */}
                {sealPosition === 'bottom_left' && (
                  <div className="shrink-0 flex items-center justify-center p-2 mb-2">
                    {renderSeal()}
                  </div>
                )}

                {/* Signatures Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3">
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
                            className="no-print absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/80 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-opacity shadow-md cursor-pointer"
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

                {/* Bottom Center / Right Seal if chosen */}
                {(sealPosition === 'bottom_center' || sealPosition === 'bottom_right') && (
                  <div className="shrink-0 flex items-center justify-center p-2 mb-2">
                    {renderSeal()}
                  </div>
                )}
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


import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Scale,
  Heart,
  FileCheck,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ChevronRight,
  HelpCircle,
  FileText,
  Layers,
  Wand2,
  Sparkle,
  FileSignature,
  Download,
  Info,
  ExternalLink,
  Tag
} from 'lucide-react';
import { ContractField, ContractSignature } from '../../types';
import {
  IndustryStandardType,
  INDUSTRY_STANDARDS_INFO,
  PolishResult,
  DocuSignExecutionMode,
  polishContractWithAI,
  cleanAndFormatContractText
} from '../../services/polishService';

interface IndustryPolishModalProps {
  documentTitle: string;
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  includeSignatures: boolean;
  onApplyPolishedVersion: (result: PolishResult) => void;
  onClose: () => void;
}

const IndustryPolishModal: React.FC<IndustryPolishModalProps> = ({
  documentTitle,
  rawContent,
  fields,
  signatures,
  includeSignatures,
  onApplyPolishedVersion,
  onClose
}) => {
  const [selectedStandard, setSelectedStandard] = useState<IndustryStandardType>('docusign_legal');
  const [docuSignMode, setDocuSignMode] = useState<DocuSignExecutionMode>('standard_lines');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null);
  const [viewTab, setViewTab] = useState<'comparison' | 'polished' | 'original'>('comparison');
  const [isCopied, setIsCopied] = useState(false);
  const [isCleanedNotice, setIsCleanedNotice] = useState(false);
  const [editablePolishedContent, setEditablePolishedContent] = useState('');
  const [showDocuSignGuide, setShowDocuSignGuide] = useState(false);

  const filledCount = fields.filter(f => f.value && f.value.trim().length > 0).length;
  const totalCount = fields.length;
  const fillPercentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 100;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await polishContractWithAI({
        title: documentTitle,
        rawContent,
        fields,
        signatures,
        includeSignatures,
        standardType: selectedStandard,
        customInstructions: customNotes.trim() || undefined,
        docuSignMode
      });
      const cleanContent = cleanAndFormatContractText(result.polishedContent);
      setPolishResult({
        ...result,
        polishedContent: cleanContent,
        polishedTitle: cleanAndFormatContractText(result.polishedTitle),
        docuSignMode
      });
      setEditablePolishedContent(cleanContent);
      setViewTab('comparison');
    } catch (err) {
      console.error('Failed to polish contract:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCleanAsterisks = () => {
    const cleaned = cleanAndFormatContractText(editablePolishedContent);
    setEditablePolishedContent(cleaned);
    setIsCleanedNotice(true);
    setTimeout(() => setIsCleanedNotice(false), 2500);
  };

  const handleApply = () => {
    if (polishResult) {
      const finalCleanContent = cleanAndFormatContractText(editablePolishedContent);
      const finalCleanTitle = cleanAndFormatContractText(polishResult.polishedTitle);
      onApplyPolishedVersion({
        ...polishResult,
        polishedTitle: finalCleanTitle,
        polishedContent: finalCleanContent
      });
      onClose();
    }
  };

  const handleCopy = () => {
    const textToCopy = cleanAndFormatContractText(editablePolishedContent || polishResult?.polishedContent || '');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadDocuSignFile = () => {
    const textToDownload = cleanAndFormatContractText(editablePolishedContent || polishResult?.polishedContent || '');
    if (!textToDownload) return;

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(polishResult?.polishedTitle || 'DocuSign_Contract').replace(/[^a-zA-Z0-9_-]/g, '_')}_DocuSign_Ready.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStandardIcon = (type: IndustryStandardType) => {
    switch (type) {
      case 'docusign_legal':
        return <FileSignature size={18} className="text-amber-400" />;
      case 'executive_legal':
        return <Scale size={18} className="text-indigo-400" />;
      case 'pastoral_covenant':
        return <Heart size={18} className="text-rose-400" />;
      case 'plain_english_business':
        return <FileCheck size={18} className="text-sky-400" />;
      case 'formal_attestation':
        return <ShieldCheck size={18} className="text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-inner">
              <FileSignature size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Polish to Industry Standard</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Check size={10} /> DocuSign e-Sign Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transform agreement into a formal DocuSign-compliant standard where parties only sign their names and enter date
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDocuSignGuide(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <HelpCircle size={13} />
              <span>DocuSign Guide</span>
            </button>

            {/* Variable fill meter */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Filled Variables:</span>
              <span className={`font-mono font-bold ${filledCount === totalCount ? 'text-emerald-400' : 'text-amber-400'}`}>
                {filledCount}/{totalCount}
              </span>
              <span className="text-[10px] text-slate-400">({fillPercentage}%)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* If Result Not Yet Generated: Selection Screen */}
          {!polishResult ? (
            <div className="space-y-6">
              
              {/* Context Summary Banner with DocuSign Compliance Highlights */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
                    <FileSignature size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-indigo-950">
                        DocuSign E-Signature Integration Ready
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] bg-indigo-200/80 text-indigo-900 rounded font-bold">
                        ESIGN Act & UETA Standard
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                      All <strong className="text-indigo-950">{filledCount} filled variables</strong> will be integrated into the document body. The signature section will be formatted with standardized lines where parties <strong>only need to sign their names and enter their signature dates</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-indigo-950 hidden sm:inline">Execution Style:</span>
                  <div className="bg-white p-1 rounded-xl border border-indigo-200 flex gap-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setDocuSignMode('standard_lines')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        docuSignMode === 'standard_lines'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Clean Underlines
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocuSignMode('anchor_tags')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                        docuSignMode === 'anchor_tags'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Includes /s1/, /d1/ DocuSign Auto-Place anchor tags"
                    >
                      <Tag size={11} /> Auto-Tags (/s1/, /d1/)
                    </button>
                  </div>
                </div>
              </div>

              {/* Standard Selection Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    1. Select Target Industry Standard & Tone:
                  </label>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    All standards include DocuSign Sign & Date blocks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(INDUSTRY_STANDARDS_INFO) as IndustryStandardType[]).map((key) => {
                    const info = INDUSTRY_STANDARDS_INFO[key];
                    const isSelected = selectedStandard === key;

                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedStandard(key)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-900 rounded-md">
                                {getStandardIcon(key)}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-slate-900 block">{info.name}</span>
                                <span className="text-[10px] text-slate-500 font-medium">{info.tagline}</span>
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 mb-3 font-normal leading-relaxed">
                            {info.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          {info.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                              <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Guidance / Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  2. Optional Specific Instructions or Inclusions (e.g. state jurisdiction, 60-day check-in, confidentiality level):
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Optional: e.g., 'Ensure clear mediation clause before any formal dispute', 'Include pastoral counselor as attesting witness', 'State of Texas governing law'..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* Polish Generation Action Trigger */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Info size={13} className="text-indigo-600" />
                  <span>Output is asterisk-free and prepared for DocuSign envelopes.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Drafting DocuSign Standard Document...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Produce DocuSign-Standard Version</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* If Result IS Generated: Full Comparison and Acceptance View */
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Success Enhancement Banner */}
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-emerald-950">
                          {polishResult.polishedTitle}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <Check size={11} /> DocuSign Ready
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Standard Applied: <strong>{polishResult.standardName}</strong> • {polishResult.filledVariablesCount} Variables Integrated • Parties Only Sign & Date
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPolishResult(null)}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Try Different Standard
                    </button>
                  </div>
                </div>

                {/* Enhancements Summary Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/80">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                      Enhancements Made:
                    </span>
                    <ul className="space-y-0.5">
                      {polishResult.summaryOfEnhancements.map((enh, i) => (
                        <li key={i} className="text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                          <Check size={12} className="text-emerald-700 shrink-0" />
                          <span>{enh}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                      Standard Legal Protections:
                    </span>
                    <ul className="space-y-0.5">
                      {polishResult.keyProtectionsAdded.map((prot, i) => (
                        <li key={i} className="text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                          <ShieldCheck size={12} className="text-emerald-700 shrink-0" />
                          <span>{prot}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* View Tabs & Quick Actions */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewTab('comparison')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      viewTab === 'comparison'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Side-by-Side Comparison
                  </button>
                  <button
                    onClick={() => setViewTab('polished')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      viewTab === 'polished'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    DocuSign Version (Editable)
                  </button>
                  <button
                    onClick={() => setViewTab('original')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      viewTab === 'original'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Original Uploaded Text
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCleanAsterisks}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      isCleanedNotice 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                    title="Remove any residual markdown asterisks and standardize spacing"
                  >
                    <Wand2 size={13} className={isCleanedNotice ? 'text-white' : 'text-amber-700'} />
                    <span>{isCleanedNotice ? 'Asterisks Removed!' : 'Clean Asterisks'}</span>
                  </button>

                  <button
                    onClick={handleDownloadDocuSignFile}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download DocuSign prepared text file"
                  >
                    <Download size={13} />
                    <span>Download .txt</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copied!' : 'Copy DocuSign Text'}</span>
                  </button>
                </div>
              </div>

              {/* Content Panels according to viewTab */}
              {viewTab === 'comparison' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original draft */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Original Uploaded Draft</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100">Draft</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                      {rawContent}
                    </div>
                  </div>

                  {/* Polished version */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                      <div className="flex items-center gap-1.5">
                        <FileSignature size={13} className="text-indigo-600" />
                        <span>Polished DocuSign Standard</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Sign & Date Only
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                        {polishResult.standardName}
                      </span>
                    </div>
                    <textarea
                      value={editablePolishedContent}
                      onChange={(e) => setEditablePolishedContent(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-indigo-400 rounded-xl text-xs text-slate-900 font-mono whitespace-pre-wrap max-h-96 min-h-[384px] overflow-y-auto leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              ) : viewTab === 'polished' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>You can edit this DocuSign draft directly before applying:</span>
                    <span className="text-[11px] text-emerald-700 font-bold">DocuSign Standard • Asterisk-Free</span>
                  </div>
                  <textarea
                    value={editablePolishedContent}
                    onChange={(e) => setEditablePolishedContent(e.target.value)}
                    rows={16}
                    className="w-full p-4 bg-white border-2 border-indigo-400 rounded-xl text-xs text-slate-900 font-mono whitespace-pre-wrap leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                    {rawContent}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Applying will update your document text with the DocuSign execution standard while preserving your variable registry.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Keep Original
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all hover:shadow-lg cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Apply Polished Version to Contract</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* DocuSign Guide Sub-Modal */}
        {showDocuSignGuide && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <FileSignature size={18} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">DocuSign Integration Standard Guide</h4>
                </div>
                <button
                  onClick={() => setShowDocuSignGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                  <p className="font-bold text-indigo-950">How Parties Sign in DocuSign:</p>
                  <p className="text-indigo-900/80">
                    1. <strong>Signer Only Signs Name:</strong> The recipient clicks the designated DocuSign "Sign" tab. Their verified legal signature is placed on the <code>Signature: __________________</code> line.
                  </p>
                  <p className="text-indigo-900/80">
                    2. <strong>Signer Enters Date:</strong> The recipient enters or clicks the DocuSign "Date Signed" tab on the <code>Date of Signature: __________________</code> line.
                  </p>
                  <p className="text-indigo-900/80">
                    3. <strong>Pre-filled Body Terms:</strong> All covenants, amounts, session hours, and party names are already pre-filled in the document body, eliminating form-filling errors.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">DocuSign Auto-Place Tags:</p>
                  <p>
                    If you choose <strong>Auto-Tags (`/s1/`, `/d1/`)</strong>, DocuSign will automatically place Signer 1's signature at <code>/s1/</code> and date at <code>/d1/</code> without having to manually drag fields into place.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-slate-800">Legal Compliance:</p>
                  <p>
                    Includes the standard U.S. Electronic Signatures in Global and National Commerce Act (ESIGN Act, 15 U.S.C. § 7001) and Uniform Electronic Transactions Act (UETA) counterpart clause.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDocuSignGuide(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IndustryPolishModal;

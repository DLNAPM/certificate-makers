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
  Sparkle
} from 'lucide-react';
import { ContractField, ContractSignature } from '../../types';
import {
  IndustryStandardType,
  INDUSTRY_STANDARDS_INFO,
  PolishResult,
  polishContractWithAI
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
  const [selectedStandard, setSelectedStandard] = useState<IndustryStandardType>('executive_legal');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null);
  const [viewTab, setViewTab] = useState<'comparison' | 'polished' | 'original'>('comparison');
  const [isCopied, setIsCopied] = useState(false);
  const [editablePolishedContent, setEditablePolishedContent] = useState('');

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
        customInstructions: customNotes.trim() || undefined
      });
      setPolishResult(result);
      setEditablePolishedContent(result.polishedContent);
      setViewTab('comparison');
    } catch (err) {
      console.error('Failed to polish contract:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (polishResult) {
      onApplyPolishedVersion({
        ...polishResult,
        polishedContent: editablePolishedContent
      });
      onClose();
    }
  };

  const handleCopy = () => {
    if (editablePolishedContent || polishResult?.polishedContent) {
      navigator.clipboard.writeText(editablePolishedContent || polishResult!.polishedContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getStandardIcon = (type: IndustryStandardType) => {
    switch (type) {
      case 'executive_legal':
        return <Scale size={18} className="text-amber-400" />;
      case 'pastoral_covenant':
        return <Heart size={18} className="text-rose-400" />;
      case 'plain_english_business':
        return <FileCheck size={18} className="text-indigo-400" />;
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
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Polish to Industry Standard</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AI Legal & Covenant Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transform draft and filled variables into a formal, legally structured, or pastoral covenant standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              
              {/* Context Summary Banner */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950">
                      Document Ready for Standardization: "{documentTitle}"
                    </h4>
                    <p className="text-xs text-indigo-900/80 mt-0.5">
                      All <strong className="text-indigo-950">{filledCount} filled variables</strong> and party details will be permanently woven into formal recitals, numbered clauses, and binding covenants without losing any user data.
                    </p>
                  </div>
                </div>

                {filledCount < totalCount && (
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 shrink-0 font-medium">
                    Note: {totalCount - filledCount} fields remain blank and will use formatted placeholders.
                  </div>
                )}
              </div>

              {/* Standard Selection Cards */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-3">
                  1. Select Target Industry Standard & Tone:
                </label>
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
                            ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-900 rounded-md">
                                {getStandardIcon(key)}
                              </div>
                              <span className="font-bold text-sm text-slate-900">{info.name}</span>
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
                  placeholder="Optional: e.g., 'Ensure clear mediation clause before any formal dispute', 'Highlight premarital counseling milestones and pastoral care contacts'..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* Polish Generation Action Trigger */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
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
                      <span>Drafting Industry Standard Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Produce Polished Standard Version</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* If Result IS Generated: Full Comparison and Acceptance View */
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Success Enhancement Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        Polished Version Created: {polishResult.polishedTitle}
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Standard Applied: <strong>{polishResult.standardName}</strong> • {polishResult.filledVariablesCount} Filled Variables Integrated
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPolishResult(null)}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
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
                      Standard Protections Added:
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

              {/* View Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewTab('comparison')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      viewTab === 'comparison'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Side-by-Side Comparison
                  </button>
                  <button
                    onClick={() => setViewTab('polished')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      viewTab === 'polished'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Polished Version (Editable)
                  </button>
                  <button
                    onClick={() => setViewTab('original')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      viewTab === 'original'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Original Uploaded Text
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copied!' : 'Copy Polished Text'}</span>
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
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-indigo-600" />
                        Polished Industry Standard
                      </span>
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
                    <span>You can edit this polished draft directly before applying:</span>
                    <span className="text-[11px] text-slate-500 font-normal">All edits will carry over to document preview</span>
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
                  Applying will update your document text and title with the polished industry standard while keeping all variable records intact.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
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

      </div>
    </div>
  );
};

export default IndustryPolishModal;

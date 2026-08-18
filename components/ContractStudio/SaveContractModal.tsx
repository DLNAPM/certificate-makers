import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Cloud, 
  HardDrive, 
  Check, 
  FileText, 
  Sparkles,
  AlertCircle,
  Copy
} from 'lucide-react';
import { 
  ContractDocument, 
  ContractField, 
  ContractSignature, 
  UserProfile, 
  OfficialSealType, 
  SealPosition, 
  SealEffectStyle 
} from '../../types';

interface SaveContractModalProps {
  currentDraftId: string | null;
  documentTitle: string;
  rawContent: string;
  fields: ContractField[];
  signatures: ContractSignature[];
  includeSignatures: boolean;
  selectedThemeId: string;
  selectedSeal: OfficialSealType;
  customSealUrl?: string;
  sealPosition?: SealPosition;
  sealSize?: number;
  sealEffect?: SealEffectStyle;
  ribbonColor?: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
  user: UserProfile | null;
  onSaveSuccess: (savedDoc: ContractDocument, isCloud: boolean) => void;
  onClose: () => void;
}

const SaveContractModal: React.FC<SaveContractModalProps> = ({
  currentDraftId,
  documentTitle,
  rawContent,
  fields,
  signatures,
  includeSignatures,
  selectedThemeId,
  selectedSeal,
  customSealUrl,
  sealPosition,
  sealSize,
  sealEffect,
  ribbonColor,
  user,
  onSaveSuccess,
  onClose
}) => {
  const [title, setTitle] = useState(documentTitle || 'Untitled Contract Draft');
  const [notes, setNotes] = useState('');
  const [saveMode, setSaveMode] = useState<'update' | 'new'>(currentDraftId ? 'update' : 'new');
  const [saveToCloud, setSaveToCloud] = useState<boolean>(!!user);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Variable completion metrics
  const filledCount = fields.filter(f => f.value && f.value.trim().length > 0).length;
  const totalCount = fields.length;
  const percentComplete = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 100;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a title for this contract draft.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const now = Date.now();
      const draftId = (saveMode === 'update' && currentDraftId) 
        ? currentDraftId 
        : `contract_${now}_${Math.random().toString(36).substring(2, 6)}`;

      const contractDoc: ContractDocument = {
        id: draftId,
        title: title.trim(),
        rawContent,
        fields,
        signatures,
        includeSignatures,
        themeId: selectedThemeId,
        sealType: selectedSeal,
        customSealUrl,
        sealPosition,
        sealSize,
        sealEffect,
        ribbonColor,
        createdAt: saveMode === 'update' ? now : now,
        updatedAt: now,
        notes: notes.trim() || undefined
      };

      // 1. Save to Local Storage
      const existingLocal: ContractDocument[] = JSON.parse(localStorage.getItem('covenant_saved_contracts') || '[]');
      let updatedLocal: ContractDocument[];

      if (saveMode === 'update' && currentDraftId) {
        const foundIndex = existingLocal.findIndex(d => d.id === currentDraftId);
        if (foundIndex >= 0) {
          updatedLocal = [...existingLocal];
          updatedLocal[foundIndex] = {
            ...existingLocal[foundIndex],
            ...contractDoc,
            createdAt: existingLocal[foundIndex].createdAt || now
          };
        } else {
          updatedLocal = [contractDoc, ...existingLocal];
        }
      } else {
        updatedLocal = [contractDoc, ...existingLocal];
      }

      localStorage.setItem('covenant_saved_contracts', JSON.stringify(updatedLocal));

      // 2. Save to Cloud if selected and logged in
      let savedToCloud = false;
      if (saveToCloud && user) {
        try {
          const { saveContractToCloud, updateContractInCloud } = await import('../../services/firebase');
          if (saveMode === 'update' && currentDraftId && !currentDraftId.startsWith('contract_')) {
            // Already a cloud ID
            await updateContractInCloud(currentDraftId, contractDoc);
          } else {
            const cloudId = await saveContractToCloud(contractDoc, user);
            contractDoc.id = cloudId;
          }
          savedToCloud = true;
        } catch (cloudErr: any) {
          console.warn("Could not save to Cloud Firestore:", cloudErr);
          // Still success locally
        }
      }

      onSaveSuccess(contractDoc, savedToCloud);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Failed to save contract draft.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm">
              <Save size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">Save Contract Draft</h3>
              <p className="text-xs text-slate-400">Preserve all contract clauses, filled variables, and signatures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Draft Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Draft Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premarital Covenant - Smith & Davis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* If updating existing draft, show mode selector */}
          {currentDraftId && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Save Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSaveMode('update')}
                  className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    saveMode === 'update'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Save size={14} />
                  <span>Update Existing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSaveMode('new')}
                  className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    saveMode === 'new'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Copy size={14} />
                  <span>Save as New Copy</span>
                </button>
              </div>
            </div>
          )}

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Draft Notes / Session Details <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed intake questionnaire; pending counselor final signing."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Summary Status Box */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-indigo-950 font-semibold">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" />
                <span>Variable Completion:</span>
              </span>
              <span className="font-bold">{filledCount} of {totalCount} filled ({percentComplete}%)</span>
            </div>
            
            <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
              <span>Signatures: {signatures.length} defined</span>
              <span>Theme: {selectedThemeId}</span>
            </div>
          </div>

          {/* Storage Destination */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Storage Location
            </label>
            <div className="space-y-1.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-200 text-slate-700 rounded-lg">
                    <HardDrive size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Local Browser Storage</p>
                    <p className="text-[11px] text-slate-500">Always saved locally on this browser</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <Check size={12} /> Included
                </span>
              </div>

              {user ? (
                <label className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                      <Cloud size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Cloud Sync (Firebase)</p>
                      <p className="text-[11px] text-slate-500">Access across devices for {user.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={saveToCloud}
                    onChange={(e) => setSaveToCloud(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  <span>Sign in to automatically sync drafts to your secure Google / Firebase Cloud account.</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Draft...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={15} />
                  <span>Save Draft</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveContractModal;

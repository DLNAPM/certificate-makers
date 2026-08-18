import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  FolderOpen, 
  HardDrive, 
  Cloud, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Upload, 
  Copy, 
  Edit3, 
  Sparkles, 
  ArrowRight,
  Plus,
  LogIn,
  Check,
  RefreshCw
} from 'lucide-react';
import { ContractDocument, UserProfile } from '../../types';

interface SavedDraftsModalProps {
  currentDraftId: string | null;
  user: UserProfile | null;
  onLoadDraft: (draft: ContractDocument) => void;
  onOpenSaveModal: () => void;
  onLogin: () => void;
  onClose: () => void;
}

const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  currentDraftId,
  user,
  onLoadDraft,
  onOpenSaveModal,
  onLogin,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'cloud'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localDrafts, setLocalDrafts] = useState<ContractDocument[]>([]);
  const [cloudDrafts, setCloudDrafts] = useState<ContractDocument[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [syncingDraftId, setSyncingDraftId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  const fileImportRef = useRef<HTMLInputElement | null>(null);

  // Load local drafts on mount
  useEffect(() => {
    loadLocalDrafts();
    if (user) {
      loadCloudDrafts();
    }
  }, [user]);

  const loadLocalDrafts = () => {
    try {
      const stored = localStorage.getItem('covenant_saved_contracts');
      if (stored) {
        const parsed: ContractDocument[] = JSON.parse(stored);
        setLocalDrafts(parsed);
      } else {
        setLocalDrafts([]);
      }
    } catch (e) {
      console.error("Error reading local drafts:", e);
      setLocalDrafts([]);
    }
  };

  const loadCloudDrafts = async () => {
    if (!user) return;
    setIsLoadingCloud(true);
    try {
      const { fetchCloudContracts } = await import('../../services/firebase');
      const drafts = await fetchCloudContracts(user);
      setCloudDrafts(drafts);
    } catch (e) {
      console.error("Error fetching cloud drafts:", e);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Combine and deduplicate / filter drafts
  const getDraftsList = (): (ContractDocument & { source: 'local' | 'cloud' | 'both' })[] => {
    const list: (ContractDocument & { source: 'local' | 'cloud' | 'both' })[] = [];
    const seenIds = new Set<string>();

    if (activeTab === 'all' || activeTab === 'local') {
      localDrafts.forEach(d => {
        const isAlsoInCloud = cloudDrafts.some(cd => cd.id === d.id || cd.title === d.title);
        list.push({ ...d, source: isAlsoInCloud ? 'both' : 'local' });
        seenIds.add(d.id);
      });
    }

    if (activeTab === 'all' || activeTab === 'cloud') {
      cloudDrafts.forEach(cd => {
        if (!seenIds.has(cd.id)) {
          list.push({ ...cd, source: 'cloud' });
          seenIds.add(cd.id);
        }
      });
    }

    // Sort by latest updated
    list.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(d => 
      d.title.toLowerCase().includes(q) ||
      (d.notes && d.notes.toLowerCase().includes(q)) ||
      d.fields?.some(f => f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q)) ||
      d.rawContent?.toLowerCase().includes(q)
    );
  };

  // Delete draft handler
  const handleDeleteDraft = async (draftId: string, source: 'local' | 'cloud' | 'both', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this contract draft?")) return;

    // Delete local
    if (source === 'local' || source === 'both') {
      const updated = localDrafts.filter(d => d.id !== draftId);
      localStorage.setItem('covenant_saved_contracts', JSON.stringify(updated));
      setLocalDrafts(updated);
    }

    // Delete cloud
    if ((source === 'cloud' || source === 'both') && user) {
      try {
        const { deleteContractFromCloud } = await import('../../services/firebase');
        await deleteContractFromCloud(draftId);
        setCloudDrafts(prev => prev.filter(d => d.id !== draftId));
      } catch (err) {
        console.error("Cloud delete error:", err);
      }
    }

    showToast("Contract draft deleted.");
  };

  // Duplicate draft handler
  const handleDuplicateDraft = (draft: ContractDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    const newDoc: ContractDocument = {
      ...draft,
      id: `contract_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${draft.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newDoc, ...localDrafts];
    localStorage.setItem('covenant_saved_contracts', JSON.stringify(updated));
    setLocalDrafts(updated);
    showToast(`Duplicated '${draft.title}'`);
  };

  // Export draft as JSON file
  const handleExportJSON = (draft: ContractDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = JSON.stringify(draft, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draft.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Draft.covenant.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Exported draft backup file.");
  };

  // Import JSON draft file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.rawContent || !parsed.fields) {
          alert("Invalid contract draft file format.");
          return;
        }

        const importedDoc: ContractDocument = {
          ...parsed,
          id: `contract_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: parsed.title ? `${parsed.title} (Imported)` : 'Imported Contract Draft',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        const updated = [importedDoc, ...localDrafts];
        localStorage.setItem('covenant_saved_contracts', JSON.stringify(updated));
        setLocalDrafts(updated);
        showToast(`Successfully imported '${importedDoc.title}'!`);
      } catch (err: any) {
        alert(`Error parsing draft JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Rename draft
  const handleSaveRename = (draftId: string, source: 'local' | 'cloud' | 'both') => {
    if (!editTitleValue.trim()) {
      setEditingTitleId(null);
      return;
    }

    const trimmed = editTitleValue.trim();

    if (source === 'local' || source === 'both') {
      const updated = localDrafts.map(d => d.id === draftId ? { ...d, title: trimmed, updatedAt: Date.now() } : d);
      localStorage.setItem('covenant_saved_contracts', JSON.stringify(updated));
      setLocalDrafts(updated);
    }

    if ((source === 'cloud' || source === 'both') && user) {
      import('../../services/firebase').then(({ updateContractInCloud }) => {
        updateContractInCloud(draftId, { title: trimmed });
        setCloudDrafts(prev => prev.map(d => d.id === draftId ? { ...d, title: trimmed, updatedAt: Date.now() } : d));
      }).catch(console.error);
    }

    setEditingTitleId(null);
    showToast("Draft renamed.");
  };

  // Sync a local draft to Cloud
  const handleSyncToCloud = async (draft: ContractDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onLogin();
      return;
    }

    setSyncingDraftId(draft.id);
    try {
      const { saveContractToCloud } = await import('../../services/firebase');
      const cloudId = await saveContractToCloud(draft, user);
      await loadCloudDrafts();
      showToast(`Synced '${draft.title}' to Cloud Firestore!`);
    } catch (err: any) {
      alert(`Cloud sync failed: ${err.message}`);
    } finally {
      setSyncingDraftId(null);
    }
  };

  const displayedDrafts = getDraftsList();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md">
              <FolderOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight text-white">Saved Contract Drafts</h3>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700">
                  {displayedDrafts.length} {displayedDrafts.length === 1 ? 'draft' : 'drafts'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Load, restore, export, or sync your saved contracts and variable entries</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Import JSON File Button */}
            <input
              type="file"
              ref={fileImportRef}
              onChange={handleFileImport}
              accept=".json,.covenant.json"
              className="hidden"
            />
            <button
              onClick={() => fileImportRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Import a saved .covenant.json backup draft file from your computer"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">Import Draft File</span>
              <span className="sm:hidden">Import</span>
            </button>

            {/* Save Current Document Action */}
            <button
              onClick={() => {
                onClose();
                onOpenSaveModal();
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Save current contract document as a new draft"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Save Current Work</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toast / Notification Banner */}
        {notification && (
          <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{notification}</span>
            </span>
            <button onClick={() => setNotification(null)} className="text-emerald-200 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Toolbar: Search + Source Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drafts by title, clause, or variable..."
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Source Tabs */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Drafts ({localDrafts.length + cloudDrafts.filter(c => !localDrafts.some(l => l.id === c.id)).length})
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'local'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive size={13} />
              <span>Local ({localDrafts.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('cloud');
                if (user) loadCloudDrafts();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'cloud'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cloud size={13} />
              <span>Cloud ({cloudDrafts.length})</span>
            </button>
          </div>
        </div>

        {/* Drafts List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-100">
          
          {/* Cloud Login Prompt if viewing Cloud Tab and not logged in */}
          {activeTab === 'cloud' && !user && (
            <div className="p-6 bg-white border border-indigo-200 rounded-2xl text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Cloud size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Sign in to access your Cloud Drafts</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sync your premarital covenants, counseling agreements, and custom contracts securely across all devices.
              </p>
              <button
                onClick={onLogin}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <LogIn size={15} />
                <span>Sign In with Google</span>
              </button>
            </div>
          )}

          {isLoadingCloud && activeTab === 'cloud' && (
            <div className="p-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Fetching Cloud Drafts from Firebase...</p>
            </div>
          )}

          {/* Empty State */}
          {displayedDrafts.length === 0 && (!isLoadingCloud || activeTab !== 'cloud') && (
            <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <FolderOpen size={28} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">No Saved Contract Drafts Found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {searchQuery 
                    ? `No drafts matched "${searchQuery}". Try a different keyword.`
                    : "You haven't saved any contract drafts yet. Save your current working document or import a draft file to get started."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSaveModal();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={14} />
                  <span>Save Current Document as Draft</span>
                </button>
                <button
                  onClick={() => fileImportRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-slate-200 transition-colors"
                >
                  <Upload size={14} />
                  <span>Import .covenant.json File</span>
                </button>
              </div>
            </div>
          )}

          {/* Drafts Cards Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {displayedDrafts.map((draft) => {
              const isCurrentlyActive = currentDraftId === draft.id;
              const filledFields = (draft.fields || []).filter(f => f.value && f.value.trim().length > 0).length;
              const totalFields = (draft.fields || []).length;
              const fillPercent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100;
              const signedCount = (draft.signatures || []).filter(s => !!s.name || !!s.signatureData).length;
              const totalSigs = (draft.signatures || []).length;

              return (
                <div
                  key={draft.id}
                  className={`bg-white rounded-2xl p-4.5 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCurrentlyActive 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Draft info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Active indicator */}
                      {isCurrentlyActive && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                          Current Open Draft
                        </span>
                      )}

                      {/* Storage Source Badge */}
                      {draft.source === 'cloud' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md flex items-center gap-1 border border-purple-200">
                          <Cloud size={10} /> Cloud Synced
                        </span>
                      )}
                      {draft.source === 'local' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md flex items-center gap-1 border border-slate-200">
                          <HardDrive size={10} /> Local Browser
                        </span>
                      )}
                      {draft.source === 'both' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1 border border-emerald-200">
                          <Check size={10} /> Local + Cloud Synced
                        </span>
                      )}

                      {/* Theme / Seal Badge */}
                      <span className="text-[10px] text-slate-500 font-medium">
                        Theme: {draft.themeId || 'Standard'}
                      </span>
                    </div>

                    {/* Title with In-line Rename */}
                    {editingTitleId === draft.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          className="px-2.5 py-1 bg-white border border-indigo-500 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(draft.id, draft.source);
                            if (e.key === 'Escape') setEditingTitleId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(draft.id, draft.source)}
                          className="p-1 bg-indigo-600 text-white rounded-md text-xs font-bold"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingTitleId(null)}
                          className="p-1 text-slate-500 hover:text-slate-700 rounded-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {draft.title}
                        </h4>
                        <button
                          onClick={() => {
                            setEditingTitleId(draft.id);
                            setEditTitleValue(draft.title);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                          title="Rename Draft"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    )}

                    {/* Excerpt / Notes */}
                    {draft.notes ? (
                      <p className="text-xs text-slate-600 italic line-clamp-1">
                        "{draft.notes}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {draft.rawContent.substring(0, 110)}...
                      </p>
                    )}

                    {/* Progress Bar & Details */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                      {/* Variables filled pill */}
                      <span className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                        fillPercent === 100 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : fillPercent > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span>Variables:</span>
                        <span>{filledFields}/{totalFields} filled ({fillPercent}%)</span>
                      </span>

                      {/* Signatures status */}
                      {totalSigs > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-indigo-500" />
                          <span>{signedCount}/{totalSigs} signed</span>
                        </span>
                      )}

                      {/* Updated Date */}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span>Saved {formatDate(draft.updatedAt || draft.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Primary LOAD DRAFT Button */}
                    <button
                      onClick={() => {
                        onLoadDraft(draft);
                        onClose();
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <FileText size={14} className="text-amber-400 group-hover:text-white transition-colors" />
                      <span>Load Draft</span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Secondary Utility Actions */}
                    <div className="flex items-center gap-1 text-slate-500">
                      {/* Cloud Sync (if local-only and user is logged in) */}
                      {draft.source === 'local' && user && (
                        <button
                          onClick={(e) => handleSyncToCloud(draft, e)}
                          disabled={syncingDraftId === draft.id}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sync to Cloud Firestore"
                        >
                          <Cloud size={14} />
                        </button>
                      )}

                      {/* Duplicate */}
                      <button
                        onClick={(e) => handleDuplicateDraft(draft, e)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Duplicate Draft"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Export JSON */}
                      <button
                        onClick={(e) => handleExportJSON(draft, e)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Export Backup File (.json)"
                      >
                        <Download size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDeleteDraft(draft.id, draft.source, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Draft"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>Drafts automatically preserve all custom fields, signatures, and styling choices.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedDraftsModal;

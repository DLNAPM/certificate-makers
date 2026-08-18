import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Printer,
  Sparkles,
  PenTool,
  Save,
  Download,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Palette,
  Eye,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Search,
  Check,
  FileDown,
  RefreshCw,
  Copy,
  AlertCircle,
  X,
  ListOrdered,
  LayoutGrid,
  ToggleLeft,
  ToggleRight,
  Edit3,
  FolderOpen,
  HardDrive,
  Cloud,
  Award,
  Wand2
} from 'lucide-react';
import { 
  ContractField, 
  ContractSignature, 
  ContractDocument, 
  UserProfile, 
  StandardClause,
  OfficialSealType,
  SealPosition,
  SealEffectStyle,
  OfficialSealConfig
} from '../../types';
import { SAMPLE_CONTRACTS, CONTRACT_THEMES } from '../../constants';
import { ParseResult, extractFieldsAndSignatures, parseUploadedContractFile } from '../../services/documentParser';
import ContractPreview from './ContractPreview';
import ContractUploadModal from './ContractUploadModal';
import SignatureModal from './SignatureModal';
import ClauseLibraryModal from './ClauseLibraryModal';
import IndustryPolishModal from './IndustryPolishModal';
import SaveContractModal from './SaveContractModal';
import SavedDraftsModal from './SavedDraftsModal';
import SealUploadModal from '../SealUploadModal';
import OfficialSeal from '../OfficialSeal';
import { PolishResult, cleanAndFormatContractText } from '../../services/polishService';

interface ContractStudioProps {
  user: UserProfile | null;
  onBackToCertificates: () => void;
  onLogin: () => void;
}

const ContractStudio: React.FC<ContractStudioProps> = ({
  user,
  onBackToCertificates,
  onLogin
}) => {
  // Initial default contract from sample
  const defaultSample = SAMPLE_CONTRACTS[0];
  const initialParsed = extractFieldsAndSignatures(defaultSample.content, defaultSample.title);

  const [documentTitle, setDocumentTitle] = useState(defaultSample.title);
  const [rawContent, setRawContent] = useState(defaultSample.content);
  const [fields, setFields] = useState<ContractField[]>(initialParsed.fields);
  const [signatures, setSignatures] = useState<ContractSignature[]>(initialParsed.signatures);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [showSolemnTitle, setShowSolemnTitle] = useState<boolean>(true);
  const [selectedThemeId, setSelectedThemeId] = useState('parchment-classic');
  const [selectedSeal, setSelectedSeal] = useState<OfficialSealType>('covenant_gold');
  const [customSealUrl, setCustomSealUrl] = useState<string>('');
  const [sealPosition, setSealPosition] = useState<SealPosition>('header_right');
  const [sealSize, setSealSize] = useState<number>(84);
  const [sealEffect, setSealEffect] = useState<SealEffectStyle>('gold_foil');
  const [ribbonColor, setRibbonColor] = useState<'gold' | 'navy' | 'burgundy' | 'emerald' | 'none'>('none');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'fields' | 'text' | 'style' | 'signatures'>('fields');
  const [fieldViewMode, setFieldViewMode] = useState<'template_order' | 'categories'>('template_order');
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [showSealModal, setShowSealModal] = useState(false);
  const [activeSignature, setActiveSignature] = useState<ContractSignature | null>(null);
  const [searchField, setSearchField] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [polishSuccessToast, setPolishSuccessToast] = useState<string | null>(null);
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);

  // Saved Drafts state
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showLoadDraftModal, setShowLoadDraftModal] = useState(false);
  const [draftsCount, setDraftsCount] = useState<number>(0);

  // Refresh saved drafts count from local storage
  const refreshDraftsCount = useCallback(() => {
    try {
      const stored = localStorage.getItem('covenant_saved_contracts');
      const count = stored ? JSON.parse(stored).length : 0;
      setDraftsCount(count);
    } catch {
      setDraftsCount(0);
    }
  }, []);

  useEffect(() => {
    refreshDraftsCount();
  }, [refreshDraftsCount]);

  // Keyboard shortcut Ctrl+S / Cmd+S to save draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveDraftModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle loading a saved contract draft
  const handleLoadDraft = (draft: ContractDocument) => {
    setCurrentDraftId(draft.id);
    setDocumentTitle(draft.title);
    setRawContent(draft.rawContent);
    setFields(draft.fields || []);
    setSignatures(draft.signatures || []);
    if (draft.includeSignatures !== undefined) {
      setIncludeSignatures(draft.includeSignatures);
    }
    if (draft.showSolemnTitle !== undefined) {
      setShowSolemnTitle(draft.showSolemnTitle);
    }
    if (draft.themeId) {
      setSelectedThemeId(draft.themeId);
    }
    if (draft.sealType) {
      setSelectedSeal(draft.sealType);
    }
    if (draft.customSealUrl !== undefined) {
      setCustomSealUrl(draft.customSealUrl);
    }
    if (draft.sealPosition) {
      setSealPosition(draft.sealPosition);
    }
    if (draft.sealSize) {
      setSealSize(draft.sealSize);
    }
    if (draft.sealEffect) {
      setSealEffect(draft.sealEffect);
    }
    if (draft.ribbonColor) {
      setRibbonColor(draft.ribbonColor);
    }
    setActiveTab('fields');
    setFieldViewMode('template_order');
    setPolishSuccessToast(`Loaded saved draft: "${draft.title}" with ${(draft.fields || []).length} variables`);
    setTimeout(() => setPolishSuccessToast(null), 5000);
    refreshDraftsCount();
  };

  // Handle applying official seal configuration
  const handleApplySeal = (config: OfficialSealConfig) => {
    setSelectedSeal(config.type);
    if (config.customUrl !== undefined) {
      setCustomSealUrl(config.customUrl);
    }
    if (config.position) {
      setSealPosition(config.position);
    }
    if (config.size) {
      setSealSize(config.size);
    }
    if (config.effect) {
      setSealEffect(config.effect);
    }
    if (config.ribbonColor) {
      setRibbonColor(config.ribbonColor);
    }

    setPolishSuccessToast(`Official Seal updated! (${config.type === 'custom' ? 'Custom Uploaded Medallion' : config.type})`);
    setTimeout(() => setPolishSuccessToast(null), 4000);
  };

  // Handle successful save from modal
  const handleSaveSuccess = (savedDoc: ContractDocument, isCloud: boolean) => {
    setCurrentDraftId(savedDoc.id);
    setShowSaveDraftModal(false);
    refreshDraftsCount();
    setPolishSuccessToast(`Draft "${savedDoc.title}" saved successfully${isCloud ? ' (synced to Cloud)' : ''}!`);
    setTimeout(() => setPolishSuccessToast(null), 5000);
  };

  // Apply Polished Industry Standard Version
  const handleApplyPolishedVersion = (result: PolishResult) => {
    const cleanTitle = cleanAndFormatContractText(result.polishedTitle);
    const cleanContent = cleanAndFormatContractText(result.polishedContent);
    setDocumentTitle(cleanTitle);
    setRawContent(cleanContent);
    
    // Auto-switch to preview and notify
    setPolishSuccessToast(`Polished to ${result.standardName}! Formatted cleanly with all unnecessary asterisks removed.`);
    setTimeout(() => setPolishSuccessToast(null), 5000);
  };
  
  // Scan notification state
  const [scanNotification, setScanNotification] = useState<{
    fileName: string;
    variableCount: number;
    signatureCount: number;
  } | null>(null);

  const leftPaneFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLeftPaneDragging, setIsLeftPaneDragging] = useState(false);

  // Sync field value changes with signature names if they match
  const handleFieldValueChange = (fieldId: string, newValue: string) => {
    setFields(prev => {
      const updated = prev.map(f => f.id === fieldId ? { ...f, value: newValue } : f);
      
      // Update matching signature if field is Bride, Groom, Party 1, Party 2, or Counselor
      const modifiedField = prev.find(f => f.id === fieldId);
      if (modifiedField) {
        const key = modifiedField.key.toLowerCase();
        const label = modifiedField.label.toLowerCase();

        if (key.includes('bride') || key.includes('party1') || key.includes('spouse1') || label.includes('bride') || label.includes('party 1')) {
          setSignatures(sigs => sigs.map(s => (s.role === 'bride' || s.role === 'party1' || s.id === 'sig_party_1') ? { ...s, name: newValue } : s));
        } else if (key.includes('groom') || key.includes('party2') || key.includes('spouse2') || label.includes('groom') || label.includes('party 2')) {
          setSignatures(sigs => sigs.map(s => (s.role === 'groom' || s.role === 'party2' || s.id === 'sig_party_2') ? { ...s, name: newValue } : s));
        } else if (key.includes('counselor') || key.includes('officiant') || key.includes('pastor') || label.includes('counselor') || label.includes('officiant') || label.includes('pastor')) {
          setSignatures(sigs => sigs.map(s => (s.role === 'counselor' || s.id === 'sig_authority') ? { ...s, name: newValue } : s));
        } else if (key.includes('witness1') || label.includes('witness 1')) {
          setSignatures(sigs => sigs.map(s => (s.id === 'sig_witness1') ? { ...s, name: newValue } : s));
        } else if (key.includes('witness2') || label.includes('witness 2')) {
          setSignatures(sigs => sigs.map(s => (s.id === 'sig_witness2') ? { ...s, name: newValue } : s));
        }
      }
      return updated;
    });
  };

  // Update signature properties directly (name, title, label)
  const handleSignaturePropertyChange = (sigId: string, prop: 'name' | 'title' | 'label', val: string) => {
    setSignatures(prev => prev.map(s => s.id === sigId ? { ...s, [prop]: val } : s));
  };

  // Add custom user-defined field
  const handleAddCustomField = () => {
    const varName = prompt("Enter a variable name for the new field (e.g. 'Witness 2', 'Church City', 'Honorarium'):");
    if (!varName || !varName.trim()) return;

    const trimmed = varName.trim();
    const normalizedKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newPlaceholder = `[${trimmed}]`;

    const newField: ContractField = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: normalizedKey || `field_${Date.now()}`,
      label: trimmed,
      placeholder: newPlaceholder,
      value: '',
      type: 'text',
      category: 'Custom Template Variables',
      isCustom: true,
      orderIndex: fields.length + 1
    };

    setFields(prev => [...prev, newField]);

    if (confirm(`Do you also want to append '${newPlaceholder}' to your contract text now?`)) {
      setRawContent(prev => `${prev}\n\n${trimmed}: ${newPlaceholder}`);
    }
  };

  // Delete custom field
  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  // Handle uploaded contract parsed data and auto-generate fields in left pane in sequential order
  const handleLoadParsedContract = (result: ParseResult) => {
    setDocumentTitle(result.title);
    setRawContent(result.rawText);
    setFields(result.detectedFields);
    setSignatures(result.detectedSignatures);
    
    // Auto-switch to Fields tab on left pane
    setActiveTab('fields');
    setFieldViewMode('template_order'); // Default to sequential template order

    // Show scan notification
    setScanNotification({
      fileName: result.fileName || result.title,
      variableCount: result.detectedFields.length,
      signatureCount: result.detectedSignatures.length
    });
  };

  // Quick re-scan variables from the current rawContent
  const handleRescanVariables = () => {
    const detected = extractFieldsAndSignatures(rawContent, documentTitle);
    
    // Preserve existing field values if keys match
    const mergedFields = detected.fields.map(newField => {
      const existing = fields.find(f => f.key === newField.key || f.label.toLowerCase() === newField.label.toLowerCase());
      if (existing && existing.value) {
        return { ...newField, value: existing.value };
      }
      return newField;
    });

    setFields(mergedFields);
    setSignatures(detected.signatures);
    setScanNotification({
      fileName: 'Current Contract Document',
      variableCount: mergedFields.length,
      signatureCount: detected.signatures.length
    });
  };

  // Direct file upload from left pane
  const handleLeftPaneFileUpload = async (file: File) => {
    try {
      const result = await parseUploadedContractFile(file);
      handleLoadParsedContract(result);
    } catch (err: any) {
      alert(`Error reading template file: ${err.message || 'Please try another file format.'}`);
    }
  };

  // Copy placeholder tag
  const handleCopyTag = (placeholder: string, fieldId: string) => {
    navigator.clipboard.writeText(placeholder);
    setCopiedFieldId(fieldId);
    setTimeout(() => setCopiedFieldId(null), 1500);
  };

  // Handle inserting standard clause into text
  const handleInsertClause = (clause: StandardClause) => {
    setRawContent(prev => {
      return `${prev}\n\n${clause.title.toUpperCase()}\n${clause.content}`;
    });
  };

  // Handle saving signature from modal
  const handleSaveSignature = (updatedSig: ContractSignature) => {
    setSignatures(prev => prev.map(s => s.id === updatedSig.id ? updatedSig : s));
  };

  // Add a custom signature block
  const handleAddCustomSignature = () => {
    const sigTitle = prompt("Enter the title/role for this signature block (e.g. 'Witness 2', 'Elder', 'Guarantor'):");
    if (!sigTitle || !sigTitle.trim()) return;

    const trimmed = sigTitle.trim();
    const newSig: ContractSignature = {
      id: `sig_custom_${Date.now()}`,
      role: 'other',
      label: `${trimmed} Signature`,
      name: '',
      title: trimmed,
      type: 'type'
    };
    setSignatures(prev => [...prev, newSig]);
  };

  // Delete signature block
  const handleDeleteSignature = (sigId: string) => {
    if (confirm("Remove this signature block?")) {
      setSignatures(prev => prev.filter(s => s.id !== sigId));
    }
  };

  // Dynamic print orientation stylesheet application (Portrait = Upright 8.5x11, Landscape = Wide)
  const applyPrintOrientationStyle = useCallback((orientation: 'portrait' | 'landscape') => {
    let styleTag = document.getElementById('print-page-orientation') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'print-page-orientation';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      @media print {
        @page {
          size: letter ${orientation} !important;
          margin: 10mm 10mm 12mm 10mm !important;
        }
      }
    `;
  }, []);

  // Update dynamic print style on mount and when orientation changes
  useEffect(() => {
    document.body.classList.add('contract-mode');
    document.body.classList.remove('certificate-mode');
    applyPrintOrientationStyle(printOrientation);
  }, [printOrientation, applyPrintOrientationStyle]);

  // Print contract / Export to PDF (Upright Portrait by default - No 90 degree rotation required)
  const handlePrint = () => {
    applyPrintOrientationStyle(printOrientation);
    window.print();
  };

  // Download contract text (.txt / Markdown)
  const handleDownloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${documentTitle.replace(/\s+/g, '_')}_Contract.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quick smart autofill with realistic sample values
  const handleAutofillDemo = () => {
    const demoValues: Record<string, string> = {
      bridename: 'Jennifer Allison Taft',
      groomname: 'Clint Patrick Williams',
      counselorname: 'Rev. Dr. Michael Smith',
      counselortitle: 'Senior Pastor & Marital Counselor',
      organizationname: 'Grace Covenant Fellowship',
      churchaddress: '104 Covenant Way, Austin, TX',
      agreementdate: 'October 24, 2026',
      weddingdate: 'November 14, 2026',
      location: 'Grace Fellowship Chapel, Austin, TX',
      jurisdiction: 'Travis County, Texas',
      sessioncount: '8 Sessions (16 In-Depth Hours)',
      curriculum: 'Prepare-Enrich & Covenant Accord',
      fee: '$300.00 Honorarium',
      deposit: '$100.00 Deposit',
      witness1: 'Sarah Jenkins',
      witness2: 'David Miller',
      bridephone: '(555) 234-5678',
      groomphone: '(555) 876-5432',
      brideemail: 'jennifer.taft@example.com',
      groomemail: 'clint.williams@example.com'
    };

    setFields(prev => prev.map(f => {
      const normalizedKey = f.key.toLowerCase();
      let matchedVal = demoValues[normalizedKey];

      if (!matchedVal) {
        // Match by label
        const lowerLabel = f.label.toLowerCase();
        for (const [k, v] of Object.entries(demoValues)) {
          if (lowerLabel.includes(k) || k.includes(lowerLabel)) {
            matchedVal = v;
            break;
          }
        }
      }

      return matchedVal ? { ...f, value: matchedVal } : (f.value ? f : { ...f, value: 'Sample Data' });
    }));

    setSignatures(prev => prev.map(s => {
      if (s.role === 'bride' || s.id === 'sig_party_1') return { ...s, name: 'Jennifer Allison Taft' };
      if (s.role === 'groom' || s.id === 'sig_party_2') return { ...s, name: 'Clint Patrick Williams' };
      if (s.role === 'counselor' || s.id === 'sig_authority') return { ...s, name: 'Rev. Dr. Michael Smith' };
      if (s.id === 'sig_witness1') return { ...s, name: 'Sarah Jenkins' };
      if (s.id === 'sig_witness2') return { ...s, name: 'David Miller' };
      return s;
    }));
  };

  // Clear all fields
  const handleClearAllFields = () => {
    if (confirm("Clear all field values? (Placeholders and variables will remain)")) {
      setFields(prev => prev.map(f => ({ ...f, value: '' })));
      setSignatures(prev => prev.map(s => ({ ...s, name: '', signatureData: undefined })));
    }
  };

  // Save contract to local storage and show feedback
  const handleSaveContract = () => {
    const savedContracts = JSON.parse(localStorage.getItem('covenant_saved_contracts') || '[]');
    const newEntry: ContractDocument = {
      id: `contract_${Date.now()}`,
      title: documentTitle,
      rawContent,
      fields,
      signatures,
      includeSignatures,
      themeId: selectedThemeId,
      sealType: selectedSeal,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    savedContracts.unshift(newEntry);
    localStorage.setItem('covenant_saved_contracts', JSON.stringify(savedContracts));
    
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Filter fields based on search
  const filteredFields = fields.filter(f => 
    f.label.toLowerCase().includes(searchField.toLowerCase()) || 
    f.placeholder.toLowerCase().includes(searchField.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(searchField.toLowerCase()))
  );

  // Sequential order sorted fields
  const orderedFieldsList = [...filteredFields].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  // Group fields by category
  const categories = Array.from(new Set(filteredFields.map(f => f.category || 'General Details')));

  // Count filled vs total
  const filledCount = fields.filter(f => f.value && f.value.trim().length > 0).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900">
      
      {/* Top Application Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToCertificates}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Return to Certificate Generator"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Certificates</span>
            </button>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white shrink-0">
                <FileText size={18} />
              </div>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="bg-transparent hover:bg-slate-800 focus:bg-slate-800 px-2 py-1 rounded text-sm font-bold text-white border-none focus:outline-hidden focus:ring-1 focus:ring-indigo-500 max-w-[180px] sm:max-w-xs md:max-w-md truncate"
                placeholder="Contract Title..."
              />
              {currentDraftId && (
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 shadow-2xs">
                  <Clock size={10} className="text-indigo-400" />
                  <span>Draft Active</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Primary Studio Actions */}
          <div className="flex items-center gap-2">
            {/* Saved Drafts Button */}
            <button
              onClick={() => setShowLoadDraftModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all hover:border-slate-600 cursor-pointer shadow-2xs"
              title="Load or Manage Saved Contract Drafts"
            >
              <FolderOpen size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Saved Drafts</span>
              <span className="sm:hidden">Drafts</span>
              {draftsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] font-black rounded-full leading-none">
                  {draftsCount}
                </span>
              )}
            </button>

            {/* Polish to Industry Standard Button */}
            <button
              onClick={() => setShowPolishModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all hover:shadow cursor-pointer"
              title="Produce a more polished, industry-standard version incorporating all filled variables"
            >
              <Sparkles size={14} className="text-slate-950" />
              <span className="hidden md:inline">Polish to Industry Standard</span>
              <span className="md:hidden">Polish</span>
            </button>

            {/* Upload Template Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:shadow cursor-pointer"
              title="Upload MS-Word, PDF, or Text Template file to scan variables"
            >
              <Upload size={14} />
              <span className="hidden md:inline">Upload Template</span>
              <span className="md:hidden">Upload</span>
            </button>

            {/* Print / Export PDF */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Print to Paper or Save as PDF"
            >
              <Printer size={14} />
              <span className="hidden lg:inline">Print / PDF</span>
            </button>

            {/* Save Contract Draft */}
            <button
              onClick={() => setShowSaveDraftModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:shadow cursor-pointer"
              title="Save Contract Draft (Ctrl+S / Cmd+S)"
            >
              <Save size={14} />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          </div>

        </div>
      </header>

      {/* Polish Success Toast */}
      {polishSuccessToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-500/50 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-amber-300 font-extrabold">Industry Standard Applied!</p>
            <p className="text-slate-300 font-normal text-[11px]">{polishSuccessToast}</p>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          Contract saved successfully to your workspace!
        </div>
      )}

      {/* Main Workspace Layout (Sidebar Controls + Live Printable Preview) */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Control Center Panel */}
        <aside className="w-full lg:w-[460px] bg-white border-r border-slate-200 flex flex-col lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 shadow-lg z-30 no-print">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'fields'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers size={14} />
              <span>Fill Fields ({fields.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText size={14} />
              <span>Edit Clauses</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'style'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Palette size={14} />
              <span>Style & Seal</span>
            </button>

            <button
              onClick={() => setActiveTab('signatures')}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                activeTab === 'signatures'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PenTool size={14} />
              <span>Signatures ({signatures.length})</span>
              {!includeSignatures && (
                <span className="w-2 h-2 rounded-full bg-slate-400" title="Signatures disabled" />
              )}
            </button>
          </div>

          {/* TAB 1: FORM FIELDS & FILLER */}
          {activeTab === 'fields' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* Scan Notification Banner */}
              {scanNotification && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 relative animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => setScanNotification(null)}
                    className="absolute top-2.5 right-2.5 text-emerald-700 hover:text-emerald-950 p-0.5 rounded"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Template Scanned in Sequential Order</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed pr-4">
                    Extracted <strong>{scanNotification.variableCount} dynamic variables</strong> listed in the exact order they appear in "<strong>{scanNotification.fileName}</strong>", plus <strong>{scanNotification.signatureCount} matching party signatures</strong>.
                  </p>
                </div>
              )}

              {/* Quick Template Upload Dropzone right inside the Left Pane */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsLeftPaneDragging(true); }}
                onDragLeave={() => setIsLeftPaneDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsLeftPaneDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLeftPaneFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isLeftPaneDragging
                    ? 'border-indigo-600 bg-indigo-50/70'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20'
                }`}
                onClick={() => leftPaneFileInputRef.current?.click()}
              >
                <input
                  ref={leftPaneFileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt,.md,.rtf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLeftPaneFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                    <Upload size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Drop a Word (.docx), PDF, or Text Template
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Click to browse or drop file to auto-scan and re-generate variables
                </p>
              </div>

              {/* Polish to Industry Standard Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-indigo-600/15 border border-amber-300/70 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900">Industry Standard Polish</h4>
                      <span className="text-[9px] px-1.5 py-0.2 font-bold bg-amber-400 text-slate-950 rounded">AI Legal Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                      Transform filled variables into an executive legal agreement or pastoral covenant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPolishModal(true)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all hover:shadow cursor-pointer"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Polish</span>
                </button>
              </div>

              {/* Progress & Quick Action Toolbar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Variable Fill Progress:
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600">
                      {filledCount}/{fields.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowLoadDraftModal(true)}
                      className="text-[11px] font-semibold text-slate-700 hover:text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      title="Load a saved contract draft"
                    >
                      <FolderOpen size={11} className="text-amber-500" />
                      <span>Drafts</span>
                    </button>
                    <button
                      onClick={handleAutofillDemo}
                      className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      title="Fill all detected variables with sample premarital data"
                    >
                      <Sparkles size={11} /> Auto-Fill Demo
                    </button>
                    <button
                      onClick={handleClearAllFields}
                      className="text-[11px] font-semibold text-slate-600 hover:text-red-700 bg-white px-2 py-0.5 rounded border border-slate-200 transition-all cursor-pointer"
                      title="Clear all variable values"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${fields.length ? (filledCount / fields.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* View Order Toggle (Template Order vs Categories) & Search */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 pl-1.5">Display Order:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFieldViewMode('template_order')}
                      className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all ${
                        fieldViewMode === 'template_order'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="List variables in the exact order they appear in the uploaded template"
                    >
                      <ListOrdered size={12} /> Template Order ({orderedFieldsList.length})
                    </button>
                    <button
                      onClick={() => setFieldViewMode('categories')}
                      className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-all ${
                        fieldViewMode === 'categories'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Group variables by category"
                    >
                      <LayoutGrid size={12} /> Grouped
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      placeholder="Search variables..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                  <button
                    onClick={handleAddCustomField}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                    title="Create a new variable field"
                  >
                    <Plus size={13} /> Add Variable
                  </button>
                  <button
                    onClick={handleRescanVariables}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg shrink-0 transition-colors"
                    title="Re-scan document for new bracket variables"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* LISTING: TEMPLATE ORDER (Sequential Top-to-Bottom as in Template) */}
              {fieldViewMode === 'template_order' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-[11px] text-slate-500 font-semibold">
                    <span>Variables ordered from top to bottom of template</span>
                    <span>{orderedFieldsList.length} total</span>
                  </div>

                  {orderedFieldsList.map((field, index) => {
                    const isFilled = field.value && field.value.trim().length > 0;

                    return (
                      <div
                        key={field.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isFilled
                            ? 'bg-slate-50/70 border-slate-200'
                            : 'bg-white border-amber-200/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10px] flex items-center justify-center font-black shrink-0">
                              #{field.orderIndex || index + 1}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isFilled ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                            <span className="truncate max-w-[170px] sm:max-w-[200px]">{field.label}</span>
                          </label>

                          <div className="flex items-center gap-1">
                            {field.category && (
                              <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded hidden sm:inline">
                                {field.category}
                              </span>
                            )}
                            <button
                              onClick={() => handleCopyTag(field.placeholder, field.id)}
                              className="text-[10px] font-mono text-slate-500 hover:text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 hover:border-indigo-300 transition-colors"
                              title="Click to copy variable tag to clipboard"
                            >
                              {copiedFieldId === field.id ? (
                                <>
                                  <Check size={10} className="text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={9} />
                                  <span className="max-w-[80px] truncate">{field.placeholder}</span>
                                </>
                              )}
                            </button>
                            {field.isCustom && (
                              <button
                                onClick={() => handleDeleteField(field.id)}
                                className="text-slate-400 hover:text-red-600 p-0.5"
                                title="Delete custom variable"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {field.type === 'textarea' ? (
                          <textarea
                            value={field.value}
                            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-y"
                          />
                        ) : (
                          <div className="relative flex items-center">
                            <input
                              type={field.type === 'date' ? 'text' : field.type}
                              value={field.value}
                              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                              placeholder={`e.g. ${field.placeholder}`}
                              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium pr-7"
                            />
                            {field.value && (
                              <button
                                onClick={() => handleFieldValueChange(field.id, '')}
                                className="absolute right-2 text-slate-400 hover:text-slate-600"
                                title="Clear value"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LISTING: CATEGORIZED FIELDS FORM */}
              {fieldViewMode === 'categories' && (
                <div className="space-y-5">
                  {categories.map((category) => {
                    const catFields = filteredFields
                      .filter(f => (f.category || 'General Details') === category)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

                    if (catFields.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                          <span className="text-[11px] font-black tracking-wider uppercase text-slate-500">
                            {category}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                            {catFields.length} {catFields.length === 1 ? 'variable' : 'variables'}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {catFields.map((field) => {
                            const isFilled = field.value && field.value.trim().length > 0;

                            return (
                              <div
                                key={field.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  isFilled
                                    ? 'bg-slate-50/70 border-slate-200'
                                    : 'bg-white border-amber-200/80 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                                      #{field.orderIndex || 0}
                                    </span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                    {field.label}
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleCopyTag(field.placeholder, field.id)}
                                      className="text-[10px] font-mono text-slate-500 hover:text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 hover:border-indigo-300 transition-colors"
                                      title="Click to copy variable tag to clipboard"
                                    >
                                      {copiedFieldId === field.id ? (
                                        <>
                                          <Check size={10} className="text-emerald-600" />
                                          <span className="text-emerald-700">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={9} />
                                          <span>{field.placeholder}</span>
                                        </>
                                      )}
                                    </button>
                                    {field.isCustom && (
                                      <button
                                        onClick={() => handleDeleteField(field.id)}
                                        className="text-slate-400 hover:text-red-600 p-0.5"
                                        title="Delete custom variable"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {field.type === 'textarea' ? (
                                  <textarea
                                    value={field.value}
                                    onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-y"
                                  />
                                ) : (
                                  <div className="relative flex items-center">
                                    <input
                                      type={field.type === 'date' ? 'text' : field.type}
                                      value={field.value}
                                      onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                                      placeholder={`e.g. ${field.placeholder}`}
                                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium pr-7"
                                    />
                                    {field.value && (
                                      <button
                                        onClick={() => handleFieldValueChange(field.id, '')}
                                        className="absolute right-2 text-slate-400 hover:text-slate-600"
                                        title="Clear value"
                                      >
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Polish Action Callout */}
              <div className="pt-2">
                <button
                  onClick={() => setShowPolishModal(true)}
                  className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-lg cursor-pointer group"
                >
                  <Sparkles size={15} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span>Produce Polished Industry Standard Version</span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: EDIT RAW TEXT & CLAUSES */}
          {activeTab === 'text' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">Contract Content & Clauses</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const cleaned = cleanAndFormatContractText(rawContent);
                      setRawContent(cleaned);
                      setPolishSuccessToast("Formatting cleaned and all asterisks removed!");
                      setTimeout(() => setPolishSuccessToast(null), 3000);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Remove all markdown asterisks, format section headings, and clean paragraph breaks"
                  >
                    <Wand2 size={13} className="text-amber-700" />
                    <span>Clean Asterisks & Format</span>
                  </button>
                  <button
                    onClick={() => setShowClauseModal(true)}
                    className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen size={13} /> Clause Library
                  </button>
                </div>
              </div>

              {/* Title Header Check-mark Banner Option */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">"Solemn Agreement & Covenant" Title Banner</p>
                      <p className="text-[10px] text-slate-500">Uncheck to remove this top title badge from the contract header</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer shrink-0 ml-2">
                    <input
                      type="checkbox"
                      checked={showSolemnTitle}
                      onChange={(e) => setShowSolemnTitle(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {showSolemnTitle ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Quick Placeholder Inserts */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Insert Placeholder Variable:</span>
                <div className="flex flex-wrap gap-1">
                  {orderedFieldsList.slice(0, 12).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setRawContent(prev => `${prev} ${f.placeholder}`)}
                      className="px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-700 rounded border border-slate-200 transition-colors"
                    >
                      +{f.placeholder}
                    </button>
                  ))}
                </div>
              </div>

              {/* Raw Textarea */}
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full flex-1 min-h-[350px] text-xs font-mono p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                placeholder="Enter contract clauses, recitals, and terms..."
              />

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <span>{rawContent.split(/\s+/).filter(Boolean).length} words</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    Clean Typography Standard
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Reset contract back to default standard covenant template?")) {
                      setRawContent(defaultSample.content);
                      setDocumentTitle(defaultSample.title);
                      const scanned = extractFieldsAndSignatures(defaultSample.content, defaultSample.title);
                      setFields(scanned.fields);
                      setSignatures(scanned.signatures);
                    }
                  }}
                  className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium"
                >
                  <RotateCcw size={12} /> Reset to Default
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: THEMES & SEALS */}
          {activeTab === 'style' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Themes Selector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Paper & Document Style</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {CONTRACT_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedThemeId === theme.id
                          ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg border shadow-2xs shrink-0"
                          style={{ backgroundColor: theme.paperColor, borderColor: theme.accentColor }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{theme.name}</p>
                          <p className="text-[10px] text-slate-500">{theme.bodyFont === 'font-serif' ? 'Serif Typography' : 'Modern Clean Sans'} • {theme.pageBorder} border</p>
                        </div>
                      </div>
                      {selectedThemeId === theme.id && (
                        <Check size={16} className="text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seal Selector & Upload Card */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg shadow-2xs">
                      <Award size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Official Seal & Medallion</h4>
                      <p className="text-[11px] text-slate-500">Add an official foil medallion or upload church/ministry seal</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowSealModal(true)}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Upload size={12} />
                    <span>{customSealUrl ? 'Manage Seal' : 'Upload / Customize'}</span>
                  </button>
                </div>

                {/* Active Seal Preview Thumbnail */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                      {selectedSeal === 'none' ? (
                        <span className="text-[10px] text-slate-400 font-bold">No Seal</span>
                      ) : (
                        <OfficialSeal
                          sealType={selectedSeal}
                          customSealUrl={customSealUrl}
                          size={44}
                          effect={sealEffect}
                          ribbonColor={ribbonColor}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedSeal === 'custom' 
                          ? 'Custom Uploaded Medallion' 
                          : selectedSeal === 'covenant_gold' ? 'Covenant Gold Foil'
                          : selectedSeal === 'counseling_ribbon' ? 'Ministry Shield & Ribbon'
                          : selectedSeal === 'classic_crest' ? 'Classic Crest Notary'
                          : selectedSeal === 'cross_rings' ? 'Holy Union Rings'
                          : selectedSeal === 'dove_peace' ? 'Dove of Peace'
                          : 'No Seal'}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        Position: {sealPosition.replace('_', ' ')} • {sealSize}px
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSealModal(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>

                {/* Quick Seal Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'covenant_gold', name: 'Gold Foil', icon: '🏆' },
                    { id: 'counseling_ribbon', name: 'Ministry', icon: '🛡️' },
                    { id: 'classic_crest', name: 'Heraldic', icon: '✨' },
                    { id: 'cross_rings', name: 'Sacred Rings', icon: '💍' },
                    { id: 'dove_peace', name: 'Peace Dove', icon: '🕊️' },
                    { id: 'none', name: 'No Seal', icon: '⚪' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSeal(s.id as any);
                        if (s.id === 'counseling_ribbon') setRibbonColor('navy');
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedSeal === s.id
                          ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Orientation & PDF Export Format */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Print & PDF Export Orientation</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {printOrientation === 'portrait' ? 'Upright Portrait (Standard)' : 'Landscape (Wide)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintOrientation('portrait')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      printOrientation === 'portrait'
                        ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3.5 h-5 border-2 border-indigo-600 rounded-xs bg-white"></div>
                      <p className="text-xs font-bold text-slate-900">Portrait (Upright)</p>
                    </div>
                    <p className="text-[10px] text-slate-500">Standard 8.5" × 11" Legal format. Exports upright without rotation.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintOrientation('landscape')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      printOrientation === 'landscape'
                        ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-3.5 border-2 border-slate-600 rounded-xs bg-white"></div>
                      <p className="text-xs font-bold text-slate-900">Landscape</p>
                    </div>
                    <p className="text-[10px] text-slate-500">Wide 11" × 8.5" format for wide comparison tables.</p>
                  </button>
                </div>
              </div>

              {/* Document Display Options */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Preview & Output Options</h4>
                
                {/* Title Checkmark Toggle: Solemn Agreement & Covenant */}
                <label className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-bold text-slate-900">Header Title: "Solemn Agreement & Covenant"</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        showSolemnTitle ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {showSolemnTitle ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Display or hide the "Solemn Agreement & Covenant" header title banner on all contracts and PDF exports</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showSolemnTitle}
                    onChange={(e) => setShowSolemnTitle(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer shrink-0 ml-2"
                  />
                </label>

                {/* Signatures Toggle Option */}
                <label className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Include Bottom Signatures</p>
                    <p className="text-[10px] text-slate-500">Render digital signature lines at bottom of document & print/PDF</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSignatures}
                    onChange={(e) => setIncludeSignatures(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer shrink-0 ml-2"
                  />
                </label>

                {/* Highlight Replaced Fields */}
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Highlight Replaced Fields</p>
                    <p className="text-[10px] text-slate-500">Shows clear highlight for filled and unfilled variables on screen (hidden in print)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highlightPlaceholders}
                    onChange={(e) => setHighlightPlaceholders(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: SIGNATURES */}
          {activeTab === 'signatures' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* PRIMARY ENABLE/DISABLE SIGNATURES CONTROL BUTTON */}
              <div className={`p-4 rounded-xl border transition-all ${
                includeSignatures
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                        Bottom Signatures Block
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        includeSignatures ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {includeSignatures ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {includeSignatures 
                        ? 'Signatures and attestation lines will appear at the bottom of the document and in PDF exports.'
                        : 'Signatures are disabled and will NOT appear at the bottom of this uploaded template.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIncludeSignatures(!includeSignatures)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                      includeSignatures
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {includeSignatures ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    <span>{includeSignatures ? 'Disable' : 'Enable'}</span>
                  </button>
                </div>
              </div>

              {/* Signatures List (Active when enabled or customizable) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold border-b border-slate-200 pb-1">
                  <span>Signatures Configured For This Document</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {signatures.length} party/parties
                  </span>
                </div>

                {!includeSignatures && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>Signatures are currently turned OFF. Enable the switch above to display them on the contract sheet.</span>
                  </div>
                )}

                {signatures.map((sig) => {
                  const hasSig = !!(sig.signatureData || (sig.type === 'type' && sig.name));

                  return (
                    <div
                      key={sig.id}
                      className={`p-3.5 bg-white border rounded-xl space-y-3 shadow-2xs transition-all ${
                        includeSignatures ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          {/* Editable Signature Title & Role */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <input
                              type="text"
                              value={sig.title || sig.label}
                              onChange={(e) => handleSignaturePropertyChange(sig.id, 'title', e.target.value)}
                              className="text-xs font-bold text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-[200px]"
                              placeholder="Party Title (e.g. Bride, Client)..."
                              title="Click to edit the official title/role for this signer"
                            />
                            <span className="text-[10px] text-slate-400">
                              <Edit3 size={10} />
                            </span>
                          </div>

                          {/* Editable Signer Name */}
                          <input
                            type="text"
                            value={sig.name}
                            onChange={(e) => handleSignaturePropertyChange(sig.id, 'name', e.target.value)}
                            placeholder="Signer Full Name..."
                            className="text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                          />
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hasSig ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {hasSig ? 'Signed' : 'Pending'}
                          </span>
                          {sig.id.startsWith('sig_custom_') && (
                            <button
                              onClick={() => handleDeleteSignature(sig.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                              title="Delete this signature block"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Signature Preview Thumbnail */}
                      <div className="h-14 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center p-2">
                        {sig.signatureData ? (
                          <img src={sig.signatureData} alt="Signature" className="max-h-11 object-contain" />
                        ) : sig.name ? (
                          <span className="text-xl text-slate-800" style={{ fontFamily: "'Great Vibes', cursive, serif" }}>
                            {sig.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Click "Sign" to sign</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">
                          {sig.signedDate ? `Signed on ${sig.signedDate}` : 'Not yet signed'}
                        </span>
                        <button
                          onClick={() => setActiveSignature(sig)}
                          className="px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <PenTool size={11} /> {hasSig ? 'Edit Signature' : 'Sign Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddCustomSignature}
                className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Add Additional Signer / Party Block
              </button>
            </div>
          )}

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
            <button
              onClick={handlePrint}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
            >
              <Printer size={15} /> Print / Save Contract PDF
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadText}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
              >
                <FileDown size={13} /> Export .TXT
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
              >
                <Upload size={13} /> Browse Templates
              </button>
            </div>
          </div>

        </aside>

        {/* Right Main Live Printable Document Preview Area */}
        <main className="flex-1 bg-slate-200/80 p-4 sm:p-8 lg:p-12 overflow-y-auto flex flex-col items-center justify-start print:bg-white print:p-0 print:m-0 print:w-full print:h-full">
          
          {/* Top Bar Hint in Web UI */}
          <div className="w-full max-w-[850px] mb-4 flex items-center justify-between text-xs text-slate-600 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">Live Interactive Document View</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPolishModal(true)}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-colors border bg-amber-50 text-slate-950 border-amber-300 hover:bg-amber-100 cursor-pointer shadow-2xs"
                title="Produce a more polished industry standard version"
              >
                <Sparkles size={12} className="text-amber-600" />
                <span>Polish to Industry Standard</span>
              </button>

              <button
                onClick={() => setShowSolemnTitle(!showSolemnTitle)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                  showSolemnTitle
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle 'Solemn Agreement & Covenant' title banner on/off for all contracts"
              >
                <Sparkles size={11} className={showSolemnTitle ? 'text-amber-600' : 'text-slate-400'} />
                <span>Solemn Header: {showSolemnTitle ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowSealModal(true)}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-colors border bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100 cursor-pointer shadow-2xs"
                title="Upload custom official seal or change medallion"
              >
                <Award size={12} className="text-amber-600" />
                <span>Seal: {selectedSeal === 'custom' ? 'Custom' : selectedSeal === 'none' ? 'None' : 'Active'}</span>
              </button>

              <button
                onClick={() => setIncludeSignatures(!includeSignatures)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-colors border ${
                  includeSignatures
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
                title="Toggle bottom signature lines on/off"
              >
                <PenTool size={11} />
                <span>Bottom Signatures: {includeSignatures ? 'ON' : 'OFF'}</span>
              </button>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {includeSignatures ? 'Click any signature line to sign directly' : 'Signatures section hidden'}
              </span>
            </div>
          </div>

          {/* Render Contract Sheet */}
          <ContractPreview
            title={documentTitle}
            rawContent={rawContent}
            fields={fields}
            signatures={signatures}
            includeSignatures={includeSignatures}
            showSolemnTitle={showSolemnTitle}
            themeId={selectedThemeId}
            sealType={selectedSeal}
            customSealUrl={customSealUrl}
            sealPosition={sealPosition}
            sealSize={sealSize}
            sealEffect={sealEffect}
            ribbonColor={ribbonColor}
            highlightPlaceholders={highlightPlaceholders}
            onOpenSignatureModal={(sig) => setActiveSignature(sig)}
            onOpenSealModal={() => setShowSealModal(true)}
          />
        </main>

      </div>

      {/* MODALS */}
      {showUploadModal && (
        <ContractUploadModal
          onLoadParsedContract={handleLoadParsedContract}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {showClauseModal && (
        <ClauseLibraryModal
          onInsertClause={handleInsertClause}
          onClose={() => setShowClauseModal(false)}
        />
      )}

      {showPolishModal && (
        <IndustryPolishModal
          documentTitle={documentTitle}
          rawContent={rawContent}
          fields={fields}
          signatures={signatures}
          includeSignatures={includeSignatures}
          onApplyPolishedVersion={handleApplyPolishedVersion}
          onClose={() => setShowPolishModal(false)}
        />
      )}

      {showSealModal && (
        <SealUploadModal
          currentSealType={selectedSeal}
          currentCustomUrl={customSealUrl}
          currentPosition={sealPosition}
          currentSize={sealSize}
          currentEffect={sealEffect}
          currentRibbonColor={ribbonColor}
          onApplySeal={handleApplySeal}
          onClose={() => setShowSealModal(false)}
        />
      )}

      {activeSignature && (
        <SignatureModal
          signature={activeSignature}
          onSave={handleSaveSignature}
          onClose={() => setActiveSignature(null)}
        />
      )}

      {showSaveDraftModal && (
        <SaveContractModal
          currentDraftId={currentDraftId}
          documentTitle={documentTitle}
          rawContent={rawContent}
          fields={fields}
          signatures={signatures}
          includeSignatures={includeSignatures}
          showSolemnTitle={showSolemnTitle}
          selectedThemeId={selectedThemeId}
          selectedSeal={selectedSeal}
          customSealUrl={customSealUrl}
          sealPosition={sealPosition}
          sealSize={sealSize}
          sealEffect={sealEffect}
          ribbonColor={ribbonColor}
          user={user}
          onSaveSuccess={handleSaveSuccess}
          onClose={() => setShowSaveDraftModal(false)}
        />
      )}

      {showLoadDraftModal && (
        <SavedDraftsModal
          currentDraftId={currentDraftId}
          user={user}
          onLoadDraft={handleLoadDraft}
          onOpenSaveModal={() => setShowSaveDraftModal(true)}
          onLogin={onLogin}
          onClose={() => setShowLoadDraftModal(false)}
        />
      )}

    </div>
  );
};

export default ContractStudio;

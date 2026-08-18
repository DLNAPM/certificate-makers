import React, { useState, useCallback, useEffect } from 'react';
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
  Calendar,
  User,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Search,
  Check,
  FileDown
} from 'lucide-react';
import { ContractField, ContractSignature, ContractDocument, UserProfile, StandardClause } from '../../types';
import { SAMPLE_CONTRACTS, CONTRACT_THEMES } from '../../constants';
import { ParseResult, extractFieldsAndSignatures } from '../../services/documentParser';
import ContractPreview from './ContractPreview';
import ContractUploadModal from './ContractUploadModal';
import SignatureModal from './SignatureModal';
import ClauseLibraryModal from './ClauseLibraryModal';
import { GoogleGenAI } from '@google/genai';

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
  const [selectedThemeId, setSelectedThemeId] = useState('parchment-classic');
  const [selectedSeal, setSelectedSeal] = useState<'covenant_gold' | 'counseling_ribbon' | 'classic_crest' | 'none'>('covenant_gold');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'fields' | 'text' | 'style' | 'signatures'>('fields');
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [activeSignature, setActiveSignature] = useState<ContractSignature | null>(null);
  const [searchField, setSearchField] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Sync field value changes with signature names if they match
  const handleFieldValueChange = (fieldId: string, newValue: string) => {
    setFields(prev => {
      const updated = prev.map(f => f.id === fieldId ? { ...f, value: newValue } : f);
      
      // Update matching signature if field is Bride, Groom, or Counselor
      const modifiedField = prev.find(f => f.id === fieldId);
      if (modifiedField) {
        const key = modifiedField.key.toLowerCase();
        if (key.includes('bride') || key.includes('party1')) {
          setSignatures(sigs => sigs.map(s => s.role === 'bride' ? { ...s, name: newValue } : s));
        } else if (key.includes('groom') || key.includes('party2')) {
          setSignatures(sigs => sigs.map(s => s.role === 'groom' ? { ...s, name: newValue } : s));
        } else if (key.includes('counselor') || key.includes('officiant')) {
          setSignatures(sigs => sigs.map(s => s.role === 'counselor' ? { ...s, name: newValue } : s));
        }
      }
      return updated;
    });
  };

  // Add custom user-defined field
  const handleAddCustomField = () => {
    const varName = prompt("Enter a variable name for the new field (e.g. 'Witness 2', 'Church City'):");
    if (!varName || !varName.trim()) return;

    const trimmed = varName.trim();
    const normalizedKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newPlaceholder = `[${trimmed}]`;

    const newField: ContractField = {
      id: `custom_${Date.now()}`,
      key: normalizedKey || `field_${Date.now()}`,
      label: trimmed,
      placeholder: newPlaceholder,
      value: '',
      type: 'text',
      category: 'Custom Fields',
      isCustom: true
    };

    setFields(prev => [...prev, newField]);

    // Automatically append placeholder to text if user wishes
    if (confirm(`Do you also want to append '${newPlaceholder}' to your contract text now?`)) {
      setRawContent(prev => `${prev}\n\n${trimmed}: ${newPlaceholder}`);
    }
  };

  // Delete custom field
  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  // Handle uploaded contract parsed data
  const handleLoadParsedContract = (result: ParseResult) => {
    setDocumentTitle(result.title);
    setRawContent(result.rawText);
    setFields(result.detectedFields);
    setSignatures(result.detectedSignatures);
    setActiveTab('fields');
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

  // Add a witness signature block
  const handleAddWitnessSignature = () => {
    const witnessCount = signatures.filter(s => s.role === 'witness').length + 1;
    const newWitness: ContractSignature = {
      id: `sig_witness_${Date.now()}`,
      role: 'witness',
      label: `Witness ${witnessCount} Signature`,
      name: '',
      title: `Witness ${witnessCount}`,
      type: 'type'
    };
    setSignatures(prev => [...prev, newWitness]);
  };

  // Print contract
  const handlePrint = () => {
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

  // Quick smart autofill for test/demo
  const handleAutofillDemo = () => {
    const demoValues: Record<string, string> = {
      brideName: 'Jennifer Allison Taft',
      groomName: 'Clint Patrick Williams',
      counselorName: 'Rev. Dr. Michael Smith',
      organizationName: 'Grace Covenant Church',
      churchName: 'Grace Covenant Church',
      agreementDate: 'October 24, 2026',
      location: 'Grace Fellowship Chapel, Austin, TX',
      sessionCount: '8 Sessions (16 In-Depth Hours)',
      fee: '$300.00 Honorarium',
      honorariumFee: '$300.00 Honorarium',
      witness1: 'Sarah Jenkins',
      witness2: 'David Miller'
    };

    setFields(prev => prev.map(f => {
      const match = Object.keys(demoValues).find(k => k.toLowerCase() === f.key.toLowerCase() || f.label.toLowerCase().includes(k.toLowerCase()));
      return match ? { ...f, value: demoValues[match] } : f;
    }));

    setSignatures(prev => prev.map(s => {
      if (s.role === 'bride') return { ...s, name: 'Jennifer Allison Taft' };
      if (s.role === 'groom') return { ...s, name: 'Clint Patrick Williams' };
      if (s.role === 'counselor') return { ...s, name: 'Rev. Dr. Michael Smith' };
      return s;
    }));
  };

  // Save contract to local storage and show feedback
  const handleSaveContract = () => {
    const savedContracts = JSON.parse(localStorage.getItem('covenant_saved_contracts') || '[]');
    const newEntry = {
      id: `contract_${Date.now()}`,
      title: documentTitle,
      rawContent,
      fields,
      signatures,
      themeId: selectedThemeId,
      sealType: selectedSeal,
      savedAt: Date.now()
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

  // Group fields by category
  const categories = Array.from(new Set(filteredFields.map(f => f.category || 'General Details')));

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
                className="bg-transparent hover:bg-slate-800 focus:bg-slate-800 px-2 py-1 rounded text-sm font-bold text-white border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px] sm:max-w-xs md:max-w-md truncate"
                placeholder="Contract Title..."
              />
            </div>
          </div>

          {/* Right: Primary Studio Actions */}
          <div className="flex items-center gap-2">
            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Upload File</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* Print / Export PDF */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Print to Paper or Save as PDF"
            >
              <Printer size={14} />
              <span className="hidden md:inline">Print / PDF</span>
            </button>

            {/* Save Contract */}
            <button
              onClick={handleSaveContract}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Save Contract Draft"
            >
              <Save size={16} />
            </button>
          </div>

        </div>
      </header>

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
        <aside className="w-full lg:w-[440px] bg-white border-r border-slate-200 flex flex-col lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 shadow-lg z-30 no-print">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
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
              className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
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
              className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
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
              className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'signatures'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PenTool size={14} />
              <span>Signatures</span>
            </button>
          </div>

          {/* TAB 1: FORM FIELDS & FILLER */}
          {activeTab === 'fields' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Quick Helper Tools */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" /> Necessary Contract Fields
                  </span>
                  <button
                    onClick={handleAutofillDemo}
                    className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs hover:shadow-xs transition-all"
                  >
                    Quick Auto-Fill Sample
                  </button>
                </div>
                <p className="text-[11px] text-indigo-900/70 leading-relaxed">
                  Fill the fields below. Every change updates the preview and legal clauses automatically in real time.
                </p>
              </div>

              {/* Search & Add Custom Field */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    placeholder="Search fields..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <button
                  onClick={handleAddCustomField}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus size={13} /> Add Variable
                </button>
              </div>

              {/* Categorized Fields Form */}
              <div className="space-y-6">
                {categories.map((category) => {
                  const catFields = filteredFields.filter(f => (f.category || 'General Details') === category);
                  if (catFields.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="text-xs font-black tracking-wider uppercase text-slate-400 border-b border-slate-200 pb-1 flex items-center justify-between">
                        <span>{category}</span>
                        <span className="text-[10px] font-normal lowercase">{catFields.length} field(s)</span>
                      </h4>

                      <div className="space-y-3">
                        {catFields.map((field) => (
                          <div
                            key={field.id}
                            className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition-colors group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                {field.label}
                              </label>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {field.placeholder}
                                </span>
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
                              <input
                                type={field.type === 'date' ? 'text' : field.type}
                                value={field.value}
                                onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                                placeholder={`e.g. ${field.placeholder}`}
                                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: EDIT RAW TEXT & CLAUSES */}
          {activeTab === 'text' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Contract Content & Clauses</span>
                <button
                  onClick={() => setShowClauseModal(true)}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen size={13} /> Clause Library
                </button>
              </div>

              {/* Quick Placeholder Inserts */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Insert Placeholder Variable:</span>
                <div className="flex flex-wrap gap-1">
                  {fields.slice(0, 8).map(f => (
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
                <span>{rawContent.split(/\s+/).filter(Boolean).length} words</span>
                <button
                  onClick={() => {
                    if (confirm("Reset contract back to default standard covenant template?")) {
                      setRawContent(defaultSample.content);
                      setDocumentTitle(defaultSample.title);
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

              {/* Seal Selector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Official Seal / Medallion</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'covenant_gold', name: 'Gold Covenant Seal', icon: '🏆' },
                    { id: 'counseling_ribbon', name: 'Ministry Ribbon', icon: '🛡️' },
                    { id: 'classic_crest', name: 'Legal Standard Crest', icon: '✨' },
                    { id: 'none', name: 'No Seal (Clean)', icon: '⚪' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSeal(s.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSeal === s.id
                          ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-lg block mb-1">{s.icon}</span>
                      <p className="text-xs font-bold text-slate-900">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Display Options */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Preview & Output Options</h4>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Highlight Replaced Fields</p>
                    <p className="text-[10px] text-slate-500">Shows yellow highlight on screen for filled values (auto-hidden in print)</p>
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
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <PenTool size={14} className="text-indigo-600" /> Digital Signatures & Attestations
                </h4>
                <p className="text-[11px] text-slate-500">
                  Draw or type cursive signatures for all covenant parties.
                </p>
              </div>

              <div className="space-y-3">
                {signatures.map((sig) => {
                  const hasSig = !!(sig.signatureData || (sig.type === 'type' && sig.name));

                  return (
                    <div
                      key={sig.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{sig.label}</p>
                          <p className="text-[11px] text-slate-500">{sig.name || 'No name specified'}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasSig ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {hasSig ? 'Signed' : 'Pending'}
                        </span>
                      </div>

                      {/* Signature Preview Thumbnail */}
                      <div className="h-16 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center p-2">
                        {sig.signatureData ? (
                          <img src={sig.signatureData} alt="Signature" className="max-h-12 object-contain" />
                        ) : sig.name ? (
                          <span className="text-2xl text-slate-800" style={{ fontFamily: "'Great Vibes', cursive, serif" }}>
                            {sig.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Click "Sign" to sign</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">
                          {sig.signedDate ? `Signed on ${sig.signedDate}` : 'Not yet signed'}
                        </span>
                        <button
                          onClick={() => setActiveSignature(sig)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <PenTool size={12} /> {hasSig ? 'Edit Signature' : 'Sign Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddWitnessSignature}
                className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Add Witness Signature Block
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
                <Upload size={13} /> Import Another File
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
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Click any signature line to sign directly on the contract
            </span>
          </div>

          {/* Render Contract Sheet */}
          <ContractPreview
            title={documentTitle}
            rawContent={rawContent}
            fields={fields}
            signatures={signatures}
            themeId={selectedThemeId}
            sealType={selectedSeal}
            highlightPlaceholders={highlightPlaceholders}
            onOpenSignatureModal={(sig) => setActiveSignature(sig)}
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

      {activeSignature && (
        <SignatureModal
          signature={activeSignature}
          onSave={handleSaveSignature}
          onClose={() => setActiveSignature(null)}
        />
      )}

    </div>
  );
};

export default ContractStudio;

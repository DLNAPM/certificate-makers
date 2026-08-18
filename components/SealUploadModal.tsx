import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Award, 
  Sparkles, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  Palette, 
  Layout, 
  ShieldCheck, 
  Sliders, 
  HelpCircle,
  Eye
} from 'lucide-react';
import { OfficialSealType, SealPosition, SealEffectStyle, OfficialSealConfig } from '../types';
import OfficialSeal from './OfficialSeal';

interface SealUploadModalProps {
  currentSealType: OfficialSealType;
  currentCustomUrl?: string;
  currentPosition?: SealPosition;
  currentSize?: number;
  currentEffect?: SealEffectStyle;
  currentRibbonColor?: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
  onApplySeal: (config: OfficialSealConfig) => void;
  onClose: () => void;
}

const PRESET_SEALS: {
  type: OfficialSealType;
  name: string;
  description: string;
  defaultRibbon: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
}[] = [
  {
    type: 'covenant_gold',
    name: 'Covenant Gold Medallion',
    description: 'Gold foil scalloped seal for solemn covenant agreements',
    defaultRibbon: 'none'
  },
  {
    type: 'counseling_ribbon',
    name: 'Ministry & Counseling Shield',
    description: 'Royal sapphire and blue ribbon for pastoral certification',
    defaultRibbon: 'navy'
  },
  {
    type: 'classic_crest',
    name: 'Executive Classic Crest',
    description: 'Formal sterling silver heraldic seal for legal accords',
    defaultRibbon: 'none'
  },
  {
    type: 'cross_rings',
    name: 'Holy Union Rings & Cross',
    description: 'Sacred marriage symbol for wedding covenants',
    defaultRibbon: 'gold'
  },
  {
    type: 'dove_peace',
    name: 'Dove of Peace & Blessing',
    description: 'Pastoral olive branch and dove emblem',
    defaultRibbon: 'emerald'
  },
  {
    type: 'none',
    name: 'No Official Seal',
    description: 'Remove seal and leave layout clean',
    defaultRibbon: 'none'
  }
];

const SealUploadModal: React.FC<SealUploadModalProps> = ({
  currentSealType,
  currentCustomUrl,
  currentPosition = 'header_right',
  currentSize = 84,
  currentEffect = 'gold_foil',
  currentRibbonColor = 'none',
  onApplySeal,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<OfficialSealType>(currentSealType);
  const [customSealUrl, setCustomSealUrl] = useState<string>(currentCustomUrl || '');
  const [position, setPosition] = useState<SealPosition>(currentPosition);
  const [size, setSize] = useState<number>(currentSize || 84);
  const [effect, setEffect] = useState<SealEffectStyle>(currentEffect || 'gold_foil');
  const [ribbonColor, setRibbonColor] = useState<'gold' | 'navy' | 'burgundy' | 'emerald' | 'none'>(currentRibbonColor || 'none');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>((currentCustomUrl || currentSealType === 'custom') ? 'upload' : 'presets');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Seal image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomSealUrl(result);
      setSelectedType('custom');
      setActiveTab('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    onApplySeal({
      type: selectedType,
      customUrl: selectedType === 'custom' ? customSealUrl : undefined,
      position,
      size,
      effect,
      ribbonColor
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950 shadow-sm">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">Official Seal & Medallion</h3>
              <p className="text-xs text-slate-400">Upload your church/ministry seal or select an official foil medallion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload size={14} />
            <span>Upload Custom Seal / Logo</span>
            {customSealUrl && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award size={14} />
            <span>Preset Official Seals ({PRESET_SEALS.length - 1})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto bg-white">
          
          {/* Live Preview Box */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center min-w-[100px] min-h-[100px]">
                {selectedType === 'none' ? (
                  <span className="text-xs text-slate-400 font-bold italic">No Seal Selected</span>
                ) : (
                  <OfficialSeal
                    sealType={selectedType}
                    customSealUrl={customSealUrl}
                    size={size}
                    effect={effect}
                    ribbonColor={ribbonColor}
                  />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  Live Preview
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {selectedType === 'custom' 
                    ? 'Custom Uploaded Medallion' 
                    : (PRESET_SEALS.find(p => p.type === selectedType)?.name || 'Official Seal')}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedType === 'none' 
                    ? 'Document will render without an official emblem' 
                    : `Diameter: ${size}px • Position: ${position.replace('_', ' ')} • Effect: ${effect.replace('_', ' ')}`}
                </p>
              </div>
            </div>

            {selectedType !== 'none' && (
              <button
                type="button"
                onClick={() => setSelectedType('none')}
                className="text-xs text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 font-semibold"
              >
                <Trash2 size={13} />
                <span>Remove Seal</span>
              </button>
            )}
          </div>

          {/* TAB 1: UPLOAD CUSTOM SEAL */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-600 bg-indigo-50/60 scale-[0.99]' 
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-slate-200 mb-3">
                  <Upload size={22} />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  {customSealUrl ? 'Click or Drop to Replace Seal Image' : 'Upload Official Seal / Church Crest'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports PNG with transparency, SVG, JPEG, or WebP. Ideal for church logos, ministry medallions, or notary crests.
                </p>
              </div>

              {/* Custom Seal Styling Options */}
              {customSealUrl && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette size={14} className="text-indigo-600" />
                    <span>Seal Frame & Emboss Style</span>
                  </h5>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'gold_foil', label: 'Gold Foil Medallion', desc: 'Embossed gold ring & glare' },
                      { id: 'silver_notary', label: 'Silver Notary', desc: 'Sterling metallic bezel' },
                      { id: 'wax_stamp', label: 'Wax Seal', desc: 'Crimson wax border' },
                      { id: 'original', label: 'Original Graphic', desc: 'Clean transparent PNG' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setEffect(st.id as SealEffectStyle);
                          setSelectedType('custom');
                        }}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          effect === st.id && selectedType === 'custom'
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{st.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{st.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESET OFFICIAL SEALS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_SEALS.map((preset) => {
                  const isSelected = selectedType === preset.type;

                  return (
                    <div
                      key={preset.type}
                      onClick={() => {
                        setSelectedType(preset.type);
                        if (preset.defaultRibbon) {
                          setRibbonColor(preset.defaultRibbon);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                        {preset.type === 'none' ? (
                          <X size={20} className="text-slate-400" />
                        ) : (
                          <OfficialSeal
                            sealType={preset.type}
                            size={48}
                            ribbonColor={preset.defaultRibbon}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{preset.name}</h5>
                          {isSelected && <Check size={14} className="text-indigo-600 shrink-0 ml-1" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{preset.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SHARED CONTROLS: POSITION, SIZE, RIBBON */}
          {selectedType !== 'none' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-600" />
                <span>Placement, Diameter & Ribbon Embellishment</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Position */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as SealPosition)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="header_right">Top Header (Right)</option>
                    <option value="header_left">Top Header (Left)</option>
                    <option value="header_center">Top Header (Center)</option>
                    <option value="bottom_left">Bottom (Beside Signatures)</option>
                    <option value="bottom_center">Bottom (Center Notary)</option>
                    <option value="bottom_right">Bottom (Right)</option>
                    <option value="watermark">Subtle Center Watermark</option>
                  </select>
                </div>

                {/* Diameter / Size */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Diameter: {size}px
                    </label>
                  </div>
                  <input
                    type="range"
                    min={56}
                    max={130}
                    step={2}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Compact (56px)</span>
                    <span>Standard (84px)</span>
                    <span>Large (130px)</span>
                  </div>
                </div>

                {/* Satin Ribbon Tails */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Satin Ribbon Tails
                  </label>
                  <select
                    value={ribbonColor}
                    onChange={(e) => setRibbonColor(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="none">None (Clean Round Medallion)</option>
                    <option value="gold">Gold Silk Ribbon</option>
                    <option value="navy">Royal Navy Ribbon</option>
                    <option value="burgundy">Burgundy Velvet Ribbon</option>
                    <option value="emerald">Emerald Green Ribbon</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Check size={16} />
            <span>Apply Official Seal</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SealUploadModal;

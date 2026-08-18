import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Crown,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { OfficialSealType, SealEffectStyle } from '../types';

export interface OfficialSealProps {
  sealType: OfficialSealType;
  customSealUrl?: string;
  size?: number; // width & height in px
  effect?: SealEffectStyle;
  ribbonColor?: 'gold' | 'navy' | 'burgundy' | 'emerald' | 'none';
  customTitle?: string;
  customSubtitle?: string;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const OfficialSeal: React.FC<OfficialSealProps> = ({
  sealType,
  customSealUrl,
  size = 84,
  effect = 'gold_foil',
  ribbonColor = 'none',
  customTitle,
  customSubtitle,
  className = '',
  interactive = false,
  onClick
}) => {
  if (sealType === 'none') return null;

  // Outer Ribbon Tails Helper
  const renderRibbonTails = () => {
    if (ribbonColor === 'none') return null;

    const tailColorClasses = {
      gold: 'from-amber-600 to-amber-700 text-amber-950',
      navy: 'from-blue-800 to-indigo-950 text-blue-200',
      burgundy: 'from-red-900 to-rose-950 text-rose-200',
      emerald: 'from-emerald-800 to-teal-950 text-emerald-200'
    }[ribbonColor] || 'from-amber-600 to-amber-700';

    return (
      <div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-start justify-center gap-1 pointer-events-none z-0"
        style={{ width: `${size * 0.9}px` }}
      >
        {/* Left Ribbon Tail */}
        <div 
          className={`h-7 w-4 bg-gradient-to-b ${tailColorClasses} shadow-md transform -rotate-12 -skew-y-6 rounded-b-[2px]`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)' }}
        />
        {/* Right Ribbon Tail */}
        <div 
          className={`h-7 w-4 bg-gradient-to-b ${tailColorClasses} shadow-md transform rotate-12 skew-y-6 rounded-b-[2px]`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)' }}
        />
      </div>
    );
  };

  // Custom Uploaded Seal Rendering
  if (sealType === 'custom' && customSealUrl) {
    if (effect === 'gold_foil') {
      return (
        <div 
          onClick={onClick}
          className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          title={customTitle || "Custom Official Seal"}
        >
          {renderRibbonTails()}
          {/* Gold Foil Medallion Frame */}
          <div className="relative z-10 w-full h-full rounded-full border-2 border-amber-600 bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 p-1 shadow-lg flex items-center justify-center overflow-hidden group">
            {/* Scalloped / Ring texture */}
            <div className="w-full h-full rounded-full border border-dashed border-amber-700/80 bg-gradient-to-tr from-amber-100 via-amber-50 to-yellow-200 flex items-center justify-center p-1.5 overflow-hidden">
              <img 
                src={customSealUrl} 
                alt="Official Seal" 
                className="w-full h-full object-contain rounded-full filter drop-shadow-xs"
              />
            </div>
            {/* Glossy Foil Glare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent pointer-events-none rounded-full" />
          </div>
        </div>
      );
    }

    if (effect === 'silver_notary') {
      return (
        <div 
          onClick={onClick}
          className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          title={customTitle || "Custom Official Seal"}
        >
          {renderRibbonTails()}
          <div className="relative z-10 w-full h-full rounded-full border-2 border-slate-400 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 p-1 shadow-lg flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full border border-dashed border-slate-500 bg-gradient-to-tr from-slate-100 via-white to-slate-200 flex items-center justify-center p-1.5 overflow-hidden">
              <img 
                src={customSealUrl} 
                alt="Official Seal" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none rounded-full" />
          </div>
        </div>
      );
    }

    if (effect === 'wax_stamp') {
      return (
        <div 
          onClick={onClick}
          className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          title={customTitle || "Custom Wax Seal"}
        >
          {renderRibbonTails()}
          <div className="relative z-10 w-full h-full rounded-full border-3 border-red-900 bg-gradient-to-br from-red-800 via-rose-900 to-red-950 p-1.5 shadow-xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full border border-dashed border-red-700/60 bg-red-900/90 flex items-center justify-center p-1 overflow-hidden shadow-inner">
              <img 
                src={customSealUrl} 
                alt="Official Seal" 
                className="w-full h-full object-contain rounded-full filter brightness-110 contrast-125"
              />
            </div>
          </div>
        </div>
      );
    }

    // Original clean rendering (transparent PNG / SVG as uploaded)
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        title={customTitle || "Custom Official Seal"}
      >
        {renderRibbonTails()}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <img 
            src={customSealUrl} 
            alt="Official Seal" 
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>
      </div>
    );
  }

  // 1. Covenant Gold Seal
  if (sealType === 'covenant_gold') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {renderRibbonTails()}
        <div className="relative z-10 w-full h-full rounded-full border-2 border-yellow-600 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 flex flex-col items-center justify-center shadow-lg text-amber-900 text-center p-1">
          <div className="w-full h-full rounded-full border border-dashed border-amber-600 flex flex-col items-center justify-center p-0.5">
            <Award size={Math.round(size * 0.28)} className="text-amber-700 shrink-0 mb-0.5" />
            <span 
              className="font-black uppercase tracking-tighter leading-none"
              style={{ fontSize: `${Math.max(6, Math.round(size * 0.08))}px` }}
            >
              {customTitle || 'Covenant'}
            </span>
            <span 
              className="font-bold uppercase tracking-widest text-amber-700 leading-none mt-0.5"
              style={{ fontSize: `${Math.max(5, Math.round(size * 0.065))}px` }}
            >
              {customSubtitle || 'Official Seal'}
            </span>
          </div>
          {/* Glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Counseling / Ministry Ribbon Seal
  if (sealType === 'counseling_ribbon') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {renderRibbonTails()}
        <div className="relative z-10 w-full h-full rounded-full border-2 border-indigo-700 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center shadow-lg text-indigo-900 text-center p-1">
          <div className="w-full h-full rounded-full border border-dashed border-indigo-500 flex flex-col items-center justify-center p-0.5">
            <ShieldCheck size={Math.round(size * 0.28)} className="text-indigo-700 shrink-0 mb-0.5" />
            <span 
              className="font-black uppercase tracking-tighter leading-none"
              style={{ fontSize: `${Math.max(6, Math.round(size * 0.08))}px` }}
            >
              {customTitle || 'Ministry'}
            </span>
            <span 
              className="font-bold uppercase tracking-widest text-indigo-700 leading-none mt-0.5"
              style={{ fontSize: `${Math.max(5, Math.round(size * 0.065))}px` }}
            >
              {customSubtitle || 'Verified'}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none rounded-full" />
        </div>
      </div>
    );
  }

  // 3. Classic Crest Seal
  if (sealType === 'classic_crest') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {renderRibbonTails()}
        <div className="relative z-10 w-full h-full rounded-full border-2 border-slate-700 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex flex-col items-center justify-center shadow-lg text-slate-800 text-center p-1">
          <div className="w-full h-full rounded-full border border-dashed border-slate-400 flex flex-col items-center justify-center p-0.5">
            <Sparkles size={Math.round(size * 0.26)} className="text-slate-700 shrink-0 mb-0.5" />
            <span 
              className="font-black uppercase tracking-tighter leading-none"
              style={{ fontSize: `${Math.max(6, Math.round(size * 0.08))}px` }}
            >
              {customTitle || 'Sacred Accord'}
            </span>
            <span 
              className="font-bold uppercase tracking-widest text-slate-600 leading-none mt-0.5"
              style={{ fontSize: `${Math.max(5, Math.round(size * 0.065))}px` }}
            >
              {customSubtitle || 'Legal Standard'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Intertwined Rings & Cross Emblem
  if (sealType === 'cross_rings') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {renderRibbonTails()}
        <div className="relative z-10 w-full h-full rounded-full border-2 border-amber-700 bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 flex flex-col items-center justify-center shadow-lg text-amber-950 text-center p-1">
          <div className="w-full h-full rounded-full border border-dashed border-amber-600 flex flex-col items-center justify-center p-0.5">
            <div className="flex items-center justify-center -space-x-1 mb-0.5">
              <div className="w-4 h-4 rounded-full border-2 border-amber-700" />
              <div className="w-4 h-4 rounded-full border-2 border-amber-700" />
            </div>
            <span 
              className="font-black uppercase tracking-tighter leading-none"
              style={{ fontSize: `${Math.max(6, Math.round(size * 0.08))}px` }}
            >
              {customTitle || 'Holy Union'}
            </span>
            <span 
              className="font-bold uppercase tracking-widest text-amber-800 leading-none mt-0.5"
              style={{ fontSize: `${Math.max(5, Math.round(size * 0.065))}px` }}
            >
              {customSubtitle || 'Joined In Faith'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Dove of Peace & Pastoral Blessing
  if (sealType === 'dove_peace') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {renderRibbonTails()}
        <div className="relative z-10 w-full h-full rounded-full border-2 border-emerald-700 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex flex-col items-center justify-center shadow-lg text-emerald-950 text-center p-1">
          <div className="w-full h-full rounded-full border border-dashed border-emerald-600 flex flex-col items-center justify-center p-0.5">
            <Crown size={Math.round(size * 0.28)} className="text-emerald-700 shrink-0 mb-0.5" />
            <span 
              className="font-black uppercase tracking-tighter leading-none"
              style={{ fontSize: `${Math.max(6, Math.round(size * 0.08))}px` }}
            >
              {customTitle || 'Pastoral Seal'}
            </span>
            <span 
              className="font-bold uppercase tracking-widest text-emerald-800 leading-none mt-0.5"
              style={{ fontSize: `${Math.max(5, Math.round(size * 0.065))}px` }}
            >
              {customSubtitle || 'Divine Accord'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OfficialSeal;

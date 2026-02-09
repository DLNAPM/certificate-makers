import React from 'react';
import { CertificateData, BackgroundOption, CertificateLayout } from '../types';
import { BACKGROUNDS } from '../constants';
import { Printer, PenTool, Layout, RefreshCw } from 'lucide-react';

interface ControlsProps {
  data: CertificateData;
  onDataChange: (field: keyof CertificateData, value: string) => void;
  layout: CertificateLayout;
  onLayoutChange: (key: keyof CertificateLayout, value: any) => void;
  onResetLayout: () => void;
  selectedBackground: BackgroundOption;
  onBackgroundChange: (bg: BackgroundOption) => void;
  onPrint: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  data,
  onDataChange,
  layout,
  onLayoutChange,
  onResetLayout,
  selectedBackground,
  onBackgroundChange,
  onPrint,
}) => {
  return (
    <div className="w-full lg:w-96 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col shadow-lg no-print z-50">
      
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <PenTool size={20} />
          Certificate Maker
        </h1>
        <p className="text-slate-400 text-sm mt-1">Customize your covenant document</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        
        {/* Form Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 border-b pb-2">Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bride's Name
            </label>
            <input
              type="text"
              value={data.brideName}
              onChange={(e) => onDataChange('brideName', e.target.value)}
              placeholder="e.g. Jennifer A. Taft"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Groom's Name
            </label>
            <input
              type="text"
              value={data.groomName}
              onChange={(e) => onDataChange('groomName', e.target.value)}
              placeholder="e.g. Clint P. Williams"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="text"
              value={data.date}
              onChange={(e) => onDataChange('date', e.target.value)}
              placeholder="e.g. April 4, 2024"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>

        {/* Layout Controls */}
         <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Layout size={16} /> Layout
            </h3>
            <button 
              onClick={onResetLayout}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              title="Reset slogan size and signature positions"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">
              Slogan Size: {layout.sloganSize}px
            </label>
            <input 
              type="range" 
              min="24" 
              max="96" 
              value={layout.sloganSize}
              onChange={(e) => onLayoutChange('sloganSize', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded">
            <strong>Hint:</strong> You can drag and drop the signature lines on the preview to reposition them.
          </div>
        </div>

        {/* Background Selector */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 border-b pb-2">Choose Background</h3>
          <div className="grid grid-cols-2 gap-3">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onBackgroundChange(bg)}
                className={`
                  relative h-20 rounded-lg overflow-hidden border-2 transition-all
                  ${selectedBackground.id === bg.id ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-400'}
                `}
              >
                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 truncate px-1">
                  {bg.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
        <button
          onClick={onPrint}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Printer size={18} />
          Print / Save as PDF
        </button>
        <p className="text-xs text-center text-slate-500">
            Tip: Set layout to 'Landscape' in print settings.
        </p>
      </div>
    </div>
  );
};

export default Controls;

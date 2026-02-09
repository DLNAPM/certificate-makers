import React, { useState } from 'react';
import { CertificateData, BackgroundOption, CertificateLayout } from '../types';
import { Printer, PenTool, Layout, RefreshCw, FilePlus, Sparkles, Mic, MicOff } from 'lucide-react';

interface ControlsProps {
  data: CertificateData;
  onDataChange: (field: keyof CertificateData, value: string) => void;
  layout: CertificateLayout;
  onLayoutChange: (key: keyof CertificateLayout, value: any) => void;
  onResetLayout: () => void;
  selectedBackground: BackgroundOption;
  onBackgroundChange: (bg: BackgroundOption) => void;
  backgroundOptions: BackgroundOption[];
  onCreateNew: () => void;
  onGenerateBackground: (prompt: string) => void;
  isGenerating: boolean;
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
  backgroundOptions,
  onCreateNew,
  onGenerateBackground,
  isGenerating,
  onPrint,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleDictate = () => {
    // @ts-ignore - SpeechRecognition types are not globally available by default
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
       const recognition = new SpeechRecognition();
       recognition.lang = 'en-US';
       recognition.interimResults = false;
       recognition.maxAlternatives = 1;

       recognition.onstart = () => setIsListening(true);
       recognition.onend = () => setIsListening(false);
       recognition.onerror = () => setIsListening(false);
       
       recognition.onresult = (event: any) => {
         const transcript = event.results[0][0].transcript;
         setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
       };
       
       recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
    }
  };

  return (
    <div className="w-full lg:w-96 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col shadow-lg no-print z-50">
      
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PenTool size={20} />
            Certificate Maker
          </h1>
          <p className="text-slate-400 text-sm mt-1">Customize your covenant document</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-white transition-colors"
          title="Create New (Reset)"
        >
          <FilePlus size={18} />
        </button>
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
              Counselor's Name
            </label>
            <input
              type="text"
              value={data.counselorName}
              onChange={(e) => onDataChange('counselorName', e.target.value)}
              placeholder="e.g. Rev. Michael Smith"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slogan / Bible Verse
            </label>
            <textarea
              value={data.slogan}
              onChange={(e) => onDataChange('slogan', e.target.value)}
              placeholder="Enter a slogan or Bible verse"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 h-24 resize-y text-sm"
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
              title="Reset layout settings"
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

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">
              Signature Width: {layout.signatureWidth}px
            </label>
            <input 
              type="range" 
              min="150" 
              max="400" 
              value={layout.signatureWidth}
              onChange={(e) => onLayoutChange('signatureWidth', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>

        {/* AI Background Generator */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
           <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
             <Sparkles size={16} className="text-indigo-600"/> AI Background Designer
           </h3>
           <div className="relative">
             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Describe your perfect background..."
               className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 pr-10"
             />
             <button 
               onClick={handleDictate}
               className={`absolute right-2 bottom-2 p-1.5 rounded-full transition-colors ${
                 isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
               }`}
               title="Dictate description"
             >
               {isListening ? <MicOff size={14} /> : <Mic size={14} />}
             </button>
           </div>
           <button
             onClick={() => onGenerateBackground(prompt)}
             disabled={isGenerating || !prompt.trim()}
             className={`
               w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
               ${isGenerating || !prompt.trim() 
                 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                 : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
               }
             `}
           >
             {isGenerating ? (
               <><RefreshCw className="animate-spin" size={14} /> Generating...</>
             ) : (
               'Generate Background'
             )}
           </button>
        </div>

        {/* Background Selector */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 border-b pb-2">Choose Background</h3>
          <div className="grid grid-cols-2 gap-3">
            {backgroundOptions.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onBackgroundChange(bg)}
                className={`
                  relative h-20 rounded-lg overflow-hidden border-2 transition-all group
                  ${selectedBackground.id === bg.id ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-400'}
                `}
              >
                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 truncate px-1">
                  {bg.name}
                </div>
                {bg.id.startsWith('generated-') && (
                   <div className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] px-1 rounded shadow-sm">AI</div>
                )}
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
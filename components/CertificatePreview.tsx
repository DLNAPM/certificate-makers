import React, { useRef, useState, useEffect } from 'react';
import { CertificateData, BackgroundOption, CertificateLayout, Position } from '../types';

interface CertificatePreviewProps {
  data: CertificateData;
  layout: CertificateLayout;
  onLayoutChange: (key: keyof CertificateLayout, value: any) => void;
  background: BackgroundOption;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  data,
  layout,
  onLayoutChange,
  background,
}) => {
  // State to track which element is being dragged
  const [dragging, setDragging] = useState<keyof CertificateLayout | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Handlers for Drag and Drop
  const handleMouseDown = (e: React.MouseEvent, key: keyof CertificateLayout) => {
    e.preventDefault();
    const currentPos = layout[key] as Position;
    setDragging(key);
    // Calculate the offset from the mouse position to the element's top-left
    setOffset({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      
      // Update the specific position in the layout
      onLayoutChange(dragging, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Attach global mouse listeners when dragging
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset]);

  // Render a Draggable Signature Block
  const renderSignatureBlock = (
    label: string, 
    positionKey: 'brideSigPos' | 'groomSigPos' | 'counselorSigPos'
  ) => {
    const pos = layout[positionKey];
    
    return (
      <div 
        className="absolute cursor-move group"
        style={{ left: pos.x, top: pos.y, width: '200px' }}
        onMouseDown={(e) => handleMouseDown(e, positionKey)}
      >
        <div className={`
          flex flex-col items-center gap-2 
          p-2 border border-transparent 
          hover:border-dashed hover:border-slate-400 hover:bg-white/20 rounded
          transition-colors duration-200
          print:border-none print:p-0
        `}>
          <div className={`w-full h-px ${background.accentColor}`}></div>
          <p className="text-sm font-bold uppercase tracking-widest select-none" style={{ fontFamily: 'Cinzel, serif' }}>
            {label}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto flex justify-center py-8 bg-gray-200 print:p-0 print:bg-white">
      <div
        className={`
          print-area
          relative 
          w-[1056px] h-[816px] 
          shrink-0 
          shadow-2xl print:shadow-none 
          bg-white
          overflow-hidden
          flex items-center justify-center
        `}
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={background.url}
            alt="Certificate Background"
            className="w-full h-full object-cover opacity-60 print:opacity-60"
          />
          <div className="absolute inset-0 bg-white/20 print:bg-white/20 backdrop-blur-[1px]"></div>
        </div>

        {/* Border Layer */}
        <div className={`absolute inset-4 z-10 border-4 border-double ${background.borderColor} pointer-events-none`}>
          <div className={`absolute inset-1 border border-solid ${background.borderColor} opacity-50`}></div>
        </div>

        {/* Content Layer */}
        <div className={`relative z-20 w-full h-full flex flex-col items-center py-16 px-12 text-center ${background.textColor}`}>
          
          {/* Header Section */}
          <div className="space-y-4 mb-8">
            <div className="mb-2 opacity-80">
                <svg width="200" height="20" viewBox="0 0 200 20" className={`fill-current mx-auto ${background.textColor}`}>
                    <path d="M100 15 C 60 15, 40 5, 0 10 L 0 12 C 40 7, 60 17, 100 17 C 140 17, 160 7, 200 12 L 200 10 C 160 5, 140 15, 100 15 Z" />
                </svg>
            </div>

            <h1 className="text-6xl tracking-wide" style={{ fontFamily: 'UnifrakturMaguntia, cursive' }}>
              Before God
            </h1>
          </div>

          {/* Names Section */}
          <div className="flex flex-col items-center w-full space-y-6">
            <div className="flex flex-wrap justify-center items-baseline gap-4 w-full px-8">
              <span 
                className="text-6xl min-w-[200px] border-b border-dotted border-current pb-2 px-4"
                style={{ fontFamily: 'Great Vibes, cursive' }}
              >
                {data.brideName || 'Bride Name'}
              </span>
              <span className="text-4xl px-2" style={{ fontFamily: 'Cinzel, serif' }}>&</span>
              <span 
                className="text-6xl min-w-[200px] border-b border-dotted border-current pb-2 px-4"
                style={{ fontFamily: 'Great Vibes, cursive' }}
              >
                {data.groomName || 'Groom Name'}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-semibold uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                Are Granted This
              </h2>
              <h2 className="text-5xl" style={{ fontFamily: 'UnifrakturMaguntia, cursive' }}>
                Certificate of Pre-Marital Counseling
              </h2>
            </div>

            <div className="mt-6 text-2xl" style={{ fontFamily: 'Cinzel, serif' }}>
              On this day, <span className="font-bold border-b border-current px-2">{data.date || 'Month Day, Year'}</span>
            </div>
          </div>

          {/* Slogan */}
          <div className="w-full max-w-4xl mx-auto mt-12 mb-4">
            <p 
              className="italic leading-relaxed opacity-90 transition-all duration-200" 
              style={{ 
                fontFamily: 'Great Vibes, cursive',
                fontSize: `${layout.sloganSize}px`
              }}
            >
              "Let no one split apart what God has joined together."
            </p>
          </div>

          {/* Signatures Section (Absolute Positioning Layer) */}
          <div className="absolute inset-0 pointer-events-none">
             {/* We re-enable pointer events on the items themselves */}
             <div className="w-full h-full relative pointer-events-auto">
                {renderSignatureBlock('Signature of Bride-to-Be', 'brideSigPos')}
                {renderSignatureBlock('Pre-Marital Counselor', 'counselorSigPos')}
                {renderSignatureBlock('Signature of Groom-to-Be', 'groomSigPos')}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;

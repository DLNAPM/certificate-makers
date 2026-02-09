import React, { useState, useCallback } from 'react';
import Controls from './components/Controls';
import CertificatePreview from './components/CertificatePreview';
import { CertificateData, BackgroundOption, CertificateLayout } from './types';
import { BACKGROUNDS } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<CertificateData>({
    brideName: '',
    groomName: '',
    date: '',
  });

  // Default positions optimized for the 1056x816 container
  const [layout, setLayout] = useState<CertificateLayout>({
    sloganSize: 48, // approx text-5xl
    brideSigPos: { x: 100, y: 650 },
    groomSigPos: { x: 750, y: 650 },
    counselorSigPos: { x: 428, y: 650 },
  });

  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(BACKGROUNDS[0]);

  const handleDataChange = useCallback((field: keyof CertificateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLayoutChange = useCallback((key: keyof CertificateLayout, value: any) => {
    setLayout((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetLayout = useCallback(() => {
     setLayout({
      sloganSize: 48,
      brideSigPos: { x: 100, y: 650 },
      groomSigPos: { x: 750, y: 650 },
      counselorSigPos: { x: 428, y: 650 },
    });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Controls Sidebar - Hidden when printing */}
      <div className="flex-none lg:h-screen lg:sticky lg:top-0">
        <Controls
          data={data}
          onDataChange={handleDataChange}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          onResetLayout={handleResetLayout}
          selectedBackground={selectedBackground}
          onBackgroundChange={setSelectedBackground}
          onPrint={handlePrint}
        />
      </div>

      {/* Main Preview Area */}
      <main className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto print:bg-white print:block print:w-full print:h-full">
        <div className="p-4 lg:p-12 w-full flex justify-center print:p-0">
          <CertificatePreview
            data={data}
            layout={layout}
            onLayoutChange={handleLayoutChange}
            background={selectedBackground}
          />
        </div>
      </main>
    </div>
  );
};

export default App;

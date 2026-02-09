import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
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
    signatureWidth: 250,
    brideSigPos: { x: 100, y: 650 },
    groomSigPos: { x: 750, y: 650 },
    counselorSigPos: { x: 428, y: 650 },
  });

  const [backgroundOptions, setBackgroundOptions] = useState<BackgroundOption[]>(BACKGROUNDS);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(BACKGROUNDS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDataChange = useCallback((field: keyof CertificateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLayoutChange = useCallback((key: keyof CertificateLayout, value: any) => {
    setLayout((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetLayout = useCallback(() => {
     setLayout({
      sloganSize: 48,
      signatureWidth: 250,
      brideSigPos: { x: 100, y: 650 },
      groomSigPos: { x: 750, y: 650 },
      counselorSigPos: { x: 428, y: 650 },
    });
  }, []);

  const handleCreateNew = useCallback(() => {
    if (window.confirm("Are you sure you want to create a new certificate? This will clear your current progress.")) {
      setData({ brideName: '', groomName: '', date: '' });
      handleResetLayout();
      setSelectedBackground(BACKGROUNDS[0]);
    }
  }, [handleResetLayout]);

  const handleGenerateBackground = async (prompt: string) => {
    if (!process.env.API_KEY) {
      alert("API Key is missing/invalid.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A soft, elegant, high-quality background texture for a wedding certificate, with no text. ${prompt}` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "4:3",
          }
        }
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        const newBg: BackgroundOption = {
          id: `generated-${Date.now()}`,
          name: 'AI Generated',
          url: imageUrl,
          textColor: 'text-slate-900', // Default assumption
          borderColor: 'border-slate-800',
          accentColor: 'bg-slate-800'
        };
        // Add new background to top of list
        setBackgroundOptions(prev => [newBg, ...prev]);
        setSelectedBackground(newBg);
      } else {
        alert("The AI could not generate an image at this time. Please try a different description.");
      }
    } catch (error) {
      console.error("Background generation error:", error);
      alert("Failed to generate background. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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
          backgroundOptions={backgroundOptions}
          onCreateNew={handleCreateNew}
          onGenerateBackground={handleGenerateBackground}
          isGenerating={isGenerating}
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
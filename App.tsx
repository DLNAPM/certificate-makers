import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Controls from './components/Controls';
import CertificatePreview from './components/CertificatePreview';
import SaveTemplateModal from './components/SaveTemplateModal';
import TemplateGallery from './components/TemplateGallery';
import LandingPage from './components/LandingPage';
import ContractStudio from './components/ContractStudio/ContractStudio';
import { CertificateData, BackgroundOption, CertificateLayout, UserProfile, SavedTemplate } from './types';
import { BACKGROUNDS } from './constants';
import { loginWithGoogle, logoutUser, subscribeToAuth, saveTemplate } from './services/firebase';
import { Award, FileText, ArrowLeft, PenTool, Sparkles, HelpCircle } from 'lucide-react';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [appMode, setAppMode] = useState<'certificates' | 'contracts'>('certificates');
  const [showHelp, setShowHelp] = useState(false);
  
  const [data, setData] = useState<CertificateData>({
    brideName: '',
    groomName: '',
    counselorName: '',
    date: '',
    slogan: '"Let no one split apart what God has joined together."',
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
  
  // Auth & Template State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
      setData({ 
        brideName: '', 
        groomName: '', 
        counselorName: '',
        date: '',
        slogan: '"Let no one split apart what God has joined together."'
      });
      handleResetLayout();
      setSelectedBackground(BACKGROUNDS[0]);
    }
  }, [handleResetLayout]);

  const handleGenerateBackground = async (prompt: string) => {
    let apiKey = '';
    
    try {
      if (process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {}

    if (!apiKey) {
      try {
        // @ts-ignore
        if (import.meta.env?.VITE_API_KEY) {
           // @ts-ignore
           apiKey = import.meta.env.VITE_API_KEY;
        }
      } catch (e) {}
    }

    if (!apiKey) {
      alert("API Key is missing. Please check your configuration.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
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
          textColor: 'text-slate-900',
          borderColor: 'border-slate-800',
          accentColor: 'bg-slate-800'
        };
        setBackgroundOptions(prev => [newBg, ...prev]);
        setSelectedBackground(newBg);
      } else {
        alert("The AI could not generate an image at this time.");
      }
    } catch (error) {
      console.error("Background generation error:", error);
      alert("Failed to generate background.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert("Login failed. Please check your internet connection.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setShowLanding(true);
  };

  const handleSaveTemplateAction = async (name: string, isPublic: boolean, sharedWith: string[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await saveTemplate({
        name,
        data,
        layout,
        background: selectedBackground,
        createdBy: user.uid,
        creatorName: user.displayName || 'Anonymous',
        createdAt: Date.now(),
        isPublic,
        sharedWith
      });
      setShowSaveModal(false);
      alert("Template saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save template. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    setData(template.data);
    setLayout(template.layout);
    
    // Check if background exists in options, if not add it
    const existingBg = backgroundOptions.find(b => b.url === template.background.url);
    if (existingBg) {
      setSelectedBackground(existingBg);
    } else {
      setBackgroundOptions(prev => [template.background, ...prev]);
      setSelectedBackground(template.background);
    }
    
    setShowGallery(false);
    setShowLanding(false); // Ensure we are in the editor view
    setAppMode('certificates');
  };

  if (showLanding) {
    return (
      <LandingPage 
        onGetStarted={() => {
          setAppMode('certificates');
          setShowLanding(false);
        }}
        onOpenContracts={() => {
          setAppMode('contracts');
          setShowLanding(false);
        }}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    );
  }

  // Contract Studio Mode
  if (appMode === 'contracts') {
    return (
      <ContractStudio
        user={user}
        onBackToCertificates={() => setAppMode('certificates')}
        onLogin={handleLogin}
      />
    );
  }

  // Certificate Maker Mode
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-indigo-100">
      
      {/* Top Workspace Header & Studio Switcher */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 h-14 flex items-center justify-between border-b border-slate-800 no-print z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLanding(true)}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={16} /> Home
          </button>
          
          <div className="h-5 w-px bg-slate-700" />
          
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-md text-white">
              <PenTool size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">Covenant Studio</span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setAppMode('certificates')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              appMode === 'certificates'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={14} /> Certificate Maker
          </button>

          <button
            onClick={() => setAppMode('contracts')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              appMode === 'contracts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} /> Contract Studio (Upload Word/PDF)
          </button>
        </div>

        {/* Help button */}
        <button
          onClick={() => setShowHelp(true)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Help & Guides"
        >
          <HelpCircle size={18} />
        </button>
      </header>

      {/* Main Certificate Studio View */}
      <div className="flex-1 flex flex-col lg:flex-row animate-in fade-in duration-300">
        {/* Controls Sidebar */}
        <div className="flex-none lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14">
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
            onSwitchToContracts={() => setAppMode('contracts')}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSaveTemplate={() => setShowSaveModal(true)}
            onOpenGallery={() => setShowGallery(true)}
          />
        </div>

        {/* Main Preview Area */}
        <main className="flex-1 bg-gray-200/70 flex items-center justify-center overflow-auto print:bg-white print:block print:w-full print:h-full p-4 lg:p-10">
          <div className="w-full flex justify-center print:p-0">
            <CertificatePreview
              data={data}
              layout={layout}
              onLayoutChange={handleLayoutChange}
              background={selectedBackground}
            />
          </div>
        </main>
        
        {/* Modals */}
        {showSaveModal && (
          <SaveTemplateModal
            onSave={handleSaveTemplateAction}
            onClose={() => setShowSaveModal(false)}
            isSaving={isSaving}
          />
        )}
        
        {showGallery && (
          <TemplateGallery
            user={user}
            onLoadTemplate={handleLoadTemplate}
            onClose={() => setShowGallery(false)}
          />
        )}

        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </div>
    </div>
  );
};

export default App;

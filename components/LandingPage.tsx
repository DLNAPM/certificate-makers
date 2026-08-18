import React, { useState } from 'react';
import { PenTool, Sparkles, ArrowRight, Layout, Palette, Cloud, CheckCircle2, HelpCircle, LogIn, LogOut, User, FileText, Upload, ShieldCheck, Check } from 'lucide-react';
import { UserProfile } from '../types';
import HelpModal from './HelpModal';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenContracts: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenContracts,
  user,
  onLogin,
  onLogout
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
               <PenTool size={20} />
            </div>
            <span className="hidden sm:inline">Covenant Studio</span>
          </div>

          <div className="flex items-center gap-3">
             <button
               onClick={() => setShowHelp(true)}
               className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
               title="What is this?"
             >
               <HelpCircle size={20} />
             </button>

             <div className="h-6 w-px bg-slate-200 mx-1"></div>

             {user ? (
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex flex-col items-end mr-1">
                      <span className="text-xs text-slate-500 font-medium">Welcome back</span>
                      <span className="text-xs font-bold text-slate-900 max-w-[100px] truncate">{user.displayName}</span>
                   </div>
                   {user.photoURL ? (
                     <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-200" alt="Profile"/>
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                       <User size={14} />
                     </div>
                   )}
                   <button 
                     onClick={onLogout}
                     className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                     title="Logout"
                   >
                     <LogOut size={18} />
                   </button>
                   <button
                    onClick={onGetStarted}
                    className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all hover:shadow-lg"
                  >
                    Open Studio
                  </button>
                </div>
             ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={onLogin}
                    className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2"
                  >
                    <LogIn size={16} /> Sign In
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Launch App
                  </button>
                </div>
             )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-6 border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={13} />
            <span>Certificates & Upload-Ready Contract Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Premarital Certificates <br/>
            <span className="text-indigo-600">& Covenant Contracts</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Design keepsake counseling certificates with AI backgrounds, or upload sample contracts in <strong>Word (.docx)</strong>, <strong>PDF</strong>, or <strong>Text</strong> to auto-fill necessary fields and sign digitally.
          </p>

          {/* Dual Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            
            {/* Card 1: Certificate Maker */}
            <div
              onClick={onGetStarted}
              className="p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PenTool size={24} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Certificate Studio
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    Visual Art
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Generate landscape certificates with draggable signatures, custom slogans, and AI-generated sacred textures.
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-indigo-600 gap-1.5 pt-2 border-t border-slate-100 group-hover:translate-x-1 transition-transform">
                <span>Open Certificate Maker</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Contract Studio */}
            <div
              onClick={onOpenContracts}
              className="p-6 bg-white rounded-2xl border-2 border-indigo-600 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                New Feature
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FileText size={24} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Upload & Fill Contract
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Upload any sample contract (.docx, .pdf, .txt). Auto-extract party names, dates, counseling hours, fill fields, and sign digitally.
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-indigo-600 gap-1.5 pt-2 border-t border-slate-100 group-hover:translate-x-1 transition-transform">
                <span>Launch Contract Studio</span>
                <ArrowRight size={14} />
              </div>
            </div>

          </div>

        </div>

        {/* Abstract Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '10s' }}></div>
        </div>
      </header>

      {/* Feature Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Complete Suite for Ministers & Couples</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
              Everything needed to execute sacred agreements, counseling completion accords, and lasting keepsakes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <Upload size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Word & PDF Contract Import</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Drag and drop your existing church or counseling agreements. Our engine parses the document structure and generates interactive fillable fields.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center gap-2"><Check size={14} className="text-indigo-600" /> MS-Word (.docx) & PDF extraction</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-indigo-600" /> Auto-detected placeholders & blanks</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <PenTool size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Digital Signature Ceremony</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Execute documents with authentic digital signatures. Parties can draw signatures or apply certified cursive attestations stamped onto the PDF.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center gap-2"><Check size={14} className="text-indigo-600" /> Touch & mouse drawing canvas</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-indigo-600" /> Multi-party signers & witnesses</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Covenant Clause Library</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Access curated pre-written covenant clauses covering marital fidelity, counseling commitments, conflict resolution, and financial unity.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center gap-2"><Check size={14} className="text-indigo-600" /> 1-Click clause insertion</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-indigo-600" /> Official Gold Seals & Medallions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-4 md:mb-0">
             <PenTool size={16} className="text-indigo-600" /> Covenant Studio • Certificates & Agreements
          </div>
          <p>&copy; {new Date().getFullYear()} All rights reserved. Confidential and secure client-side document processing.</p>
        </div>
      </footer>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default LandingPage;

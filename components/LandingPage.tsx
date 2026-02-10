import React, { useState } from 'react';
import { PenTool, Sparkles, ArrowRight, Layout, Palette, Cloud, CheckCircle2, HelpCircle, LogIn, LogOut, User } from 'lucide-react';
import { UserProfile } from '../types';
import HelpModal from './HelpModal';

interface LandingPageProps {
  onGetStarted: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, user, onLogin, onLogout }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
               <PenTool size={20} />
            </div>
            <span className="hidden sm:inline">Certificate Maker</span>
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
                    Open Editor
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
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={12} />
            <span>Now with Gemini AI Backgrounds</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Create Beautiful <br/>
            <span className="text-indigo-600">Covenant Certificates</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Design elegant, professional premarital counseling certificates in minutes.
            Customize layouts, choose from premium textures, or generate unique art with AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Designing Now <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle size={20} /> How it Works
            </button>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '10s' }}></div>
        </div>
      </header>

      {/* Feature Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Professional tools designed for counselors, officiants, and couples to create lasting memories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1: Customization */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layout size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Drag & Drop Layouts</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Full control over your certificate. Drag signature lines, adjust typography sizes, and modify positions to fit any background perfectly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" /> Movable signatures
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" /> Custom slogans
                </li>
              </ul>
            </div>

            {/* Feature 2: AI & Art */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Palette size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Design</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Can't find the perfect look? Use our integrated Gemini AI to generate unique, high-quality background textures tailored to your theme.
              </p>
               <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" /> Text-to-Image generation
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" /> Premium preset library
                </li>
              </ul>
            </div>

            {/* Feature 3: Sharing */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Cloud size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Save & Share</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Securely save your designs to the cloud. Share templates with specific people via email or contribute to the community gallery.
              </p>
               <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" /> Google Sign-in
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" /> Private sharing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-700 mb-4 md:mb-0">
             <PenTool size={16} /> Certificate Maker
          </div>
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default LandingPage;
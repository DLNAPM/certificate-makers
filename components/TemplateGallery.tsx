import React, { useEffect, useState } from 'react';
import { X, Search, User, Globe, Loader2, Download } from 'lucide-react';
import { SavedTemplate, UserProfile } from '../types';
import { fetchTemplates } from '../services/firebase';

interface TemplateGalleryProps {
  user: UserProfile | null;
  onLoadTemplate: (template: SavedTemplate) => void;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ user, onLoadTemplate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [activeTab, user]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'mine' && user) {
        const data = await fetchTemplates(false, user.uid);
        setTemplates(data);
      } else {
        const data = await fetchTemplates(true);
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load templates. Make sure Firebase is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Template Gallery</h2>
            <p className="text-slate-500 text-sm">Choose a design to start with</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab('community')}
            className={`py-4 px-6 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'community' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe size={18} /> Community
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('mine')}
              className={`py-4 px-6 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'mine' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User size={18} /> My Templates
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p>Loading designs...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-500">
              <p>{error}</p>
              <button onClick={loadTemplates} className="mt-4 text-indigo-600 hover:underline">Try Again</button>
            </div>
          ) : templates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>No templates found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group border border-slate-200 flex flex-col"
                >
                  <div className="relative h-48 bg-slate-200 overflow-hidden">
                    <img 
                      src={template.background.url} 
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <button
                         onClick={() => onLoadTemplate(template)}
                         className="w-full bg-white text-slate-900 py-2 rounded font-semibold flex items-center justify-center gap-2 shadow-lg"
                       >
                         <Download size={16} /> Load Design
                       </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 truncate">{template.name}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {template.creatorName}
                      </span>
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
import React, { useState } from 'react';
import { X, Save, Share2, Lock } from 'lucide-react';

interface SaveTemplateModalProps {
  onSave: (name: string, isPublic: boolean) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ onSave, onClose, isSaving }) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name, isPublic);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Save Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Floral Wedding"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
             <label className="flex items-center gap-3 cursor-pointer">
               <input 
                 type="radio" 
                 checked={isPublic} 
                 onChange={() => setIsPublic(true)}
                 className="w-4 h-4 text-indigo-600"
               />
               <div className="flex-1">
                 <div className="flex items-center gap-2 font-medium text-slate-800">
                   <Share2 size={16} /> Public (Shared)
                 </div>
                 <p className="text-xs text-slate-500">Visible to all users in the community gallery.</p>
               </div>
             </label>

             <label className="flex items-center gap-3 cursor-pointer">
               <input 
                 type="radio" 
                 checked={!isPublic} 
                 onChange={() => setIsPublic(false)}
                 className="w-4 h-4 text-indigo-600"
               />
               <div className="flex-1">
                 <div className="flex items-center gap-2 font-medium text-slate-800">
                   <Lock size={16} /> Private
                 </div>
                 <p className="text-xs text-slate-500">Only visible to you.</p>
               </div>
             </label>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSaving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <Save size={18} /> Save Template
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
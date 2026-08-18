import React, { useState } from 'react';
import { X, Plus, BookOpen, Check, Search, ShieldCheck } from 'lucide-react';
import { STANDARD_CLAUSES } from '../../constants';
import { StandardClause } from '../../types';

interface ClauseLibraryModalProps {
  onInsertClause: (clause: StandardClause) => void;
  onClose: () => void;
}

const ClauseLibraryModal: React.FC<ClauseLibraryModalProps> = ({ onInsertClause, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [insertedIds, setInsertedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Clauses' },
    { id: 'covenant', label: 'Covenant & Faith' },
    { id: 'counseling', label: 'Counseling & Growth' },
    { id: 'fidelity', label: 'Fidelity & Unity' },
    { id: 'financial', label: 'Financial Stewardship' },
    { id: 'resolution', label: 'Conflict Resolution' },
  ];

  const filtered = STANDARD_CLAUSES.filter(clause => {
    const matchesCat = selectedCategory === 'all' || clause.category === selectedCategory;
    const matchesSearch = clause.title.toLowerCase().includes(search.toLowerCase()) || 
                          clause.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleInsert = (clause: StandardClause) => {
    onInsertClause(clause);
    setInsertedIds(prev => new Set(prev).add(clause.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Covenant Clause Library</h3>
              <p className="text-xs text-slate-400">Insert verified covenant provisions & marital standards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clauses (e.g. fidelity, finances, resolution)..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Clauses */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No matching clauses found</p>
              <p className="text-xs mt-1">Try another search keyword or category.</p>
            </div>
          ) : (
            filtered.map(clause => {
              const isInserted = insertedIds.has(clause.id);
              return (
                <div
                  key={clause.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {clause.title}
                      </h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {clause.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      "{clause.content}"
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleInsert(clause)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isInserted
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isInserted ? (
                        <><Check size={14} /> Added to Contract</>
                      ) : (
                        <><Plus size={14} /> Insert Clause</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Click any clause to append it to your active contract text.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClauseLibraryModal;

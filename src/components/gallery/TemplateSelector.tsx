import React, { useState } from 'react';
import { TemplateDefinition, TemplateCategory, DocumentType } from '../../types';
import {
  Search,
  Star,
  Eye,
  Check,
  Columns3,
  SlidersHorizontal,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface TemplateSelectorProps {
  documentType: DocumentType;
  templates: TemplateDefinition[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onPreviewTemplate: (templateId: string) => void;
  onOpenComparison: () => void;
  favorites: string[];
  recentlyUsed: string[];
  onToggleFavorite: (templateId: string) => void;
}

const CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'business', label: 'Business' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'creative', label: 'Creative' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'freelancer', label: 'Freelancer' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'dark', label: 'Dark' },
  { id: 'modern', label: 'Modern' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  documentType,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onPreviewTemplate,
  onOpenComparison,
  favorites,
  recentlyUsed,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    if (showOnlyFavorites && !favorites.includes(tpl.id)) return false;
    if (activeCategory !== 'all' && tpl.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchDesc = tpl.description.toLowerCase().includes(q);
      const matchCat = tpl.category.toLowerCase().includes(q);
      const matchRec = tpl.recommendedFor?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchRec) return false;
    }
    return true;
  });

  // Recent templates
  const recentTemplatesList = templates.filter((tpl) => recentlyUsed.includes(tpl.id));

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${templates.length} ${documentType} designs...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                showOnlyFavorites
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              Favorites ({favorites.length})
            </button>

            {documentType === 'invoice' && (
              <button
                onClick={onOpenComparison}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                <Columns3 className="w-3.5 h-3.5 text-slate-300" />
                Compare Designs
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowOnlyFavorites(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id && !showOnlyFavorites
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recently Used Strip (if any) */}
      {!searchQuery && recentTemplatesList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Recently Used</span>
            <span>{recentTemplatesList.length} designs</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentTemplatesList.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.id)}
                className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all bg-white hover:shadow-xs ${
                  selectedTemplateId === tpl.id
                    ? 'border-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className="h-2 w-full rounded mb-2"
                  style={{ backgroundColor: tpl.previewColor }}
                />
                <p className="font-semibold text-xs text-slate-900 truncate">{tpl.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{tpl.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredTemplates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          const isFav = favorites.includes(tpl.id);

          return (
            <div
              key={tpl.id}
              className={`group flex flex-col justify-between rounded-xl border bg-white overflow-hidden transition-all duration-150 ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Card Header & Simulated Mini Thumbnail */}
              <div className="relative">
                {/* Visual Representation Thumbnail */}
                <div
                  className="h-36 w-full p-4 flex flex-col justify-between border-b relative overflow-hidden"
                  style={{
                    backgroundColor: tpl.id.includes('dark') || tpl.id === 'bold-typography' ? '#090d16' : '#f8fafc',
                  }}
                >
                  {/* Subtle decorative geometry based on template style */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-xs"
                        style={{ backgroundColor: tpl.previewColor }}
                      />
                      <div className="space-y-1">
                        <div
                          className="h-1.5 w-12 rounded"
                          style={{
                            backgroundColor: tpl.id.includes('dark') ? '#334155' : '#cbd5e1',
                          }}
                        />
                        <div
                          className="h-1 w-8 rounded"
                          style={{
                            backgroundColor: tpl.id.includes('dark') ? '#1e293b' : '#e2e8f0',
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="h-2 w-10 rounded font-mono text-[8px] text-right"
                      style={{
                        color: tpl.id.includes('dark') ? '#10b981' : tpl.previewColor,
                      }}
                    >
                      #0842
                    </div>
                  </div>

                  {/* Simulated table lines */}
                  <div className="space-y-1 my-auto">
                    <div
                      className="h-1 w-full rounded"
                      style={{
                        backgroundColor: tpl.id.includes('dark') ? '#1e293b' : '#e2e8f0',
                      }}
                    />
                    <div
                      className="h-1 w-3/4 rounded"
                      style={{
                        backgroundColor: tpl.id.includes('dark') ? '#1e293b' : '#f1f5f9',
                      }}
                    />
                    <div
                      className="h-1 w-5/6 rounded"
                      style={{
                        backgroundColor: tpl.id.includes('dark') ? '#1e293b' : '#f1f5f9',
                      }}
                    />
                  </div>

                  {/* Simulated total */}
                  <div className="flex justify-end">
                    <div
                      className="h-2.5 w-14 rounded"
                      style={{ backgroundColor: tpl.previewColor }}
                    />
                  </div>

                  {/* Favorite button in corner */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tpl.id);
                    }}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-amber-500 shadow-2xs transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* Optional Badge */}
                  {tpl.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-xs">
                      {tpl.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-900">{tpl.name}</h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                {tpl.recommendedFor && (
                  <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 line-clamp-1 italic">
                    Best for: {tpl.recommendedFor}
                  </p>
                )}

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
                  <button
                    onClick={() => onPreviewTemplate(tpl.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>

                  <button
                    onClick={() => onSelectTemplate(tpl.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        In Use
                      </>
                    ) : (
                      'Use Template'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No templates found matching your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setShowOnlyFavorites(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

import { TrendCategory } from '../types';
import { Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface CategoryPillsProps {
  categories: TrendCategory[];
  selectedCategory: TrendCategory;
  onSelectCategory: (category: TrendCategory) => void;
}

export function CategoryPills({ categories, selectedCategory, onSelectCategory }: CategoryPillsProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Show first 8 categories by default
  const visibleCategories = showAll ? categories : categories.slice(0, 8);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-1.5">
        {visibleCategories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium 
              transition-all duration-200 
              ${selectedCategory === category
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 scale-105'
                : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500 hover:scale-105'
              }
            `}
          >
            <Hash className="w-3 h-3" />
            {category}
          </button>
        ))}
        {categories.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
              bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500 hover:scale-105 
              transition-all duration-200"
          >
            {showAll ? (
              <>
                Less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                More <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
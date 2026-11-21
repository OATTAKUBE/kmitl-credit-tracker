import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { CategoryId, CategoryProgress } from '../models/types';
import { CategoryCardView } from './CategoryCardView';

export interface CategoryGridViewProps {
  categories: Record<CategoryId, CategoryProgress>;
}

const ORDERED_CATEGORY_IDS: CategoryId[] = [
  'ge_foundation',
  'ge_lang',
  'ge_elective',
  'math_mandatory',
  'cs_mandatory',
  'cs_elective',
  'alternative_study',
  'free_elective',
];

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({ categories }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-slate-100">
          ความคืบหน้ารายหมวดวิชา (Curriculum Categories)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ORDERED_CATEGORY_IDS.map((catId) => {
          const category = categories[catId];
          if (!category) return null;
          return <CategoryCardView key={catId} category={category} />;
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative w-full mb-4">
      {/* Drag handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-white/50 rounded shadow-sm text-gray-500 hover:text-blue-500 transition-all z-20"
      >
        <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
      </div>
      {children}
    </div>
  );
};

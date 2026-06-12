'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DraggableSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  isDragEnabled?: boolean;
}

export function DraggableSection({
  id,
  children,
  className,
  isDragEnabled = true,
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50 opacity-90 scale-[1.02] shadow-2xl',
        className
      )}
    >
      {/* Drag Handle */}
      {isDragEnabled && (
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10',
            'p-2 rounded-lg',
            'bg-background/80 backdrop-blur-sm border border-border/50',
            'opacity-0 group-hover:opacity-100 focus:opacity-100',
            'transition-all duration-200',
            'hover:bg-muted hover:scale-110',
            'touch-none cursor-grab active:cursor-grabbing',
            'shadow-lg'
          )}
          aria-label="Drag to reorder section"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
      {children}
    </div>
  );
}

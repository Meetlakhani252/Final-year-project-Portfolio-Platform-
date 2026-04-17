"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reorderSections } from "@/actions/portfolio";

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  education: "Education",
  blog: "Blog",
  photos: "Photos",
  social: "Social Links",
};

const DEFAULT_ORDER = [
  "about",
  "skills",
  "projects",
  "certifications",
  "education",
  "blog",
  "photos",
  "social",
];

function SortableItem({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={isDragging ? "shadow-lg" : ""}>
        <CardContent className="flex items-center gap-3 p-3">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>
          <span className="text-sm font-medium">
            {SECTION_LABELS[id] ?? id}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

export function SectionReorder({
  initialOrder,
}: {
  initialOrder: string[];
}) {
  const order =
    initialOrder.length === DEFAULT_ORDER.length
      ? initialOrder
      : DEFAULT_ORDER;

  const [items, setItems] = useState<string[]>(order);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await reorderSections(items);
      if (result.ok) {
        toast.success("Section order saved");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag sections to reorder how they appear on your public portfolio.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Save className="mr-2 size-4" />
        )}
        Save order
      </Button>
    </div>
  );
}

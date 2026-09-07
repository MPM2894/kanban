"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@/lib/types";
import { AddCardForm, CardView } from "@/components/CardView";

type ColumnViewProps = {
  column: Column;
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export function ColumnView({
  column,
  onRename,
  onAddCard,
  onDeleteCard,
}: ColumnViewProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const cardIds = column.cards.map((card) => card.id);

  return (
    <section
      ref={setNodeRef}
      data-testid={`column-${column.id}`}
      className="flex w-72 shrink-0 flex-col rounded-3xl border border-white/40 bg-white/30 p-3 shadow-lg backdrop-blur-2xl transition-colors md:w-auto md:flex-1"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-white/40 pb-3">
        <ColumnTitle
          columnId={column.id}
          title={column.title}
          onRename={onRename}
        />
        <span className="ml-auto rounded-full bg-white/50 px-2 py-0.5 text-xs font-medium text-primary backdrop-blur-sm">
          {column.cards.length}
        </span>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>
      <AddCardForm
        columnId={column.id}
        onAdd={(title, details) => onAddCard(column.id, title, details)}
      />
    </section>
  );
}

function ColumnTitle({
  columnId,
  title,
  onRename,
}: {
  columnId: string;
  title: string;
  onRename: (columnId: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  function commit() {
    const next = value.trim() || title;
    setValue(next);
    onRename(columnId, next);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        data-testid={`column-title-input-${columnId}`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Escape") {
            setValue(title);
            setEditing(false);
          }
        }}
        className="w-full min-w-0 rounded-md border border-navy/15 bg-white px-2 py-1 text-sm font-semibold text-navy outline-none ring-accent focus:ring-2"
      />
    );
  }

  return (
    <button
      type="button"
      data-testid={`column-title-${columnId}`}
      onClick={() => setEditing(true)}
      className="min-w-0 truncate text-left text-sm font-semibold tracking-wide text-navy"
    >
      {title}
    </button>
  );
}

function SortableCard({
  card,
  onDelete,
}: {
  card: Column["cards"][number];
  onDelete: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <CardView
      card={card}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      onDelete={onDelete}
    />
  );
}

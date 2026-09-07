"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ColumnView } from "@/components/ColumnView";
import { CardView } from "@/components/CardView";
import { addCard, deleteCard, moveCard, renameColumn } from "@/lib/board";
import { initialBoard } from "@/lib/dummy-data";

export function Board() {
  const [board, setBoard] = useState(initialBoard);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeCard = activeId
    ? board.columns.flatMap((column) => column.cards).find((card) => card.id === activeId)
    : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) {
      return;
    }
    setBoard((current) => moveCard(current, String(active.id), String(over.id)));
  }

  return (
    <div className="flex min-h-full flex-col" data-testid="board">
      <header className="border-b border-navy/8 bg-white">
        <div className="h-1 bg-accent" />
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Project board
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy">
            Kanban
          </h1>
          <p className="mt-1 text-sm text-muted">
            One board. Five columns. Move work from idea to done.
          </p>
        </div>
      </header>
      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-6">
          {board.columns.map((column) => (
            <ColumnView
              key={column.id}
              column={column}
              onRename={(columnId, title) =>
                setBoard((current) => renameColumn(current, columnId, title))
              }
              onAddCard={(columnId, title, details) =>
                setBoard((current) =>
                  addCard(current, columnId, title, details, crypto.randomUUID()),
                )
              }
              onDeleteCard={(cardId) =>
                setBoard((current) => deleteCard(current, cardId))
              }
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <CardView card={activeCard} onDelete={() => undefined} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

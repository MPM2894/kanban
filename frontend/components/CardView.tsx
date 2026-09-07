"use client";

import { useState, type CSSProperties } from "react";
import type { Card } from "@/lib/types";

type AddCardFormProps = {
  columnId: string;
  onAdd: (title: string, details: string) => void;
};

export function AddCardForm({ columnId, onAdd }: AddCardFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function reset() {
    setTitle("");
    setDetails("");
    setOpen(false);
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed, details.trim());
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        data-testid={`add-card-${columnId}`}
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-primary transition hover:bg-primary/10"
      >
        Add card
      </button>
    );
  }

  return (
    <form
      data-testid={`add-card-form-${columnId}`}
      className="mt-3 space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <input
        autoFocus
        data-testid={`add-card-title-${columnId}`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none ring-accent focus:ring-2"
      />
      <textarea
        data-testid={`add-card-details-${columnId}`}
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Details"
        rows={3}
        className="w-full resize-none rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none ring-accent focus:ring-2"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          data-testid={`add-card-submit-${columnId}`}
          className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-secondary/90"
        >
          Add
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-navy/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type CardViewProps = {
  card: Card;
  listeners?: object;
  attributes?: object;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  isDragging?: boolean;
  onDelete: (cardId: string) => void;
};

export function CardView({
  card,
  listeners,
  attributes,
  setNodeRef,
  style,
  isDragging,
  onDelete,
}: CardViewProps) {
  return (
    <article
      ref={setNodeRef}
      style={style}
      data-testid={`card-${card.id}`}
      className={`rounded-xl border border-navy/8 bg-white p-3 shadow-sm transition ${
        isDragging ? "opacity-40" : "hover:border-accent/50 hover:shadow-md"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-navy">
          {card.title}
        </h3>
        <button
          type="button"
          data-testid={`delete-card-${card.id}`}
          aria-label={`Delete ${card.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(card.id)}
          className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted transition hover:bg-navy/5 hover:text-navy"
        >
          Delete
        </button>
      </div>
      {card.details ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.details}</p>
      ) : null}
    </article>
  );
}

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
        aria-label="Add card"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl border border-white/50 bg-white/40 py-2 text-center text-base font-medium text-navy backdrop-blur-sm transition hover:border-accent/60 hover:bg-white/60"
      >
        +
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
        className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none ring-accent focus:ring-2"
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
  onEdit: (cardId: string, title: string, details: string) => void;
};

export function CardView({
  card,
  listeners,
  attributes,
  setNodeRef,
  style,
  isDragging,
  onDelete,
  onEdit,
}: CardViewProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);

  function startEditing() {
    setTitle(card.title);
    setDetails(card.details);
    setEditing(true);
  }

  function save() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onEdit(card.id, trimmed, details.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <article
        ref={setNodeRef}
        style={style}
        data-testid={`card-${card.id}`}
        className="rounded-2xl border border-accent/60 bg-white/95 p-3 shadow-lg backdrop-blur-md"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <form
          data-testid={`edit-card-form-${card.id}`}
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <input
            autoFocus
            data-testid={`edit-card-title-${card.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm font-semibold text-navy outline-none ring-accent focus:ring-2"
          />
          <textarea
            data-testid={`edit-card-details-${card.id}`}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Details"
            rows={3}
            className="w-full resize-none rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm text-navy outline-none ring-accent focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              data-testid={`edit-card-save-${card.id}`}
              className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-secondary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-navy/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-testid={`card-${card.id}`}
      className={`group touch-none rounded-2xl border border-white/60 bg-white/85 p-3 shadow-md backdrop-blur-md transition ${
        isDragging ? "opacity-40" : "hover:border-accent/50 hover:shadow-lg"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-navy">
          {card.title}
        </h3>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            data-testid={`edit-card-${card.id}`}
            aria-label={`Edit ${card.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={startEditing}
            className="rounded-md p-1 text-primary opacity-0 transition hover:bg-primary/10 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
            </svg>
          </button>
          <button
            type="button"
            data-testid={`delete-card-${card.id}`}
            aria-label={`Delete ${card.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(card.id)}
            className="rounded-md p-1 text-red-500 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1a.75.75 0 0 0-.75.75V3H4.5a.75.75 0 0 0 0 1.5h.324l.7 10.15A2.25 2.25 0 0 0 7.77 16.75h4.46a2.25 2.25 0 0 0 2.246-2.1l.7-10.15h.324a.75.75 0 0 0 0-1.5H12v-1.25a.75.75 0 0 0-.75-.75h-2.5ZM10 6a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 10 6Zm-2.25.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Zm5 0a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      {card.details ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.details}</p>
      ) : null}
    </article>
  );
}

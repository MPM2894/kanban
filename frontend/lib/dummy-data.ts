import type { BoardData } from "./types";

export const initialBoard: BoardData = {
  columns: [
    {
      id: "col-backlog",
      title: "Backlog",
      cards: [
        {
          id: "card-brand",
          title: "Define product positioning",
          details: "Draft the one-line pitch and audience for the MVP launch.",
        },
        {
          id: "card-research",
          title: "Interview three target users",
          details: "Capture pain points around existing project boards.",
        },
      ],
    },
    {
      id: "col-todo",
      title: "To Do",
      cards: [
        {
          id: "card-design",
          title: "Polish board visual hierarchy",
          details: "Tighten spacing, type scale, and column contrast.",
        },
        {
          id: "card-copy",
          title: "Write empty-state copy",
          details: "Short prompt that invites adding the first card.",
        },
      ],
    },
    {
      id: "col-progress",
      title: "In Progress",
      cards: [
        {
          id: "card-dnd",
          title: "Ship drag and drop",
          details: "Move cards across columns with keyboard support.",
        },
      ],
    },
    {
      id: "col-review",
      title: "Review",
      cards: [
        {
          id: "card-a11y",
          title: "Check keyboard flows",
          details: "Rename columns, add a card, and delete without a mouse.",
        },
      ],
    },
    {
      id: "col-done",
      title: "Done",
      cards: [
        {
          id: "card-scaffold",
          title: "Scaffold the Next.js app",
          details: "TypeScript, Tailwind, and a single board route.",
        },
        {
          id: "card-palette",
          title: "Apply brand palette",
          details: "Navy headings, yellow accents, purple actions.",
        },
      ],
    },
  ],
};

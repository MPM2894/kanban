import type { BoardData, Card } from "./types";

export function renameColumn(
  board: BoardData,
  columnId: string,
  title: string,
): BoardData {
  return {
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, title } : column,
    ),
  };
}

export function addCard(
  board: BoardData,
  columnId: string,
  title: string,
  details: string,
  id: string,
): BoardData {
  const card: Card = { id, title, details };
  return {
    columns: board.columns.map((column) =>
      column.id === columnId
        ? { ...column, cards: [...column.cards, card] }
        : column,
    ),
  };
}

export function editCard(
  board: BoardData,
  cardId: string,
  title: string,
  details: string,
): BoardData {
  return {
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) =>
        card.id === cardId ? { ...card, title, details } : card,
      ),
    })),
  };
}

export function deleteCard(board: BoardData, cardId: string): BoardData {
  return {
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    })),
  };
}

export function findCardLocation(board: BoardData, cardId: string) {
  for (const column of board.columns) {
    const index = column.cards.findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return { columnId: column.id, index };
    }
  }
  return null;
}

export function columnExists(board: BoardData, columnId: string): boolean {
  return board.columns.some((column) => column.id === columnId);
}

export function cardExists(board: BoardData, cardId: string): boolean {
  return findCardLocation(board, cardId) !== null;
}

function arrayMove<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function relocateCard(
  board: BoardData,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): BoardData {
  const from = findCardLocation(board, cardId);
  if (!from) {
    return board;
  }

  if (from.columnId === toColumnId) {
    const column = board.columns.find((c) => c.id === from.columnId)!;
    const clamped = Math.max(0, Math.min(toIndex, column.cards.length - 1));
    if (from.index === clamped) {
      return board;
    }
    return {
      columns: board.columns.map((c) =>
        c.id === from.columnId
          ? { ...c, cards: arrayMove(c.cards, from.index, clamped) }
          : c,
      ),
    };
  }

  let moving: Card | undefined;
  const withoutCard = board.columns.map((column) => {
    if (column.id !== from.columnId) {
      return column;
    }
    moving = column.cards[from.index];
    return {
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    };
  });

  if (!moving) {
    return board;
  }

  const card = moving;
  return {
    columns: withoutCard.map((column) => {
      if (column.id !== toColumnId) {
        return column;
      }
      const cards = [...column.cards];
      const index = Math.max(0, Math.min(toIndex, cards.length));
      cards.splice(index, 0, card);
      return { ...column, cards };
    }),
  };
}

export function moveCard(
  board: BoardData,
  cardId: string,
  overId: string,
): BoardData {
  const from = findCardLocation(board, cardId);
  if (!from) {
    return board;
  }

  const overColumn = board.columns.find((column) => column.id === overId);
  const overCard = findCardLocation(board, overId);

  let toColumnId: string;
  let toIndex: number;

  if (overColumn) {
    toColumnId = overColumn.id;
    toIndex =
      from.columnId === overColumn.id
        ? overColumn.cards.length - 1
        : overColumn.cards.length;
  } else if (overCard) {
    toColumnId = overCard.columnId;
    toIndex = overCard.index;
  } else {
    return board;
  }

  return relocateCard(board, cardId, toColumnId, toIndex);
}

export function moveCardToPosition(
  board: BoardData,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): BoardData {
  return relocateCard(board, cardId, toColumnId, toIndex);
}

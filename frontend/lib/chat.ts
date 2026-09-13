import "server-only";
import { AIError, chatCompletion } from "./ai";
import {
  addCard,
  cardExists,
  columnExists,
  deleteCard,
  editCard,
  findCardLocation,
  moveCardToPosition,
  renameColumn,
} from "./board";
import type { BoardData } from "./types";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type BoardOperation = {
  type: "create_card" | "update_card" | "delete_card" | "move_card" | "rename_column";
  column_id?: string | null;
  card_id?: string | null;
  title?: string | null;
  details?: string | null;
  position?: number | null;
};

export type BoardUpdate = { operations: BoardOperation[] };

export type AssistantResponse = {
  reply: string;
  board_update: BoardUpdate | null;
};

const OPERATION_TYPES = [
  "create_card",
  "update_card",
  "delete_card",
  "move_card",
  "rename_column",
];

const SYSTEM_PROMPT_TEMPLATE = `You are an assistant embedded in a Kanban board app.
You can see the current board as JSON and can propose changes to it.

Current board (columns in display order, each listing its cards in order):
{board_json}

Respond with ONLY a JSON object matching this exact shape (no markdown
fences, no extra text before or after it):
{
  "reply": "<your natural-language reply to the user>",
  "board_update": null OR {
    "operations": [
      {
        "type": "create_card" | "update_card" | "delete_card" | "move_card" | "rename_column",
        "column_id": "<column id: required for create_card, rename_column, and move_card (the target column)>",
        "card_id": "<card id: required for update_card, delete_card, and move_card>",
        "title": "<new title: for create_card, update_card, rename_column>",
        "details": "<new details: for create_card, update_card>",
        "position": <integer index within the target column: for move_card>
      }
    ]
  }
}

Omit fields an operation doesn't use (or set them to null). For
"create_card", do NOT include a "card_id" -- the server generates one
automatically; you only need "column_id", "title", and "details". Only
include a non-null "board_update" if the user actually asked you to change
the board. Always use the exact existing column and card ids from the
board JSON above -- never invent an id for an existing column or card. If
you are only answering a question, set "board_update" to null.`;

function buildMessages(
  board: BoardData,
  message: string,
  history: ChatMessage[],
) {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace(
    "{board_json}",
    JSON.stringify(board),
  );
  return [
    { role: "system", content: systemPrompt },
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "user", content: message },
  ];
}

function isBoardOperation(value: unknown): value is BoardOperation {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const op = value as Record<string, unknown>;
  return typeof op.type === "string" && OPERATION_TYPES.includes(op.type);
}

function parseAssistantResponse(raw: string): AssistantResponse {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new AIError(`AI returned invalid JSON: ${error}`);
  }

  if (typeof data !== "object" || data === null) {
    throw new AIError("AI response was not a JSON object");
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.reply !== "string") {
    throw new AIError("AI response is missing 'reply'");
  }

  if (obj.board_update === null || obj.board_update === undefined) {
    return { reply: obj.reply, board_update: null };
  }

  const update = obj.board_update as Record<string, unknown>;
  if (!Array.isArray(update.operations) || !update.operations.every(isBoardOperation)) {
    throw new AIError("AI response has an invalid board_update shape");
  }

  return {
    reply: obj.reply,
    board_update: { operations: update.operations as BoardOperation[] },
  };
}

export async function askAI(
  board: BoardData,
  message: string,
  history: ChatMessage[],
): Promise<AssistantResponse> {
  const content = await chatCompletion(buildMessages(board, message, history));
  return parseAssistantResponse(content);
}

export function applyBoardUpdate(
  board: BoardData,
  update: BoardUpdate,
): BoardData {
  for (const op of update.operations) {
    if (op.type === "create_card" || op.type === "rename_column") {
      if (!op.column_id || !columnExists(board, op.column_id)) {
        throw new AIError(`AI referenced unknown column '${op.column_id}'`);
      }
    } else {
      if (!op.card_id || !cardExists(board, op.card_id)) {
        throw new AIError(`AI referenced unknown card '${op.card_id}'`);
      }
      if (
        op.type === "move_card" &&
        (!op.column_id || !columnExists(board, op.column_id))
      ) {
        throw new AIError(`AI referenced unknown column '${op.column_id}'`);
      }
    }
  }

  let next = board;
  for (const op of update.operations) {
    switch (op.type) {
      case "create_card":
        next = addCard(
          next,
          op.column_id!,
          op.title ?? "Untitled",
          op.details ?? "",
          crypto.randomUUID(),
        );
        break;
      case "update_card": {
        const location = findCardLocation(next, op.card_id!)!;
        const column = next.columns.find((c) => c.id === location.columnId)!;
        const current = column.cards[location.index];
        next = editCard(
          next,
          op.card_id!,
          op.title ?? current.title,
          op.details ?? current.details,
        );
        break;
      }
      case "delete_card":
        next = deleteCard(next, op.card_id!);
        break;
      case "move_card":
        next = moveCardToPosition(next, op.card_id!, op.column_id!, op.position ?? 0);
        break;
      case "rename_column":
        next = renameColumn(next, op.column_id!, op.title ?? "");
        break;
    }
  }
  return next;
}

import "server-only";
import { Redis } from "@upstash/redis";
import type { BoardData } from "./types";
import { initialBoard } from "./dummy-data";

const BOARD_KEY = "kanban:board";

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

export async function getBoard(): Promise<BoardData> {
  if (!redis) {
    return initialBoard;
  }
  const stored = await redis.get<BoardData>(BOARD_KEY);
  return stored ?? initialBoard;
}

export async function saveBoard(board: BoardData): Promise<void> {
  if (!redis) {
    return;
  }
  await redis.set(BOARD_KEY, board);
}

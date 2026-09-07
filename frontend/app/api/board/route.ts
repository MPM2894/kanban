import { NextResponse } from "next/server";
import { getBoard, saveBoard } from "@/lib/store";
import type { BoardData } from "@/lib/types";

export async function GET() {
  const board = await getBoard();
  return NextResponse.json(board);
}

export async function PUT(request: Request) {
  const board = (await request.json()) as BoardData;
  await saveBoard(board);
  return NextResponse.json({ ok: true });
}

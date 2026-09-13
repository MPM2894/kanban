import { NextResponse } from "next/server";
import { AIError } from "@/lib/ai";
import { applyBoardUpdate, askAI, type ChatMessage } from "@/lib/chat";
import type { BoardData } from "@/lib/types";

type ChatRequestBody = {
  message: string;
  history?: ChatMessage[];
  board: BoardData;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;

  try {
    const assistantResponse = await askAI(
      body.board,
      body.message,
      body.history ?? [],
    );

    const board = assistantResponse.board_update
      ? applyBoardUpdate(body.board, assistantResponse.board_update)
      : null;

    return NextResponse.json({ reply: assistantResponse.reply, board });
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}

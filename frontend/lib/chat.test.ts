import { afterEach, describe, expect, it, vi } from "vitest";
import { initialBoard } from "@/lib/dummy-data";
import { applyBoardUpdate, askAI } from "@/lib/chat";

function mockOpenRouterResponse(content: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(content) } }],
        }),
      ),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("askAI", () => {
  it("parses a reply-only response", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    mockOpenRouterResponse({ reply: "The board looks good.", board_update: null });

    const result = await askAI(initialBoard, "How's it going?", []);
    expect(result.reply).toBe("The board looks good.");
    expect(result.board_update).toBeNull();
  });

  it("parses a board_update response", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    mockOpenRouterResponse({
      reply: "Moved it.",
      board_update: {
        operations: [
          { type: "move_card", card_id: "card-dnd", column_id: "col-done", position: 0 },
        ],
      },
    });

    const result = await askAI(initialBoard, "Move it", []);
    expect(result.board_update?.operations).toHaveLength(1);
  });

  it("throws when the AI response is not valid JSON", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "not json" } }] }),
        ),
      ),
    );

    await expect(askAI(initialBoard, "Do something", [])).rejects.toThrow();
  });
});

describe("applyBoardUpdate", () => {
  it("creates a card", () => {
    const next = applyBoardUpdate(initialBoard, {
      operations: [
        {
          type: "create_card",
          column_id: "col-backlog",
          title: "AI card",
          details: "added by assistant",
        },
      ],
    });
    const backlog = next.columns.find((c) => c.id === "col-backlog")!;
    expect(backlog.cards.at(-1)).toMatchObject({ title: "AI card" });
  });

  it("moves a card to another column", () => {
    const next = applyBoardUpdate(initialBoard, {
      operations: [
        { type: "move_card", card_id: "card-dnd", column_id: "col-done", position: 0 },
      ],
    });
    const done = next.columns.find((c) => c.id === "col-done")!;
    const progress = next.columns.find((c) => c.id === "col-progress")!;
    expect(done.cards[0].id).toBe("card-dnd");
    expect(progress.cards).toHaveLength(0);
  });

  it("renames a column", () => {
    const next = applyBoardUpdate(initialBoard, {
      operations: [{ type: "rename_column", column_id: "col-todo", title: "Ready" }],
    });
    expect(next.columns.find((c) => c.id === "col-todo")!.title).toBe("Ready");
  });

  it("deletes a card", () => {
    const next = applyBoardUpdate(initialBoard, {
      operations: [{ type: "delete_card", card_id: "card-dnd" }],
    });
    const progress = next.columns.find((c) => c.id === "col-progress")!;
    expect(progress.cards).toHaveLength(0);
  });

  it("throws and leaves the board untouched when a card id is unknown", () => {
    expect(() =>
      applyBoardUpdate(initialBoard, {
        operations: [{ type: "delete_card", card_id: "does-not-exist" }],
      }),
    ).toThrow();
  });

  it("throws and leaves the board untouched when a column id is unknown", () => {
    expect(() =>
      applyBoardUpdate(initialBoard, {
        operations: [
          { type: "create_card", column_id: "does-not-exist", title: "X" },
        ],
      }),
    ).toThrow();
  });
});

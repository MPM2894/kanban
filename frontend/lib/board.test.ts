import { describe, expect, it } from "vitest";
import { initialBoard } from "@/lib/dummy-data";
import {
  addCard,
  deleteCard,
  findCardLocation,
  moveCard,
  renameColumn,
} from "@/lib/board";

describe("dummy board", () => {
  it("has five named columns with cards", () => {
    expect(initialBoard.columns).toHaveLength(5);
    expect(initialBoard.columns.map((column) => column.title)).toEqual([
      "Backlog",
      "To Do",
      "In Progress",
      "Review",
      "Done",
    ]);
    expect(
      initialBoard.columns.every((column) => column.cards.length >= 1),
    ).toBe(true);
  });
});

describe("board actions", () => {
  it("renames a column", () => {
    const next = renameColumn(initialBoard, "col-todo", "Ready");
    expect(next.columns[1].title).toBe("Ready");
    expect(initialBoard.columns[1].title).toBe("To Do");
  });

  it("adds a card to a column", () => {
    const next = addCard(
      initialBoard,
      "col-review",
      "QA pass",
      "Click through add and delete",
      "card-qa",
    );
    expect(next.columns[3].cards.at(-1)).toEqual({
      id: "card-qa",
      title: "QA pass",
      details: "Click through add and delete",
    });
  });

  it("deletes a card", () => {
    const next = deleteCard(initialBoard, "card-dnd");
    expect(findCardLocation(next, "card-dnd")).toBeNull();
    expect(next.columns[2].cards).toHaveLength(0);
  });

  it("reorders a card within a column", () => {
    const next = moveCard(initialBoard, "card-research", "card-brand");
    expect(next.columns[0].cards.map((card) => card.id)).toEqual([
      "card-research",
      "card-brand",
    ]);
  });

  it("moves a card to another column", () => {
    const next = moveCard(initialBoard, "card-dnd", "col-done");
    expect(findCardLocation(next, "card-dnd")).toEqual({
      columnId: "col-done",
      index: 2,
    });
    expect(next.columns[2].cards).toHaveLength(0);
  });

  it("inserts a card before another card in a different column", () => {
    const next = moveCard(initialBoard, "card-copy", "card-a11y");
    expect(next.columns[3].cards.map((card) => card.id)).toEqual([
      "card-copy",
      "card-a11y",
    ]);
    expect(next.columns[1].cards.map((card) => card.id)).toEqual(["card-design"]);
  });
});

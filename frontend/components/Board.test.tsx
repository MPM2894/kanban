import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Board } from "@/components/Board";
import { initialBoard } from "@/lib/dummy-data";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }))),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Board", () => {
  it("renders dummy column titles and cards", () => {
    render(<Board initialBoard={initialBoard} />);
    expect(screen.getByRole("heading", { name: /kanban/i })).toBeInTheDocument();
    expect(screen.getByTestId("column-title-col-backlog")).toHaveTextContent(
      "Backlog",
    );
    expect(screen.getByText("Ship drag and drop")).toBeInTheDocument();
  });

  it("renames a column", async () => {
    const user = userEvent.setup();
    render(<Board initialBoard={initialBoard} />);
    await user.click(screen.getByTestId("column-title-col-todo"));
    const input = screen.getByTestId("column-title-input-col-todo");
    await user.clear(input);
    await user.type(input, "Ready");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("column-title-col-todo")).toHaveTextContent("Ready");
  });

  it("adds a card to a column", async () => {
    const user = userEvent.setup();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "card-new" as ReturnType<typeof crypto.randomUUID>,
    );
    render(<Board initialBoard={initialBoard} />);
    await user.click(screen.getByTestId("add-card-col-done"));
    await user.type(screen.getByTestId("add-card-title-col-done"), "Release notes");
    await user.type(
      screen.getByTestId("add-card-details-col-done"),
      "Summarize the MVP.",
    );
    await user.click(screen.getByTestId("add-card-submit-col-done"));
    expect(screen.getByTestId("card-card-new")).toHaveTextContent("Release notes");
    expect(screen.getByTestId("card-card-new")).toHaveTextContent(
      "Summarize the MVP.",
    );
  });

  it("deletes a card", async () => {
    const user = userEvent.setup();
    render(<Board initialBoard={initialBoard} />);
    await user.click(screen.getByTestId("delete-card-card-scaffold"));
    expect(screen.queryByTestId("card-card-scaffold")).not.toBeInTheDocument();
  });
});

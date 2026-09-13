import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatSidebar } from "@/components/ChatSidebar";
import { initialBoard } from "@/lib/dummy-data";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ChatSidebar", () => {
  it("sends a message and shows the reply", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ reply: "Sure, done.", board: null })),
      ),
    );
    const onBoardUpdate = vi.fn();
    const user = userEvent.setup();
    render(<ChatSidebar board={initialBoard} onBoardUpdate={onBoardUpdate} />);

    await user.type(screen.getByLabelText("Chat message"), "What's up?");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText("Sure, done.")).toBeInTheDocument();
    expect(onBoardUpdate).not.toHaveBeenCalled();
  });

  it("applies the returned board when the AI updates it", async () => {
    const updatedBoard = { columns: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ reply: "Moved it.", board: updatedBoard }),
        ),
      ),
    );
    const onBoardUpdate = vi.fn();
    const user = userEvent.setup();
    render(<ChatSidebar board={initialBoard} onBoardUpdate={onBoardUpdate} />);

    await user.type(screen.getByLabelText("Chat message"), "Move it");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText("Moved it.")).toBeInTheDocument();
    expect(onBoardUpdate).toHaveBeenCalledWith(updatedBoard);
  });

  it("shows an error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 502 })));
    const user = userEvent.setup();
    render(<ChatSidebar board={initialBoard} onBoardUpdate={vi.fn()} />);

    await user.type(screen.getByLabelText("Chat message"), "hello");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /something went wrong/i,
    );
  });
});

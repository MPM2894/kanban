import { Board } from "@/components/Board";
import { getBoard } from "@/lib/store";

export default async function Home() {
  const board = await getBoard();
  return <Board initialBoard={board} />;
}

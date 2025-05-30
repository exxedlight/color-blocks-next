import Image from "next/image";
import styles from "./page.module.css";
import GameField from "@/components/game-field/game-field";

export default function Home() {
  return (
    <main className="col center align-c">
      <GameField/>
    </main>
  );
}

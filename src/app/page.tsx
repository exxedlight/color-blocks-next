"use client";
import GameField from "@/components/game-field/game-field";
import dynamic from "next/dynamic";
//const GameField = dynamic(() => import("@/components/game-field/game-field"), {ssr: false});

export default function Home() {
  return (
    <main className="col center align-c">
      <button onClick={_ => {
        alert(`w: ${window.innerWidth}, h: ${window.innerHeight}`)
      }}>debug</button>
      <GameField/>
    </main>
  );
}

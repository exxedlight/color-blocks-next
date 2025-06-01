"use client";
import GameField from "@/components/game-field/game-field";
import ScoreElement from "@/components/score/score";
import dynamic from "next/dynamic";
import { useState } from "react";
//const GameField = dynamic(() => import("@/components/game-field/game-field"), {ssr: false});

export default function Home() {

  const [score, setScore] = useState(0);

  return (
    <main className="col center align-c">
      <ScoreElement score={score}/>
      <GameField setScore={setScore}/>
    
    </main>
  );
}

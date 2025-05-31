"use client";
import Image from "next/image";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
const GameField = dynamic(() => import("@/components/game-field/game-field"), {ssr: false});

export default function Home() {
  return (
    <main className="col center align-c">
      <GameField/>
    </main>
  );
}

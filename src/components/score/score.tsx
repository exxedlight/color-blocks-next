"use client";
import "./style.css";
import { useEffect, useState } from "react";

interface ScoreElementProps{
    score: number;
}

const ScoreElement = (
    {score}:ScoreElementProps
) => {

    const [highscore, setHighscore] = useState(0);

    useEffect(() => {
        const storedHighscore = localStorage.getItem("highscore");
        if(!storedHighscore) return;

        setHighscore(Number.parseInt(storedHighscore));
    }, []);

    useEffect(() => {
        if(score > highscore){
            setHighscore(score);
            localStorage.setItem("highscore", score.toString());
        }
    }, [score]);

    const resetHighScore = () => {
        if(window.confirm("You realy want to clear the highscore?")){
            localStorage.setItem("highscore", score.toString());
            setHighscore(score);
        }
    }

    return (
        <div className="score row align-c">
            <div className="col">
            <p id="current" className="cherry-bomb-one-regular">{score}</p>
            <p id="highscore" className="cherry-bomb-one-regular">
                Highscore: {highscore}
            </p>
            </div>
            <button className="reload-score-btn" 
                onClick={_ => resetHighScore()}
                onTouchStart={_ => resetHighScore()}
            />
        </div>
    )
}
export default ScoreElement;
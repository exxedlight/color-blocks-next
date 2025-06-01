"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./style.css";
import { Colors, getRandColor, States } from "@/core/block-states";
import Block from "../block/block";
import { normalizeField } from "@/core/field-normalizer";
import { applyGravity, checkMatches, restoreDestroyedBlocks } from "@/core/match-checker";
import GhostBlock from "./ghost";

interface GameFieldProps{
    setScore: React.Dispatch<React.SetStateAction<number>>;

}

const GameField = (
    {setScore} : GameFieldProps
) => {
    const [field, setField] = useState<Colors[][]>([]);
    const [blockStates, setBlockStates] = useState<States[][]>([]);
    const [fieldSize, setFieldSize] = useState(10);
    const [fieldSizeInput, setFieldSizeInput] = useState("10");
    const [ready, setReady] = useState(false);
    const [draggedBlock, setDraggedBlock] = useState<{row: number; col: number;} | null>(null);
    const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    //  field init
    const initializeField = useCallback(() => {
        const newField: Colors[][] = Array(fieldSize)
            .fill(null)
            .map(() => Array(fieldSize).fill(getRandColor()));

        const normalizedField = normalizeField(newField, fieldSize);
        setField(normalizedField);
        setBlockStates(
            Array(fieldSize).fill(null).map(() =>
                Array(fieldSize).fill(States.Exist)
            )
        );
        setReady(true);
    }, [fieldSize]);

    //  on page first load
    useEffect(() => {
        initializeField();
        window.addEventListener('mouseup', globalMouseUp);
        window.addEventListener('touchend', globalTouchUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', globalMouseUp);
            window.removeEventListener('touchend', globalTouchUp);
        };
    }, []);

    //  on size change
    useEffect(() => {
        initializeField();
    }, [fieldSize]);

    //  check matches
    const handleMatches = useCallback(async () => {
        if (!field.length || isAnimating) return;

        setIsAnimating(true);

        let currentField = [...field];
        let currentStates = [...blockStates];

        while (true) {
            // Match checking
            const { newField, newStates, hasMatches } = checkMatches(currentField, currentStates, setScore, true);

            if (!hasMatches) break;

            // destruction anim
            setField(newField);
            setBlockStates(newStates);
            await new Promise(resolve => setTimeout(resolve, 300));

            // gravity
            const { newField: fieldAfterGravity, newStates: statesAfterGravity } =
                applyGravity(newField, newStates);

            setField(fieldAfterGravity);
            setBlockStates(statesAfterGravity);
            await new Promise(resolve => requestAnimationFrame(resolve));

            // fill empty space
            const { newField: restoredField, newStates: restoredStates } =
                restoreDestroyedBlocks(fieldAfterGravity, statesAfterGravity);

            setField(restoredField);
            setBlockStates(restoredStates);
            await new Promise(resolve => requestAnimationFrame(resolve));

            // update state
            currentField = restoredField;
            currentStates = restoredStates;
        }

        setIsAnimating(false);
    }, [field, blockStates, isAnimating]);


    const endTurn = useCallback(async (targetRow: number, targetCol: number) => {
        if (isAnimating || !draggedBlock || !field.length) {
            return;
        }

        const { row: sourceRow, col: sourceCol } = draggedBlock;

        // is neigbor cell?
        const isAdjacent =
            (Math.abs(sourceRow - targetRow) === 1 && sourceCol === targetCol) ||
            (Math.abs(sourceCol - targetCol) === 1 && sourceRow === targetRow);

        if (!isAdjacent) {
            return;
        }

        // temporaly swap
        const newField = field.map(row => [...row]);
        [newField[sourceRow][sourceCol], newField[targetRow][targetCol]] =
            [newField[targetRow][targetCol], newField[sourceRow][sourceCol]];

        // if new matches after all?
        const { hasMatches } = checkMatches(newField, blockStates, setScore, false);

        if (hasMatches) {
            // save field if match
            setField(newField);
        }
    }, [draggedBlock, field, blockStates, handleMatches, isAnimating]);

    //  for taches (cause `onTouchEnd is global event`)
    const getBlockByCoordinates = (
        x: number,
        y: number,
        fieldSize: number
    ): { row: number; col: number } | null => {

        const vh = window.innerHeight / 100;
        const vw = window.innerWidth / 100;

        const blockWidth = window.innerWidth <= window.innerHeight
            ? (90*vw) / fieldSize
            : (70*vh) / fieldSize;

        const startX = (window.innerWidth - blockWidth * fieldSize) / 2;
        const startY = (window.innerHeight - blockWidth * fieldSize) / 2;

        if (x < startX || y < startY) return null;

        const col = Math.floor((x - startX) / blockWidth);
        const row = Math.floor((y - startY) / blockWidth);

        if (row >= 0 && row < fieldSize && col >= 0 && col < fieldSize) {
            return { row, col };
        }

        return null;
    };

    /* TOUCH EVENTS */
    const globalTouchUp = () => {
        setDraggedBlock(null);
    }

    const handleTouchMove = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        setPointerPosition({x: touch.clientX, y: touch.clientY});
    }, []);

    const handleTouchDown = useCallback((row: number, col: number, e: React.TouchEvent) => {
        e.preventDefault();
        
        if (isAnimating) return;

        const touch = e.touches[0];
        setDraggedBlock({row, col});
        setPointerPosition({x: touch.clientX, y: touch.clientY});

        window.addEventListener('touchmove', handleTouchMove);
    }, [handleTouchMove, isAnimating]);

    const handleTouchUp = async () => {
        window.removeEventListener('touchmove', handleTouchMove);

        const targetBlock = getBlockByCoordinates(pointerPosition.x, pointerPosition.y, fieldSize);

        if(targetBlock)
            await endTurn(targetBlock.row, targetBlock.col);
    }
    //  -------------------------------------------------------------
    

    /* MOUSE EVENTS */
    const globalMouseUp = () => {
        setDraggedBlock(null);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setPointerPosition({ x: e.clientX, y: e.clientY });
    }, []);

    const handleMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
        if (isAnimating) return;

        setDraggedBlock({ row, col });
        setPointerPosition({x: e.clientX, y: e.clientY});
        
        window.addEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove, isAnimating]);

    const handleMouseUp = async (targetRow: number, targetCol: number) => {
        window.removeEventListener('mousemove', handleMouseMove);
        await endTurn(targetRow, targetCol);
    };

    const handleMouseLeave = useCallback(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        setDraggedBlock(null);
    }, [handleMouseMove]);
    /* ======================================================================== */

    //  on field change
    useEffect(() => {
        if (!isAnimating && field.length) {
            handleMatches();
        }
    }, [field, isAnimating, handleMatches]);



    //  blocks render function
    const renderBlock = useCallback((color: Colors, state: States, row: number, col: number) => {
        const isDestroyed = state === States.Destroyed;
        const isBeingDragged = draggedBlock?.row === row && draggedBlock?.col === col;

        return (
            <Block
                color={isDestroyed ? "transparent" : color}
                size={
                    window.innerWidth <= window.innerHeight ?
                    //  mobile
                    `calc((90vw - 20px) / ${fieldSize} - 1vw)` : 
                    //  desktop
                    `calc((70vh - 20px) / ${fieldSize} - 1vh)`
                }
                key={`${row}-${col}`}
                onMouseDown={!isAnimating ? (e) => handleMouseDown(row, col, e) : undefined}
                onMouseUp={() => handleMouseUp(row, col)}
                onTouchDown={!isAnimating ? (e) => handleTouchDown(row, col, e) : undefined}
                onTouchUp={handleTouchUp}
                isDragged={isBeingDragged}
                state={state}
                row={row}
                col={col}
            />
        );
    }, [draggedBlock, fieldSize, handleMouseDown, handleMouseUp, handleTouchDown, handleTouchUp, isAnimating]);


    if (!ready) return <div className="game-field">Loading...</div>;

    return (
        <div className="game-field" onMouseLeave={handleMouseLeave}>
            {draggedBlock && (
                <GhostBlock
                    field={field}
                    draggedBlock={draggedBlock}
                    mousePosition={pointerPosition}
                    fieldSize={fieldSize}
                />
            )}

            {field.map((row, rowIndex) => (
                <div className="row" key={rowIndex}>
                    {row.map((color, colIndex) =>
                        renderBlock(color, blockStates[rowIndex][colIndex], rowIndex, colIndex)
                    )}
                </div>
            ))}

            <div className="refresh-field">
                <button className="refresh-button" onClick={_ => {
                    initializeField();
                    setScore(0);
                }}/>
            </div>

            <div className="field-size col align-c">
                <input
                    className="teko-400"
                    type="text"
                    value={fieldSizeInput}
                    onChange={e => {
                        setFieldSizeInput(e.target.value);
                    }}
                    onBlur={e => {
                        const newValue = Number(fieldSizeInput); 
                        if (isNaN(newValue) || newValue < 3) {
                            setFieldSize(3);
                            setFieldSizeInput("3");
                        } else if (newValue > 20) {
                            setFieldSize(20); 
                            setFieldSizeInput("20");
                        } else {
                            setFieldSize(newValue); 
                        }
                    }}
                />
                <p className="caption teko-400">Field size</p>
            </div>
        </div>
    );
};

export default GameField;
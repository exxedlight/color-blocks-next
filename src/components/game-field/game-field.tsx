"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./style.css";
import { Colors, getRandColor, States } from "@/core/block-states";
import Block from "../block/block";
import { normalizeField } from "@/core/field-normalizer";
import { applyGravity, checkMatches, restoreDestroyedBlocks } from "@/core/match-checker";
import GhostBlock from "./ghost";

const GameField = () => {
    const [field, setField] = useState<Colors[][]>([]);
    const [blockStates, setBlockStates] = useState<States[][]>([]);
    const [fieldSize] = useState(10);
    const [ready, setReady] = useState(false);
    const [draggedBlock, setDraggedBlock] = useState<{
        row: number;
        col: number;
    } | null>(null);
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
    }, [initializeField]);

    //  check matches
    const handleMatches = useCallback(async () => {
        if (!field.length || isAnimating) return;

        setIsAnimating(true);

        let currentField = [...field];
        let currentStates = [...blockStates];

        while (true) {
            // Match checking
            const { newField, newStates, hasMatches } = checkMatches(currentField, currentStates);

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
            //setDraggedBlock(null);
            return;
        }

        //setDraggedBlock(null);

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
        const { hasMatches } = checkMatches(newField, blockStates);

        if (hasMatches) {
            // save field if match
            setField(newField);
        }
    }, [draggedBlock, field, blockStates, handleMatches, isAnimating]);

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

    const handleTouchUp = async (targetRow: number, targetCol: number) => {
        window.removeEventListener('touchmove', handleTouchMove);
        await endTurn(targetRow, targetCol);
    }

    const handleTouchLeave = useCallback(() => {
        setDraggedBlock(null);
        window.removeEventListener('touchmove', handleTouchMove);
    }, [handleTouchMove]);
    

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
                onTouchUp={() => handleTouchUp(row, col)}
                isDragged={isBeingDragged}
                state={state}
            />
        );
    }, [draggedBlock, fieldSize, handleMouseDown, handleMouseUp, isAnimating]);


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
        </div>
    );
};

export default GameField;
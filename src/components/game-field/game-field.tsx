"use client";
import { useEffect, useState, useCallback } from "react";
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
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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

    useEffect(() => {
        initializeField();
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [initializeField]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    }, []);

    const handleMatches = useCallback(async () => {
        if (!field.length || isAnimating) return;

        setIsAnimating(true);

        let currentField = [...field];
        let currentStates = [...blockStates];

        while (true) {
            // Проверяем совпадения
            const { newField, newStates, hasMatches } = checkMatches(currentField, currentStates);

            if (!hasMatches) break;

            // Анимация уничтожения
            setField(newField);
            setBlockStates(newStates);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Применяем гравитацию
            const { newField: fieldAfterGravity, newStates: statesAfterGravity } =
                applyGravity(newField, newStates);

            setField(fieldAfterGravity);
            setBlockStates(statesAfterGravity);
            await new Promise(resolve => requestAnimationFrame(resolve));

            // Заполняем пустые места
            const { newField: restoredField, newStates: restoredStates } =
                restoreDestroyedBlocks(fieldAfterGravity, statesAfterGravity);

            setField(restoredField);
            setBlockStates(restoredStates);
            await new Promise(resolve => requestAnimationFrame(resolve));

            // Обновляем текущее состояние
            currentField = restoredField;
            currentStates = restoredStates;
        }

        setIsAnimating(false);
    }, [field, blockStates, isAnimating]);

    const handleMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
        if (isAnimating) return;
        setDraggedBlock({ row, col });
        window.addEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove, isAnimating]);

    const handleMouseUp = useCallback(async (targetRow: number, targetCol: number) => {
        window.removeEventListener('mousemove', handleMouseMove);
        setDraggedBlock(null);

        if (isAnimating || !draggedBlock || !field.length) {
            return;
        }

        const { row: sourceRow, col: sourceCol } = draggedBlock;

        // Проверяем, что блок перемещен на соседнюю клетку
        const isAdjacent =
            (Math.abs(sourceRow - targetRow) === 1 && sourceCol === targetCol) ||
            (Math.abs(sourceCol - targetCol) === 1 && sourceRow === targetRow);

        if (!isAdjacent) {
            return;
        }

        // Временно меняем блоки местами
        const newField = field.map(row => [...row]);
        [newField[sourceRow][sourceCol], newField[targetRow][targetCol]] =
            [newField[targetRow][targetCol], newField[sourceRow][sourceCol]];

        // Проверяем, создает ли новое положение комбинацию
        const { hasMatches } = checkMatches(newField, blockStates);

        if (hasMatches) {
            // Если комбинация найдена, сохраняем новое положение
            setField(newField);
            /*await new Promise(resolve => requestAnimationFrame(resolve));*/
            //await handleMatches();
        }

        
    }, [draggedBlock, field, blockStates, handleMatches, isAnimating]);

    useEffect(() => {
        if (!isAnimating && field.length) {
            handleMatches();
        }
    }, [field, isAnimating, handleMatches]);

    const handleMouseLeave = useCallback(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        setDraggedBlock(null);
    }, [handleMouseMove]);

    const renderBlock = useCallback((color: Colors, state: States, row: number, col: number) => {
        const isDestroyed = state === States.Destroyed;
        const isBeingDragged = draggedBlock?.row === row && draggedBlock?.col === col;

        return (
            <Block
                color={isDestroyed ? "transparent" : color}
                size={`min(calc((70vw - 20px) / ${fieldSize} - 1vw), calc((70vh - 20px) / ${fieldSize} - 1vh))`}
                key={`${row}-${col}`}
                onMouseDown={!isAnimating ? (e) => handleMouseDown(row, col, e) : undefined}
                onMouseUp={() => handleMouseUp(row, col)}
                isDragged={isBeingDragged}
                state={state}
            />
        );
    }, [draggedBlock, fieldSize, handleMouseDown, handleMouseUp, isAnimating]);

    if (!ready) {
        return <div className="game-field">Loading...</div>;
    }

    return (
        <div className="game-field" onMouseLeave={handleMouseLeave}>
            {draggedBlock && (
                <GhostBlock 
                    field={field}
                    draggedBlock={draggedBlock}
                    mousePosition={mousePosition}
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
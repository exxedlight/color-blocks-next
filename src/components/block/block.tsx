import { States } from "@/core/block-states";
import "./style.css";
import { useState } from "react";

interface BlockProps {
    color: string;
    size: string;
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseUp?: () => void;
    onTouchDown?: (e: React.TouchEvent) => void;
    onTouchUp: () => void;
    isDragged?: boolean;
    state: States;
    row: number;
    col: number;
}

const Block = (
    { 
        color, 
        size, 
        onMouseDown, 
        onMouseUp,
        onTouchDown,
        onTouchUp, 
        isDragged = false, 
        state,
        row,
        col
    }: BlockProps
) => {
    const getStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            width: size,
            height: size,
            transition: "all 0.7s ease",
            backgroundColor: color,
        };

        if (isDragged) {
            return {
                ...baseStyle,
                opacity: 0,
            };
        }

        switch (state) {
            case States.Destroyed:
                return {
                    ...baseStyle,
                    opacity: 0,
                    transform: "scale(0.5)",
                };
            case States.Restored:
                return {
                    ...baseStyle,
                    opacity: 1,
                    transform: "scale(1)",
                    animation: "fallDown 0.7s linear",
                };
            default:
                return {
                    ...baseStyle,
                };
        }
    };

    const [_row, setRow] = useState(row);
    const [_col, setCol] = useState(col);

    return (
        <div 
            className={`block ${isDragged ? "dragged" : ""}`}
            style={getStyle()}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchStart={onTouchDown}
            onTouchEnd={onTouchUp}
        />
    );
};

export default Block;
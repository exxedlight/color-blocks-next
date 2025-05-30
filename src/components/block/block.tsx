import { States } from "@/core/block-states";
import "./style.css";

interface BlockProps {
    color: string;
    size: string;
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseUp?: () => void;
    isDragged?: boolean;
    state: States;
}

const Block = ({ color, size, onMouseDown, onMouseUp, isDragged = false, state }: BlockProps) => {
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
                pointerEvents: "none",
            };
        }

        switch (state) {
            case States.Destroyed:
                return {
                    ...baseStyle,
                    opacity: 0,
                    transform: "scale(0.5)",
                    pointerEvents: "none",
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
                    cursor: onMouseDown ? "pointer" : "default",
                };
        }
    };

    return (
        <div 
            className={`block ${isDragged ? "dragged" : ""}`}
            style={getStyle()}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        />
    );
};

export default Block;
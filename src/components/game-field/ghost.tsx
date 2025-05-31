import { Colors } from "@/core/block-states";
import "./ghost.css";

interface GhostBlockProps {
    mousePosition: { x: number, y: number };
    field: Colors[][];
    draggedBlock: { row: number, col: number };
    fieldSize: number;
}

const GhostBlock = ({ mousePosition, field, draggedBlock, fieldSize }: GhostBlockProps) => {
    return (
        <div
            className="block ghost"
            style={{
                left: mousePosition.x - 30,
                top: mousePosition.y - 30,
                backgroundColor: field[draggedBlock.row][draggedBlock.col],
                width: `calc((70vh - 20px) / ${fieldSize} - 1vh)`,
                height: `calc((70vh - 20px) / ${fieldSize} - 1vh)`,
            }}
        />
    )
}
export default GhostBlock;
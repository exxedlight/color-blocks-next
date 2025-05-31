import { Colors, getRandColor, States } from "./block-states";

export function normalizeField(field: Colors[][], fieldSize: number): Colors[][] {
    let hasMatches = true;
    // field copy
    let normalizedField = field.map(row => [...row]);
    
    while (hasMatches) {
        hasMatches = false;
        const replacePositions: {row: number, col: number}[] = [];
        
        // check matchs
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                // 3 in col
                if (i - 1 >= 0 && i + 1 < fieldSize) {
                    if (normalizedField[i][j] === normalizedField[i-1][j] && 
                        normalizedField[i][j] === normalizedField[i+1][j]) {
                        replacePositions.push({row: i, col: j});
                        hasMatches = true;
                    }
                }
                
                // 3 in row
                if (j - 1 >= 0 && j + 1 < fieldSize) {
                    if (normalizedField[i][j] === normalizedField[i][j-1] && 
                        normalizedField[i][j] === normalizedField[i][j+1]) {
                        replacePositions.push({row: i, col: j});
                        hasMatches = true;
                    }
                }
            }
        }
        
        // replace matches
        if (hasMatches) {
            replacePositions.forEach(pos => {
                let newColor: Colors;
                do {
                    newColor = getRandColor();
                    // new color shouldn`t do match
                } while (
                    (pos.row > 1 && newColor === normalizedField[pos.row-1][pos.col] && newColor === normalizedField[pos.row-2][pos.col]) ||
                    (pos.row < fieldSize-2 && newColor === normalizedField[pos.row+1][pos.col] && newColor === normalizedField[pos.row+2][pos.col]) ||
                    (pos.col > 1 && newColor === normalizedField[pos.row][pos.col-1] && newColor === normalizedField[pos.row][pos.col-2]) ||
                    (pos.col < fieldSize-2 && newColor === normalizedField[pos.row][pos.col+1] && newColor === normalizedField[pos.row][pos.col+2])
                );
                
                normalizedField[pos.row][pos.col] = newColor;
            });
        }
    }
    
    return normalizedField;
}
import { Colors, States } from "./block-states";

export function normalizeField(field: Colors[][], fieldSize: number): Colors[][] {
    let hasMatches = true;
    // Создаем глубокую копию поля
    let normalizedField = field.map(row => [...row]);
    
    while (hasMatches) {
        hasMatches = false;
        const replacePositions: {row: number, col: number}[] = [];
        
        // Поиск совпадений
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                // Проверка вертикальных совпадений (3 в столбце)
                if (i - 1 >= 0 && i + 1 < fieldSize) {
                    if (normalizedField[i][j] === normalizedField[i-1][j] && 
                        normalizedField[i][j] === normalizedField[i+1][j]) {
                        replacePositions.push({row: i, col: j});
                        hasMatches = true;
                    }
                }
                
                // Проверка горизонтальных совпадений (3 в строке)
                if (j - 1 >= 0 && j + 1 < fieldSize) {
                    if (normalizedField[i][j] === normalizedField[i][j-1] && 
                        normalizedField[i][j] === normalizedField[i][j+1]) {
                        replacePositions.push({row: i, col: j});
                        hasMatches = true;
                    }
                }
            }
        }
        
        // Замена совпадающих блоков
        if (hasMatches) {
            replacePositions.forEach(pos => {
                let newColor: Colors;
                do {
                    newColor = getRandColor();
                    // Убедимся, что новый цвет не создает новых совпадений
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

// Вспомогательная функция для получения случайного цвета
function getRandColor(): Colors {
    const colorValues = Object.values(Colors);
    const randomIndex = Math.floor(Math.random() * colorValues.length);
    return colorValues[randomIndex];
}
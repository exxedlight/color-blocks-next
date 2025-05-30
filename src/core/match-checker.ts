import { Colors, States } from "./block-states";

type Field = Colors[][];
type StatesField = States[][];

export function applyGravity(field: Field, states: StatesField): { newField: Field, newStates: StatesField } {
    const size = field.length;
    const newField = field.map(row => [...row]);
    const newStates = states.map(row => [...row]);

    for (let col = 0; col < size; col++) {
        let emptyRow = size - 1;
        
        // Проходим снизу вверх
        for (let row = size - 1; row >= 0; row--) {
            if (newStates[row][col] !== States.Destroyed) {
                // Если блок не уничтожен, перемещаем его вниз
                if (row !== emptyRow) {
                    newField[emptyRow][col] = newField[row][col];
                    newStates[emptyRow][col] = newStates[row][col];
                    newField[row][col] = getRandColor(); // Временное значение
                    newStates[row][col] = States.Destroyed;
                }
                emptyRow--;
            }
        }
    }

    return { newField, newStates };
}

export function checkMatches(field: Field, states: StatesField): { 
    newField: Field, 
    newStates: StatesField, 
    hasMatches: boolean 
} {
    const size = field.length;
    const newField = field.map(row => [...row]);
    const newStates = states.map(row => [...row]);
    let hasMatches = false;

    // Проверка горизонтальных совпадений (3+ в ряд)
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size - 2; col++) {
            if (newStates[row][col] !== States.Destroyed &&
                newField[row][col] === newField[row][col + 1] && 
                newField[row][col] === newField[row][col + 2]) {
                
                // Помечаем всю серию одинаковых блоков
                let matchLength = 3;
                while (col + matchLength < size && 
                       newField[row][col] === newField[row][col + matchLength]) {
                    matchLength++;
                }
                
                for (let i = 0; i < matchLength; i++) {
                    newStates[row][col + i] = States.Destroyed;
                }
                
                hasMatches = true;
                col += matchLength - 1; // Пропускаем проверенные блоки
            }
        }
    }

    // Проверка вертикальных совпадений (3+ в столбце)
    for (let col = 0; col < size; col++) {
        for (let row = 0; row < size - 2; row++) {
            if (newStates[row][col] !== States.Destroyed &&
                newField[row][col] === newField[row + 1][col] && 
                newField[row][col] === newField[row + 2][col]) {
                
                let matchLength = 3;
                while (row + matchLength < size && 
                       newField[row][col] === newField[row + matchLength][col]) {
                    matchLength++;
                }
                
                for (let i = 0; i < matchLength; i++) {
                    newStates[row + i][col] = States.Destroyed;
                }
                
                hasMatches = true;
                row += matchLength - 1;
            }
        }
    }

    return { newField, newStates, hasMatches };
}

export function restoreDestroyedBlocks(field: Field, states: StatesField): { 
    newField: Field, 
    newStates: StatesField 
} {
    // Сначала применяем гравитацию
    const { newField: fieldAfterGravity, newStates: statesAfterGravity } = applyGravity(field, states);
    
    const size = field.length;
    const newField = fieldAfterGravity.map(row => [...row]);
    const newStates = statesAfterGravity.map(row => [...row]);

    // Затем заполняем пустые места сверху
    for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
            if (newStates[row][col] === States.Destroyed) {
                newField[row][col] = getRandColor();
                newStates[row][col] = States.Restored;
            }
        }
    }

    return { newField, newStates };
}

function getRandColor(): Colors {
    const colorValues = Object.values(Colors);
    const randomIndex = Math.floor(Math.random() * colorValues.length);
    return colorValues[randomIndex];
}
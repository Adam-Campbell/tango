import "./style.css";
import {
    Cell,
    Grid,
    Position,
    Constraint,
    ConstraintConfiguration,
    PuzzleState,
} from "./types";
import { LogicalSolver } from "./logicalSolver";
import { INITIAL_STATES } from "./data";

/**
 * It might actually be nicer to split this up into checking row and column separately.
 * So checkRow could check adjacency and balance for the row, and likewise checkColumn for column.
 */

/**
 * Checks if a cell is adjacent to two other cells of the same value, either horizontally
 * or vertically.
 * @param grid
 * @param rowNum
 * @param colNum
 * @returns
 */
function checkAdjacency(grid: Grid, rowNum: number, colNum: number): boolean {
    const cell = grid[rowNum][colNum];

    const left1 = grid[rowNum]?.[colNum - 1] ?? -1;
    const left2 = grid[rowNum]?.[colNum - 2] ?? -1;
    const right1 = grid[rowNum]?.[colNum + 1] ?? -1;
    const right2 = grid[rowNum]?.[colNum + 2] ?? -1;
    if (left1 === cell && left2 === cell) return false;
    if (right1 === cell && right2 === cell) return false;
    if (left1 === cell && right1 === cell) return false;

    const up1 = grid[rowNum - 1]?.[colNum] ?? -1;
    const up2 = grid[rowNum - 2]?.[colNum] ?? -1;
    const down1 = grid[rowNum + 1]?.[colNum] ?? -1;
    const down2 = grid[rowNum + 2]?.[colNum] ?? -1;
    if (up1 === cell && up2 === cell) return false;
    if (down1 === cell && down2 === cell) return false;
    if (up1 === cell && down1 === cell) return true;

    return true;
}

/**
 * Checks if a cell is part of a row or column with more than 3 of the same value.
 * @param grid
 * @param rowNum
 * @param colNum
 * @returns
 */
function checkBalance(grid: Grid, rowNum: number, colNum: number): boolean {
    const row = grid[rowNum];
    let sunsInRow = 0;
    let moonsInRow = 0;
    for (const el of row) {
        if (el === 1) {
            sunsInRow++;
        } else if (el === 2) {
            moonsInRow++;
        }
    }
    if (sunsInRow > 3 || moonsInRow > 3) return false;

    const col = grid.map((row) => row[colNum]);
    let sunsInCol = 0;
    let moonsInCol = 0;
    for (const el of col) {
        if (el === 1) {
            sunsInCol++;
        } else if (el === 2) {
            moonsInCol++;
        }
    }
    if (sunsInCol > 3 || moonsInCol > 3) return false;

    return true;
}

/**
 * Checks if a constraint is satisfied by the current grid.
 * @param grid
 * @param constraint
 * @returns
 */
function checkConstraint(grid: Grid, constraint: Constraint): boolean {
    const [cellPosition1, cellPosition2] = constraint.cells;
    const [row1, col1] = cellPosition1;
    const [row2, col2] = cellPosition2;
    const cell1 = grid[row1][col1];
    const cell2 = grid[row2][col2];
    if (constraint.type === "EQUAL") {
        return cell1 === 0 || cell2 === 0 || cell1 === cell2;
    } else if (constraint.type === "OPPOSITE") {
        return cell1 === 0 || cell2 === 0 || cell1 !== cell2;
    }
    // We shouldn't ever hit this, but leaving it here just in case.
    return true;
}

/**
 * Checks if the current puzzle state is valid, by checking all cells for adjacency and balance,
 * and all constraints for satisfaction.
 * @param puzzleState
 * @returns
 */
function isPuzzleValid(puzzleState: PuzzleState): {
    valid: boolean;
    errors: Position[];
} {
    const { grid, constraints } = puzzleState;
    const errors: Position[] = [];

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const cellPosition: Position = [row, col];
            if (!checkAdjacency(grid, row, col)) errors.push(cellPosition);
            if (!checkBalance(grid, row, col)) errors.push(cellPosition);
        }
    }

    for (const constraint of constraints) {
        if (!checkConstraint(grid, constraint)) {
            errors.push(...constraint.cells);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Returns a random sample of k distinct elements from population. Essentially a simplified
 * version of Python's random.sample.
 * @param population
 * @param k
 * @returns
 */
function sample<T>(population: Array<T>, k: number): Array<T> {
    if (k === 0) {
        throw new Error("k must be non-zero");
    }
    if (k > population.length) {
        throw new Error("k cannot be greater than population size");
    }
    let remainingPopulation = [...population];
    let chosen = [];
    for (let i = 0; i < k; i++) {
        const idx = Math.floor(Math.random() * remainingPopulation.length);
        chosen.push(remainingPopulation[idx]);
        remainingPopulation.splice(idx, 1);
    }
    return chosen;
}

/**
 * Generates a row with 3 suns and 3 moons in random positions. The row is guaranteed to be
 * balanced, but is not guaranteed to satisfy the adjacency requirement.
 * @returns
 */
function getConfiguredRow(): Cell[] {
    const suns = sample([0, 1, 2, 3, 4, 5], 3);
    let row: Cell[] = Array(6).fill(2);
    suns.forEach((idx) => (row[idx] = 1));
    return row;
}

console.log(getConfiguredRow());

/**
 * Generates a valid complete grid by repeatedly generating rows until a valid grid is found.
 * Each row is retried a maximum of MAX_ROW_RETRIES times. If a row which results in a valid
 * grid is not found after MAX_ROW_RETRIES, the grid is reset and the process starts again.
 * If a valid grid is not found after MAX_TOTAL_RETRIES, null is returned.
 *
 * This is somewhat of a placholder implementation, I do not yet know what the final implementation
 * will look like.
 * @returns
 */
function generateValidCompleteGrid(): Grid | null {
    const MAX_TOTAL_RETRIES = 25;
    const MAX_ROW_RETRIES = 25;
    let currentTotalRetries = 0;
    let currentAssignedRows = 0;
    let grid: Grid = [];

    while (currentAssignedRows < 6 && currentTotalRetries < MAX_TOTAL_RETRIES) {
        let currentRowRetries = 0;
        while (currentRowRetries < MAX_ROW_RETRIES) {
            const row = getConfiguredRow();
            grid.push(row);
            const constraints: Constraint[] = []; // placeholder
            const validityCheck = isPuzzleValid({ grid, constraints });
            if (validityCheck.valid) {
                currentAssignedRows++;
                break;
            } else {
                grid.pop();
                currentRowRetries++;
            }
        }
        if (currentRowRetries >= MAX_ROW_RETRIES) {
            grid = [];
            currentAssignedRows = 0;
        }
    }

    if (grid.length === 6) {
        return grid;
    } else {
        return null;
    }
}

//console.log(generateValidCompleteGrid());

const CONSTRAINT_CONFIGURATION_ONE: ConstraintConfiguration = [
    [
        [2, 0],
        [1, 0],
    ],
    [
        [1, 0],
        [0, 0],
    ],
    [
        [0, 0],
        [0, 1],
    ],
    [
        [5, 3],
        [5, 4],
    ],
    [
        [5, 4],
        [5, 5],
    ],
    [
        [5, 5],
        [4, 5],
    ],
    [
        [0, 4],
        [1, 4],
    ],
    [
        [4, 0],
        [4, 1],
    ],
];

const CONSTRAINT_CONFIGURATION_TWO: ConstraintConfiguration = [
    [
        [2, 2],
        [2, 3],
    ],
    [
        [2, 3],
        [3, 3],
    ],
    [
        [3, 3],
        [3, 2],
    ],
    [
        [3, 2],
        [2, 2],
    ],
    [
        [0, 1],
        [0, 2],
    ],
    [
        [0, 2],
        [0, 3],
    ],
    [
        [0, 3],
        [0, 4],
    ],
    [
        [5, 1],
        [5, 2],
    ],
    [
        [5, 2],
        [5, 3],
    ],
    [
        [5, 3],
        [5, 4],
    ],
];

const CONSTRAINT_CONFIGURATION_THREE: ConstraintConfiguration = [
    [
        [0, 0],
        [1, 0],
    ],
    [
        [1, 0],
        [2, 0],
    ],
    [
        [2, 0],
        [2, 1],
    ],
    [
        [2, 1],
        [3, 1],
    ],
    [
        [0, 5],
        [1, 5],
    ],
    [
        [1, 5],
        [2, 5],
    ],
    [
        [2, 5],
        [2, 4],
    ],
    [
        [2, 4],
        [3, 4],
    ],
    [
        [4, 2],
        [4, 3],
    ],
    [
        [5, 2],
        [5, 3],
    ],
];

const CONSTRAINT_CONFIGURATIONS: ConstraintConfiguration[] = [
    CONSTRAINT_CONFIGURATION_ONE,
    CONSTRAINT_CONFIGURATION_TWO,
    CONSTRAINT_CONFIGURATION_THREE,
];

function generateCompleteValidPuzzle(): PuzzleState {
    const grid = generateValidCompleteGrid();
    if (grid === null) {
        throw new Error("Failed to generate grid");
    }
    const constraintConfiguration: ConstraintConfiguration =
        CONSTRAINT_CONFIGURATIONS[
            Math.floor(Math.random() * CONSTRAINT_CONFIGURATIONS.length)
        ];
    let constraints: Constraint[] = [];
    for (const cellPositionPair of constraintConfiguration) {
        const [cellAPosition, cellBPosition] = cellPositionPair;
        const cellAValue = grid[cellAPosition[0]][cellAPosition[1]];
        const cellBValue = grid[cellBPosition[0]][cellBPosition[1]];
        const constraintType = cellAValue === cellBValue ? "EQUAL" : "OPPOSITE";
        const constraint: Constraint = {
            type: constraintType,
            cells: cellPositionPair,
        };
        constraints.push(constraint);
    }

    return {
        grid,
        constraints,
    };
}

//console.log(generateCompleteValidPuzzle());

const solver = new LogicalSolver(INITIAL_STATES[2]);
window.solver = solver;

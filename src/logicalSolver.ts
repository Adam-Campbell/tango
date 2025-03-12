import { PuzzleState, Constraint, Cell, Position } from "./types";

/**
 * Basic solving strategies
 *
 *  Constraint (basic):
 *  (i)
 *   If two cells have an EQUAL constraint on them and one of them has value A, then so
 *   does the other.
 *  (ii)
 *   If two cells have an OPPOSITE contstraint on them and one of them has value A, then the
 *   other has value B.
 *
 * Balance:
 *  (i)
 *   If any row or column contains 3 cells of value A, you can fill in the remaining
 *   spaces with value B.
 *  (ii)
 *   If a row or column contains an EQUALS and there are already two cells with value A in the
 *   row/col, then the EQUALS cells must both have value B.
 *  (iii)
 *   If a row/col already contains two cells of value A, and it has an OPPOSITE constraint,
 *   then any other cells (other than the first two mentioned and the cells involved in the
 *   OPPOSITE constraint) must have value B.
 *  (iv)
 *   If a row/col has a chain of two OPPOSITE constraints (thus involving three cells), and
 *   two cells that are not involved in this chain which both have value A, then the middle
 *   cell in the chain has value A and the two outer cells in the chain have value B.
 *
 * Adjacency:
 *  (i)
 *   If there are two adjacent cells with value A, then the cells either side of them must
 *   have value B.
 *  (ii)
 *   If there are two cells with value A and a gap of one cell between them, then that cell
 *   must have value B.
 *  (iii)
 *   If a row/col has an EQUAL constraint and if the cell either directly before or after the
 *   two cells involved in this constraint has value A, then the two cells involved in the
 *   EQUAL constraint both have value B.
 *
 *
 * Early pseudocode/logic:
 *
 * Checking a constraint:
 * Just iterate over constraints, and look for any where we have the
 * value for one cell but not the other - in such a case, we can instantly deduce the value of the
 * other cell.
 *
 *
 * Balance:
 * (i)
 * Count up values of A and B; if either reaches 3, then fill in any blank cells with the other.
 * (ii)
 * Count up values of A. If count_A >= 2 and there is blank EQUALS constraint, then the cells in
 * the EQUALS constraint each have value B.
 * Follow similar logic to work with count of B rather than A.
 * (iii)
 * If count_A == 2 and row/col has blank OPPOSITE constraint, then any currently blank cells
 * not involved in the constraint have value B.
 * Follow similar logic to work with count_B.
 * (iv)
 * If count_A == 2 and row/col has blank chain of two adjacent OPPOSITE constraints, then
 * the middle cell in the chain has value A, and every remaining cell in the row/col has value B.
 * Follow similar logic to work with count_B.
 *
 * Adjacency:
 * (i)
 * Use sliding window of two cells to find adjacent pairs with value A, and instantly deduce that
 * the cells before and after (where applicable) have value B.
 * Follow similar logic for working with value B.
 * (ii)
 * Use sliding window of three cells to identify adjacent cells with pattern "A blank A", and
 * instantly deduce that blank is B.
 * Follow similar logic for working with value B.
 * (iii)
 * Iterate over all constraints that have type EQUAL, and for each one look at the cells
 * before and after it. If either of those cells has value A, then the cells involved in the
 * constraint each have value B.
 * Follow similar logic for working with value B.
 *
 *
 * So, what is the public interface of the LogicalSolver?
 *
 * We want to use it to solve a specific puzzle, so we give it the puzzle in its constructor:
 *     solver = new LogicalSolver(myPuzzleInstance)
 * Then, we just want it to solve the puzzle (or let us know that it can't be solved), and we
 * don't really care how it does this. So we call:
 *     solver.solve()
 * Should the output of solve() be the solved puzzle, or should it just be a boolean? Or perhaps
 * even an object { isSolveable, solvedPuzzle }.
 * In any event, all of the intricacies of solving the puzzle are abstracted away by LogicalSolver.
 *
 *
 */

export class LogicalSolver {
    puzzle: PuzzleState;

    constructor(puzzle: PuzzleState) {
        this.puzzle = this.deepCopy(puzzle);
    }

    public solve(): { solvedPuzzle: PuzzleState | null; isSolvable: boolean } {
        return { isSolvable: false, solvedPuzzle: null };
    }

    public printGrid() {
        console.log(this.puzzle.grid);
    }

    /**
     * This updates this.puzzle once it finds a deduction. Perhaps it returns a boolean
     * indicating whether it was able make a deduction, so that solve() knows whether to
     * call it again or exit early.
     * @returns
     */
    public makeDeduction(): boolean {
        let deductionMade = false;
        // Perform constraints checks
        deductionMade = this.checkConstraints();
        if (deductionMade) return true;
        deductionMade = this.checkFilledCellsEqualsConflict();
        if (deductionMade) return true;
        deductionMade = this.checkEqualConstraintNeighbourImplication();
        if (deductionMade) return true;
        // Perform symbol fully allocated check
        for (let i = 0; i < this.puzzle.grid.length; i++) {
            const row = this.puzzle.grid[i];
            deductionMade = this.checkSymbolIsFullyAllocated(row, 1);
            if (deductionMade) return true;
            deductionMade = this.checkSymbolIsFullyAllocated(row, 2);
            if (deductionMade) return true;
            const col = this.getColumn(i);
            deductionMade = this.checkSymbolIsFullyAllocated(col, 1);
            if (deductionMade) return true;
            deductionMade = this.checkSymbolIsFullyAllocated(col, 2);
            if (deductionMade) return true;
        }
        // Perform adjacent matching implication checks
        for (let i = 0; i < this.puzzle.grid.length; i++) {
            const row = this.puzzle.grid[i];
            deductionMade = this.checkAdjacentMatchingImplication(row);
            if (deductionMade) return true;
            const col = this.getColumn(i);
            deductionMade = this.checkAdjacentMatchingImplication(col);
            if (deductionMade) return true;
        }
        // Perform separated matching implication checks
        for (let i = 0; i < this.puzzle.grid.length; i++) {
            const row = this.puzzle.grid[i];
            deductionMade = this.checkSeparatedMatchingImplication(row);
            if (deductionMade) return true;
            const col = this.getColumn(i);
            deductionMade = this.checkSeparatedMatchingImplication(col);
            if (deductionMade) return true;
        }
        // Return false if no deductions could be made.
        return false;
    }

    private getCell(row: number, col: number): Cell {
        return this.puzzle.grid[row][col];
    }

    private setCell(row: number, col: number, value: Cell): void {
        this.puzzle.grid[row][col] = value;
    }

    private getOppositeSymbol(cell: Cell): Cell {
        if (cell === 0) return cell;
        return cell === 1 ? 2 : 1;
    }

    /**
     * Is a proxy really the answer here, or is it overkill?
     */
    private getColumn(col: number): Cell[] {
        return new Proxy([], {
            get: (_, prop: string | symbol) => {
                if (prop === "length") {
                    return this.puzzle.grid.length;
                }
                const index = Number(prop);
                if (isNaN(index)) {
                    return undefined;
                }
                return this.puzzle.grid[index][col];
            },
            set: (_, prop: string | symbol, value: Cell) => {
                const index = Number(prop);
                if (isNaN(index)) {
                    return false;
                }
                this.puzzle.grid[index][col] = value;
                return true;
            },
        });
    }

    private getConstraintsForRow(rowIndex: number): Constraint[] {
        return this.puzzle.constraints.filter((constraint) => {
            return (
                constraint.cells[0][0] === rowIndex &&
                constraint.cells[1][0] === rowIndex
            );
        });
    }

    private getConstraintsForCol(colIndex: number): Constraint[] {
        return this.puzzle.constraints.filter((constraint) => {
            return (
                constraint.cells[0][1] === colIndex &&
                constraint.cells[1][1] === colIndex
            );
        });
    }

    /**
     * Check the constraints to see if there are any direct deductions we can make.
     */
    private checkConstraints(): boolean {
        // For each constraint, check the values of the two cells. If we know the
        // value of exactly one of them, then directly infer the value of the other.
        const { grid, constraints } = this.puzzle;
        for (const constraint of constraints) {
            const [pos1, pos2] = constraint.cells;
            const cell1 = this.getCell(...pos1);
            const cell2 = this.getCell(...pos2);
            // carry on from here
            // if both cells are empty or both are full, continue.
            if ((cell1 === 0 && cell2 === 0) || (cell1 !== 0 && cell2 !== 0)) {
                continue;
            }
            // if cell1 is non-empty, update cell2 according to constraint.type
            if (cell1 !== 0) {
                const cell2NewValue =
                    constraint.type === "EQUAL"
                        ? cell1
                        : this.getOppositeSymbol(cell1);
                this.setCell(...pos2, cell2NewValue);
                return true;
            }
            // else if cell2 is non-empty, update cell1 according to constraint.type
            else if (cell2 !== 0) {
                const cell1NewValue =
                    constraint.type === "EQUAL"
                        ? cell2
                        : this.getOppositeSymbol(cell2);
                this.setCell(...pos1, cell1NewValue);
                return true;
            }
        }
        return false;
    }

    // NOTE TO SELF: these checking method names are not pretty, but I thought it would
    // be better to give them descriptive, verbose names rather than short generic ones.
    // They are private methods anyway, so if you're reading these method names you are
    // probably debugging something and will appreciate the verbosity.

    private checkSymbolIsFullyAllocated(
        rowOrCol: Cell[],
        symbol: 1 | 2
    ): boolean {
        //debugger;
        //If any row or column contains 3 cells of value A, you can fill in the remaining
        //spaces with value B.
        let hasChanged = false;
        let count = 0;
        for (let i = 0; i < rowOrCol.length; i++) {
            const cellValue = Number(rowOrCol[i]);
            if (cellValue === symbol) {
                count++;
            }
        }
        //const count = rowOrCol.filter((cell) => cell === symbol).length;
        if (count === 3) {
            const oppositeSymbol = this.getOppositeSymbol(symbol);
            for (let i = 0; i < rowOrCol.length; i++) {
                if (rowOrCol[i] === 0) {
                    rowOrCol[i] = oppositeSymbol;
                    hasChanged = true;
                }
            }
        }
        return hasChanged;
    }

    private checkFilledCellsEqualsConflict(): boolean {
        // If a row or column contains an EQUALS and there are already two cells with value A in the
        // row/col, then the EQUALS cells must both have value B.
        // First iterate over constraints and grab the "EQUALS" constraints.
        // Then for each "EQUALS" constraint:
        // Determine if constraint is horizontal or vertical (row or column)
        // Determine if row/col already has two of relevant symbol.
        // OR, do we start off by looking at a specific row/col, and then find any constraints
        // contained entirely in that row/col?
        const emptyEqualsConstraints = this.puzzle.constraints.filter(
            (constraint) => {
                const [pos1, pos2] = constraint.cells;
                return (
                    constraint.type === "EQUAL" &&
                    this.getCell(...pos1) === 0 &&
                    this.getCell(...pos2) === 0
                );
            }
        );
        // for constraint,
        // if hoizontal, grab row. Check if either symbol has >= 2 in row.
        // set constraint cells accordingly.
        // else if vertical, do same but for column.
        for (const constraint of emptyEqualsConstraints) {
            const [pos1, pos2] = constraint.cells;
            const isHorizontal = pos1[0] === pos2[0];
            if (isHorizontal) {
                const row = this.puzzle.grid[pos1[0]];
                let symbolOneCount = 0;
                let symbolTwoCount = 0;
                for (let i = 0; i < row.length; i++) {
                    const el = row[i];
                    if (el === 1) {
                        symbolOneCount++;
                    } else if (el === 2) {
                        symbolTwoCount++;
                    }
                }
                if (symbolOneCount >= 2) {
                    row[pos1[1]] = 2;
                    row[pos2[1]] = 2;
                    return true;
                } else if (symbolTwoCount >= 2) {
                    row[pos1[1]] = 1;
                    row[pos2[1]] = 1;
                    return true;
                }
                // Else cells are vertical
            } else {
                const col = this.getColumn(pos1[1]);
                let symbolOneCount = 0;
                let symbolTwoCount = 0;
                for (let i = 0; i < col.length; i++) {
                    const el = col[i];
                    if (el === 1) {
                        symbolOneCount++;
                    } else if (el === 2) {
                        symbolTwoCount++;
                    }
                }
                if (symbolOneCount >= 2) {
                    col[pos1[0]] = 2;
                    col[pos2[0]] = 2;
                    return true;
                } else if (symbolTwoCount >= 2) {
                    col[pos1[0]] = 1;
                    col[pos2[0]] = 1;
                    return true;
                }
            }
        }
        return false;
    }

    private checkFilledCellsOppositeImplication() {
        // If a row/col already contains two cells of value A, and it has an OPPOSITE constraint,
        // then any other cells (other than the first two mentioned and the cells involved in the
        // OPPOSITE constraint) must have value B.
    }

    private checkFilledCellsOppositeChainImplication() {
        // If a row/col has a chain of two OPPOSITE constraints (thus involving three cells), and
        // two cells that are not involved in this chain which both have value A, then the middle
        // cell in the chain has value A and the two outer cells in the chain have value B.
    }

    private checkAdjacentMatchingImplication(rowOrCol: Cell[]): boolean {
        // If there are two adjacent cells with value A, then the cells either side of them must
        // have value B.
        //debugger;
        let index1 = 0;
        let index2 = 1;
        while (index2 < rowOrCol.length) {
            const cellsMatch =
                rowOrCol[index1] === rowOrCol[index2] && rowOrCol[index1] !== 0;
            if (cellsMatch) {
                const oppositeSymbol = this.getOppositeSymbol(rowOrCol[index1]);
                let hasChanged = false;
                if (index1 > 0 && rowOrCol[index1 - 1] === 0) {
                    rowOrCol[index1 - 1] = oppositeSymbol;
                    hasChanged = true;
                } else if (
                    index2 < rowOrCol.length - 1 &&
                    rowOrCol[index2 + 1] === 0
                ) {
                    rowOrCol[index2 + 1] = oppositeSymbol;
                    hasChanged = true;
                }
                if (hasChanged) return true;
            }
            index1++;
            index2++;
        }
        return false;
    }

    private checkSeparatedMatchingImplication(rowOrCol: Cell[]): boolean {
        // If there are two cells with value A and a gap of one cell between them, then that cell
        // must have value B.
        let index1 = 0;
        let index2 = 1;
        let index3 = 2;
        while (index3 < rowOrCol.length) {
            const outerCellsMatch =
                rowOrCol[index1] === rowOrCol[index3] && rowOrCol[index1] !== 0;
            if (outerCellsMatch && rowOrCol[index2] === 0) {
                rowOrCol[index2] = this.getOppositeSymbol(rowOrCol[index1]);
                return true;
            }
            index1++;
            index2++;
            index3++;
        }
        return false;
    }

    private checkEqualConstraintNeighbourImplication(): boolean {
        // If a row/col has an EQUAL constraint and if the cell either directly before or after the
        // two cells involved in this constraint has value A, then the two cells involved in the
        // EQUAL constraint both have value B.
        const emptyEqualsConstraints = this.puzzle.constraints.filter(
            (constraint) => {
                const [pos1, pos2] = constraint.cells;
                return (
                    constraint.type === "EQUAL" &&
                    this.getCell(...pos1) === 0 &&
                    this.getCell(...pos2) === 0
                );
            }
        );
        for (const constraint of emptyEqualsConstraints) {
            const [pos1, pos2] = constraint.cells;
            const isHorizontal = pos1[0] === pos2[0];
            if (isHorizontal) {
                const row = this.puzzle.grid[pos1[0]];
                const startIndex = Math.min(pos1[1], pos2[1]);
                const endIndex = Math.max(pos1[1], pos2[1]);
                if (startIndex > 0 && row[startIndex - 1] !== 0) {
                    const oppositeSymbol = this.getOppositeSymbol(
                        row[startIndex - 1]
                    );
                    row[startIndex] = oppositeSymbol;
                    row[endIndex] = oppositeSymbol;
                    return true;
                } else if (
                    endIndex < row.length - 1 &&
                    row[endIndex + 1] !== 0
                ) {
                    const oppositeSymbol = this.getOppositeSymbol(
                        row[endIndex + 1]
                    );
                    row[startIndex] = oppositeSymbol;
                    row[endIndex] = oppositeSymbol;
                    return true;
                }
                // Else cells are vertical
            } else {
                const col = this.getColumn(pos1[1]);
                const startIndex = Math.min(pos1[0], pos2[0]);
                const endIndex = Math.max(pos1[0], pos2[0]);
                if (startIndex > 0 && col[startIndex - 1] !== 0) {
                    const oppositeSymbol = this.getOppositeSymbol(
                        col[startIndex - 1]
                    );
                    col[startIndex] = oppositeSymbol;
                    col[endIndex] = oppositeSymbol;
                    return true;
                } else if (
                    endIndex < col.length - 1 &&
                    col[endIndex + 1] !== 0
                ) {
                    const oppositeSymbol = this.getOppositeSymbol(
                        col[endIndex + 1]
                    );
                    col[startIndex] = oppositeSymbol;
                    col[endIndex] = oppositeSymbol;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Just returns a deepCopy of whatever input you give it (providing the input
     * serialisable).
     * @param input
     * @returns
     */
    private deepCopy<T>(input: T): T {
        return JSON.parse(JSON.stringify(input));
    }
}

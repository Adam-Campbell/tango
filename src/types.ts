export type Cell = 0 | 1 | 2;
export type Grid = Cell[][];
export type Position = [number, number];
export type Constraint = {
    type: "EQUAL" | "OPPOSITE";
    cells: Position[];
};

export type PuzzleState = {
    grid: Grid;
    constraints: Constraint[];
};

// A ConstraintConfiguration is a mapping of the positions of a set of
// constraints on a puzzle, but it doesn't specify the constraint type;
// this is not known until the constraints are applied to a particular grid.
export type ConstraintConfiguration = Position[][];

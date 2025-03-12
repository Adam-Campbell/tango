import { PuzzleState } from "./types";

const INITIAL_STATE_ONE: PuzzleState = {
    grid: [
        [0, 0, 0, 2, 0, 1],
        [0, 0, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 2],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ],
    constraints: [
        {
            type: "EQUAL",
            cells: [
                [3, 0],
                [3, 1],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [3, 1],
                [3, 2],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [3, 0],
                [4, 0],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [3, 2],
                [4, 2],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [4, 0],
                [5, 0],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [4, 2],
                [5, 2],
            ],
        },
    ],
};

const INITIAL_STATE_TWO: PuzzleState = {
    grid: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 2, 2, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 2, 0],
        [0, 0, 1, 1, 0, 0],
    ],
    constraints: [
        {
            type: "EQUAL",
            cells: [
                [0, 1],
                [0, 2],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [0, 3],
                [0, 4],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [1, 0],
                [2, 0],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [2, 0],
                [3, 0],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [1, 5],
                [2, 5],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [2, 5],
                [3, 5],
            ],
        },
    ],
};

const INITIAL_STATE_THREE: PuzzleState = {
    grid: [
        [0, 0, 2, 1, 0, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 2, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ],
    constraints: [
        {
            type: "OPPOSITE",
            cells: [
                [3, 1],
                [3, 2],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [3, 3],
                [3, 4],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [4, 1],
                [5, 1],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [4, 4],
                [5, 4],
            ],
        },
    ],
};

const INITIAL_STATE_FOUR: PuzzleState = {
    grid: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ],
    constraints: [
        {
            type: "EQUAL",
            cells: [
                [2, 0],
                [3, 0],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [1, 0],
                [2, 0],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [1, 0],
                [1, 1],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [1, 1],
                [1, 2],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [1, 2],
                [1, 3],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [0, 3],
                [1, 3],
            ],
        },

        {
            type: "OPPOSITE",
            cells: [
                [4, 2],
                [5, 2],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [4, 2],
                [4, 3],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [4, 3],
                [4, 4],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [4, 4],
                [4, 5],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [3, 5],
                [4, 5],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [2, 5],
                [3, 5],
            ],
        },
    ],
};

const INITIAL_STATE_FIVE: PuzzleState = {
    grid: [
        [0, 2, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0],
    ],
    constraints: [
        {
            type: "EQUAL",
            cells: [
                [1, 0],
                [2, 0],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [2, 0],
                [3, 0],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [3, 0],
                [3, 1],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [1, 2],
                [2, 2],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [1, 2],
                [1, 3],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [1, 3],
                [2, 3],
            ],
        },

        {
            type: "OPPOSITE",
            cells: [
                [2, 2],
                [2, 3],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [1, 5],
                [2, 5],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [2, 5],
                [3, 5],
            ],
        },
        {
            type: "OPPOSITE",
            cells: [
                [3, 4],
                [3, 5],
            ],
        },
        {
            type: "EQUAL",
            cells: [
                [5, 2],
                [5, 3],
            ],
        },
    ],
};

export const INITIAL_STATES = [
    INITIAL_STATE_ONE,
    INITIAL_STATE_TWO,
    INITIAL_STATE_THREE,
    INITIAL_STATE_FOUR,
    INITIAL_STATE_FIVE,
];

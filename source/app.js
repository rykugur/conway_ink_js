import React, {useCallback, useRef, useState} from 'react';
import {Box, Text} from 'ink';
import useInterval from './useInterval.js';

// Directions: N, S, E, W, NE, NW, SE, SW
const operations = [
	[0, 1], // right
	[0, -1], // left
	[1, -1], // top left
	[-1, 1], // top right
	[1, 1], // top
	[-1, -1], // bottom
	[1, 0], // bottom right
	[-1, 0], // bottom left
];

const generateRandomGrid = (numRows, numCols) => {
	const rows = [];
	for (let row = 0; row < numRows; row++) {
		rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
	}
	return rows;
};

const TextLabel = ({label, value}) => (
	<Box flexDirection="row">
		<Text color="green">{label}</Text>
		<Text>{value}</Text>
	</Box>
);

const LoopCounter = ({count}) => (
	<TextLabel label={'Loop count: '} value={count} />
);

const Grid = ({grid}) =>
	grid.map((row, rowIndex) => {
		return (
			<Box flexDirection="row" key={`row-${rowIndex}`}>
				{row.map((col, colIndex) => {
					return (
						<Box flexDirection="column" key={`col-${colIndex}`}>
							<Text>{grid[rowIndex][colIndex] === 1 ? 'X' : ' '}</Text>
						</Box>
					);
				})}
			</Box>
		);
	});

export default function App({numRows = 10, numCols = 10, interval = 150}) {
	const [loopCount, setLoopCount] = useState(0);
	const [grid, setGrid] = useState(() => {
		return generateRandomGrid(numRows, numCols);
	});
	const [running, setRunning] = useState(false);
	// useRef allows us to track state without causing a re-render
	const runningRef = useRef(running);
	runningRef.current = running;
	const startedRef = useRef(false);

	const runSimulation = useCallback(grid => {
		if (!runningRef.current) {
			return;
		}

		let gridCopy = JSON.parse(JSON.stringify(grid));
		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				let neighbors = 0;

				operations.forEach(([x, y]) => {
					const newRow = i + x;
					const newCol = j + y;

					if (
						newRow >= 0 &&
						newRow < numRows &&
						newCol >= 0 &&
						newCol < numCols
					) {
						neighbors += grid[newRow][newCol];
					}
				});

				if (neighbors < 2 || neighbors > 3) {
					gridCopy[i][j] = 0;
				} else if (grid[i][j] === 0 && neighbors === 3) {
					gridCopy[i][j] = 1;
				}
			}
		}

		setLoopCount(previous => previous + 1);
		setGrid(gridCopy);
	}, []);

	useInterval(() => {
		runSimulation(grid);
	}, interval);

	if (!startedRef.current) {
		setRunning(true);
		startedRef.current = true;
	}

	return (
		<Box flexDirection="column">
			<LoopCounter count={loopCount} />
			{startedRef.current && <Grid grid={grid} />}
		</Box>
	);
}

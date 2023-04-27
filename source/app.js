import React, {useCallback, useRef, useState} from 'react';
import {Box, Text} from 'ink';
import useInterval from './useInterval.js';

// stretch goal: detect looping

// Directions: N, S, E, W, NE, NW, SE, SW
const operations = [
	[0, 1], // top
	[0, -1], // bottom
	[1, 0], // right
	[-1, 0], // left
	[1, 1], // top right
	[-1, 1], // top left
	[1, -1], // bottom right
	[-1, -1], // bottom left
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

const Evolving = ({isEvolving}) => {
	const color = isEvolving ? 'green' : 'red';
	const text = isEvolving ? 'Evolution is ongoing.' : 'Evolution has stopped.';
	return <Text color={color}>{text}</Text>;
};

export default function App({numRows = 10, numCols = 10, interval = 150}) {
	const [loopCount, setLoopCount] = useState(0);
	const [grid, setGrid] = useState(() => {
		return generateRandomGrid(numRows, numCols);
	});
	const [running, setRunning] = useState(false);
	const [evolving, setEvolving] = useState(null);
	// useRef allows us to track state without causing a re-render
	const runningRef = useRef(running);
	runningRef.current = running;
	const startedRef = useRef(false);

	const runSimulation = useCallback(grid => {
		if (!runningRef.current) {
			return;
		}

		setEvolving(true);

		let gridCopy = JSON.parse(JSON.stringify(grid));
		for (let row = 0; row < numRows; row++) {
			for (let col = 0; col < numCols; col++) {
				let neighbors = 0;

				operations.forEach(([x, y]) => {
					const newRow = row + x;
					const newCol = col + y;

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
					gridCopy[row][col] = 0;
				} else if (grid[row][col] === 0 && neighbors === 3) {
					gridCopy[row][col] = 1;
				}
			}
		}

		// this is wildly non-performant with larger grids
		if (JSON.stringify(grid) === JSON.stringify(gridCopy)) {
			setEvolving(false);
			setRunning(false);
			return;
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
			{startedRef.current && evolving != null && (
				<Evolving isEvolving={evolving} />
			)}
		</Box>
	);
}

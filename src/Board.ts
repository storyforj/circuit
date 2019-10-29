import { CircuitDefinition, PropertyValues } from "./CircuitDefinition";

export type Node = {
	op: string,
	input: object | null,
	connections: object | null,
	pos: {
		x: number,
		y: number,
	} | null,
};
export type Board = {
	operations: Array<Node>,
	resultOperation: number,
};

function runPartial(connectedOperationIndex: number, board: Board, operations: Record<string, CircuitDefinition>, runOperationIndexes: Array<number> = []) : any {
	if (runOperationIndexes.includes(connectedOperationIndex)) {
		throw new Error(`Board is invalid, it contains a circular definition for operation ${connectedOperationIndex}`);
	}

	const operation: Node = board.operations[connectedOperationIndex];
	const operationName: string = operation.op;
	const circuit: CircuitDefinition = operations[operationName];
	const nextRunOperationIndexes = runOperationIndexes.concat(connectedOperationIndex);
	const values = Object.assign(
		{},
		operation.input || {},
		...operation.connections ? Object.keys(operation.connections).map((inputName) => {
			const connectedOperationIndex: number = operation.connections[inputName];
			return {
				[inputName]: runPartial(
					connectedOperationIndex,
					board,
					operations,
					nextRunOperationIndexes,
				),
			};
		}) : [],
	);
	return circuit.run(values);
}

export function run(board: Board, operations: Record<string, CircuitDefinition>) : any {
	return runPartial(board.resultOperation, board, operations);
}

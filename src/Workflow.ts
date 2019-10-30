import { CodeTemplate as CodeTemplate } from "./CodeTemplate";

export type WorkflowStep = {
	template: string,
	input: object | null,
	connections: { [key: string]: number } | null,
	pos: {
		x: number,
		y: number,
	} | null,
};
export type Workflow = {
	steps: Array<WorkflowStep>,
	resultStep: number,
};

function runPartial(stepIndex: number, workflow: Workflow, codeTemplates: Record<string, CodeTemplate>, runOperationIndexes: Array<number> = []) : any {
	if (runOperationIndexes.includes(stepIndex)) {
		throw new Error(`Workflow is invalid, it contains a circular definition for step "${stepIndex}", steps run so far: ${runOperationIndexes}`);
	}

	const operation: WorkflowStep = workflow.steps[stepIndex];
	const codeTemplateName: string = operation.template;
	const template: CodeTemplate = codeTemplates[codeTemplateName];
	const nextRunOperationIndexes: Array<number> = runOperationIndexes.concat(stepIndex);
	const values = Object.assign(
		{},
		operation.input || {},
		...operation.connections ? Object.keys(operation.connections).map((inputName: string) => {
			const stepIndex: number | null = operation.connections ? operation.connections[inputName] : null;
			if (stepIndex === null) {
				throw new Error(`Workflow is invalid, step ${stepIndex} has an invalid connection for "${inputName}"`);
			}
			return {
				[inputName]: runPartial(
					stepIndex,
					workflow,
					codeTemplates,
					nextRunOperationIndexes,
				),
			};
		}) : [],
	);
	return template.run(values);
}

export function run(workflow: Workflow, templates: Record<string, CodeTemplate>) : any {
	return runPartial(workflow.resultStep, workflow, templates);
}

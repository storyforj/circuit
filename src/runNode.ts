import { CircuitDefinition, PropertyValues } from "./CircuitDefinition";

export function runNode(defintion: CircuitDefinition, propertyValues: PropertyValues | object) : string {
	return defintion.run(propertyValues);
}

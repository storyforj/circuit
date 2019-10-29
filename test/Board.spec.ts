import { expect } from 'chai';

import { run } from '../src/Board';
import { createCircuitDefinition, createPropertySet, PropertyValues, Types } from '../src/CircuitDefinition';

describe('Board', () => {
  it('runs a program tree', function() {
    const addition = createCircuitDefinition(
      createPropertySet({
        a: Types.number().required(),
        b: Types.number().required(),
      }),
      (properties: PropertyValues) : number => {
        return properties.a + properties.b;
      },
      Types.number()
    );

    const numberToString = createCircuitDefinition(
      createPropertySet({
        input: Types.number().required(),
      }),
      (properties: PropertyValues) : string => {
        return `${properties.input}`;
      },
      Types.string()
    );

    const concatStrings = createCircuitDefinition(
      createPropertySet({
        a: Types.string().required(),
        b: Types.string().required(),
      }),
      (properties: PropertyValues) : string => {
        return `${properties.a}${properties.b}`;
      },
      Types.string()
    )

    expect(
      run(
        {
          operations: [
            { op: 'addition', input: { a: 1, b: 2 }, connections: null, pos: { x: 0, y: 0 } },
            { op: 'numberToString', input: null, connections: { input: 0 }, pos: { x: 0, y: 100 } },
            { op: 'concatStrings', input: { a: 'Our result is: ' }, connections: { b: 1 }, pos: { x: 0, y: 100 } },
          ],
          resultOperation: 2,
        },
        { addition, numberToString, concatStrings },
      ),
    ).equal('Our result is: 3');
  });
});
